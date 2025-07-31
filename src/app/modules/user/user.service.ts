import { JwtPayload } from "jsonwebtoken";
import { envConfig } from "../../config/env";
import { IAuths, Iuser, Role } from "./user.interface";
import User from "./user.model";
import bycrypt from "bcryptjs";
import { Wallet } from "../wallet/wallet.model";

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

const userUpdate = async (
  userId: string,
  payload: Partial<Iuser>,
  decodedToken: JwtPayload
) => {
  const targetUser = await User.findById(userId);

  if (!targetUser) {
    throw new Error("User not found");
  }

  const requesterRole = decodedToken.role;
  const requesterId = decodedToken.userId;
  const isSelfUpdate = requesterId === userId;

  if (targetUser.role === Role.ADMIN) {
    throw new Error("You are not allowed to update an admin user");
  }

  if (requesterRole !== Role.ADMIN) {
    if (!isSelfUpdate) {
      throw new Error("You can only update your own profile");
    }

    if (payload.role && payload.role !== targetUser.role) {
      throw new Error("You are not allowed to change your role");
    }
  }

  if (requesterRole === Role.ADMIN) {
    if (payload.role && payload.role === Role.ADMIN) {
      throw new Error("Admin role cannot be assigned to anyone");
    }
  }

  if (payload.password) {
    payload.password = await bycrypt.hash(
      payload.password,
      envConfig.BCRYPT_SALT_ROUND
    );
  }

  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    throw new Error("Failed to update user");
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
  const users = await User.find({});
  const totalUser = await User.countDocuments();
  return {
    users,
    totalUser,
  };
};
export const userService = {
  createUser,
  userUpdate,
  deleteUser,
  getAllUsers,
};
