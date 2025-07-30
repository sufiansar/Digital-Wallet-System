import { NextFunction, Request, Response } from "express";
import AppError from "../../errors/appError";
import User from "../user/user.model";
import successCode from "http-status-codes";
import bcryptjs from "bcryptjs";
import { Iuser } from "../user/user.interface";

import jwt from "jsonwebtoken";
import { envConfig } from "../../config/env";
import { generateToken } from "../../utilities/jwtToken";
import { env } from "process";
const userLogin = async (payload: Partial<Iuser>) => {
  const { email, password } = payload;
  const isUserExits = await User.findOne({ email });

  if (!isUserExits) {
    throw new AppError(successCode.NOT_FOUND, "User not found", "");
  }

  const isPasswordMatch = await bcryptjs.compare(
    password as string,
    isUserExits.password
  );
  if (!isPasswordMatch) {
    throw new AppError(successCode.UNAUTHORIZED, "Invalid password", "");
  }

  const jwtPayload = {
    email: isUserExits.email,
    userId: isUserExits._id,
    role: isUserExits.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    envConfig.JWT.JWT_SECRET,
    envConfig.JWT.JWT_EXPIRES_IN
  );
  return {
    accessToken,
  };
};
export const AuthService = {
  userLogin,
};
