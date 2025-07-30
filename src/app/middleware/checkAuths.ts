import { NextFunction, Request, Response } from "express";

import { JwtPayload } from "jsonwebtoken";
import { Isactive } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import httpSuccessCode from "http-status-codes";
import AppError from "../errors/appError";
import { verifyToken } from "../utilities/jwtToken";
import { envConfig } from "../config/env";

export const checkAuth = (...authRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accecToken = req.headers.authorization;
      if (!accecToken) {
        throw new AppError(403, "Token Not found", "");
      }

      const verifiedToken = verifyToken(
        accecToken,
        envConfig.JWT.JWT_SECRET
      ) as JwtPayload;

      const isUserexit = await User.findOne({ email: verifiedToken.email });
      if (!isUserexit) {
        throw new AppError(
          httpSuccessCode.BAD_REQUEST,
          "User does not exist",
          ""
        );
      }

      if (
        isUserexit.isActive === Isactive.BLOCKED ||
        isUserexit.isActive === Isactive.INACTIVE
      ) {
        throw new AppError(
          httpSuccessCode.BAD_REQUEST,
          `User is ${isUserexit.isActive}`,
          ""
        );
      }

      if (isUserexit.isDeleted) {
        throw new AppError(httpSuccessCode.BAD_REQUEST, "User deleted", "");
      }
      if (!isUserexit.isVerified) {
        throw new AppError(403, "User Not Verified", "");
      }
      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(
          403,
          "You are not permitted to access this route",
          ""
        );
      }

      req.user = verifiedToken;
      next();
    } catch (error) {
      next(error);
    }
  };
};
