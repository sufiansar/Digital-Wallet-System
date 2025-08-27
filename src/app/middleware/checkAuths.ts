import { NextFunction, Request, Response } from "express";
import AppError from "../errors/appError";
import { verifyToken } from "../utilities/jwtToken";

import { envConfig } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import User from "../modules/user/user.model";
import { Isactive } from "../modules/user/user.interface";
import httpStatus from "http-status-codes";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = req.cookies.accessToken || req.headers.authorization;

      if (!accessToken) {
        throw new AppError(403, "No Token Recieved", "");
      }

      const verifiedToken = verifyToken(
        accessToken,
        envConfig.JWT.JWT_ACCESS_SECRET
      ) as JwtPayload;

      const isUserExist = await User.findOne({ email: verifiedToken.email });

      if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist", "");
      }
      if (!isUserExist.isVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is not verified", "");
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      next(error);
    }
  };
