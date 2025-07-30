import { JwtPayload } from "jsonwebtoken";
import { envConfig } from "../../config/env";
import { IAuths, Iuser, Role } from "./user.interface";
import User from "./user.model";
import bycrypt from "bcryptjs";

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

  return user;
};

const userUpdate = async (
  id: string,
  payload: Partial<Iuser>,
  decodedToken: JwtPayload
) => {
  const user = await User.findByIdAndUpdate(id, payload, decodedToken);
  if (payload.role === Role.ADMIN && decodedToken.role === Role.AGENT) {
    throw new Error("You are not allowed to update this user");
  }
  if (payload.role === Role.ADMIN && decodedToken.role === Role.USER) {
    throw new Error("You are not allowed to update this user");
  }
  return user;
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

const getUser = async (id: string, query: Partial<Iuser>) => {
  const user = await User.findOne({ _id: id, ...query });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const userService = {
  createUser,
  userUpdate,
  deleteUser,
  getUser,
};
