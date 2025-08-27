import { JwtPayload } from "jsonwebtoken";
import { envConfig } from "../../config/env";
import { IAuths, Isactive, Iuser, Role } from "./user.interface";
import User from "./user.model";
import bycrypt from "bcryptjs";
import { Wallet } from "../wallet/wallet.model";
import { QueryBuilder } from "../../utilities/QueryBuilder";

import AppError from "../../errors/appError";

const createUser = async (payload: Partial<Iuser>) => {
  const { email, password, ...rest } = payload;
  const isEmailExists = await User.findOne({ email });
  if (isEmailExists) {
    throw new Error("Email already exists");
  }

  const hashPassword = await bycrypt.hash(
    password as string,
    Number(envConfig.BCRYPT_SALT_ROUND)
  );
  const authProviders: IAuths = {
    provider: "credentials",
    providerId: email as string,
  };
  //   console.log(authProviders);
  const user = await User.create({
    email,
    password: hashPassword,
    auths: [authProviders],
    ...rest,
  });

  if (user.role === "ADMIN") {
    await Wallet.create({
      user: user._id,
      balance: 0,
    });
  }
  if (user.role === "USER" || user.role === "AGENT") {
    await Wallet.create({
      user: user._id,
      balance: 50,
    });
  }

  return user;
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  return {
    data: user,
  };
};

const updateUser = async (
  userId: string,
  payload: Partial<Iuser>,
  decodedToken: JwtPayload
) => {
  const targetUser = await User.findById(userId);

  if (!targetUser) {
    throw new AppError(404, "User not found", "");
  }

  const requesterRole = decodedToken.role;
  const requesterId = decodedToken.userId;
  const isSelfUpdate = requesterId === userId;

  // Only admin can update other users
  if (requesterRole !== Role.ADMIN && !isSelfUpdate) {
    throw new AppError(403, "You can only update your own profile", "");
  }

  // Users cannot change their role
  if (payload.role && payload.role !== targetUser.role) {
    throw new AppError(403, "You are not allowed to change your role", "");
  }

  // Hash password if provided
  if (payload.password) {
    payload.password = await bycrypt.hash(
      payload.password,
      envConfig.BCRYPT_SALT_ROUND
    );
  }

  // Update only the fields provided (name, phone, password)
  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new AppError(500, "Failed to update user", "");
  }

  return updatedUser;
};

const deleteUser = async (id: string, update: Partial<Iuser>) => {
  const user = await User.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);

  const users = await queryBuilder.search(["name", "email"]).sort().paginate();
  const [data, meta] = await Promise.all([users.build(), users.getMeta()]);

  return {
    data,
    meta,
  };
};

const getAllAgents = async (query?: Record<string, string>) => {
  const agentsFilter = { role: Role.AGENT };
  const queryBuilder = new QueryBuilder(User.find(agentsFilter), query || {});

  const agents = await queryBuilder.search(["name", "email"]).sort().paginate();
  const [data, meta] = await Promise.all([agents.build(), agents.getMeta()]);

  return {
    data,
    meta,
  };
};

const updateUserStatus = async (id: string, status: Isactive) => {
  const updated = await User.findByIdAndUpdate(
    id,
    { isActive: status },
    { new: true }
  );
  if (!updated) throw new Error("User not found");
  return updated;
};
export const blockUser = async (phone: string) => {
  const user = await User.findOne({ phone });
  if (!user) throw new Error("User not found");

  if (user.role === Role.ADMIN) {
    throw new Error("Admin users cannot be blocked");
  }
  user.isActive = Isactive.BLOCKED;
  await user.save();

  return user;
};

export const unblockUser = async (phone: string) => {
  const user = await User.findOne({ phone });
  if (!user) throw new Error("User not found");
  if (user.role === Role.ADMIN)
    throw new Error("Admin users cannot be unblocked");

  user.isActive = Isactive.ACTIVE;
  await user.save();

  return user;
};

export const setInactiveUser = async (phone: string) => {
  if (!phone) throw new Error("Phone number is required");

  const user = await User.findOne({ phone });
  if (!user) throw new Error("User not found");

  user.isActive = Isactive.INACTIVE; // use enum value
  await user.save();

  return user;
};

export const userService = {
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
  updateUserStatus,
  getMe,
  blockUser,
  unblockUser,
  setInactiveUser,
  getAllAgents,
};
