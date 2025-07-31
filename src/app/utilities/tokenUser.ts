import { JwtPayload } from "jsonwebtoken";
import { envConfig } from "../config/env";
import { Isactive, Iuser } from "../modules/user/user.interface";
import User from "../modules/user/user.model";
import { generateToken, verifyToken } from "./jwtToken";
import AppError from "../errors/appError";

import httpStatus from "http-status-codes";

export const tokenUser = (user: Partial<Iuser>) => {
  const jwtPayload = {
    email: user.email,
    userId: user._id,
    role: user.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    envConfig.JWT.JWT_ACCESS_SECRET,
    envConfig.JWT.JWT_EXPIREDATE
  );

  const refreshToken = generateToken(
    jwtPayload,
    envConfig.JWT.JWT_REFRESH_SECRET,
    envConfig.JWT.JWT_REFRESH_EXPIRES
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const accessTokenAndRefreshToken = async (refreshToken: string) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    envConfig.JWT.JWT_REFRESH_SECRET
  ) as JwtPayload;

  const isUserExist = await User.findOne({ email: verifiedRefreshToken.email });

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist", "");
  }
  if (
    isUserExist.isActive === Isactive.BLOCKED ||
    isUserExist.isActive === Isactive.INACTIVE
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `User is ${isUserExist.isActive}`,
      ""
    );
  }
  if (isUserExist.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is deleted", "");
  }

  const jwtPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };
  const accessToken = generateToken(
    jwtPayload,
    envConfig.JWT.JWT_ACCESS_SECRET,
    envConfig.JWT.JWT_EXPIREDATE
  );

  return accessToken;
};
