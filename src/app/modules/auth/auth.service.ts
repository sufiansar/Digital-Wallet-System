import AppError from "../../errors/appError";
import User from "../user/user.model";
import successCode from "http-status-codes";
import bcryptjs from "bcryptjs";
import { Iuser } from "../user/user.interface";
import {
  accessTokenAndRefreshToken,
  tokenUser,
} from "../../utilities/tokenUser";

const userLogin = async (payload: Partial<Iuser>) => {
  const { email, password } = payload;
  const isUserExits = await User.findOne({ email });

  if (!isUserExits) {
    throw new AppError(successCode.NOT_FOUND, "User not found", "");
  }

  if (
    isUserExits.isActive === "BLOCKED" ||
    isUserExits.isActive === "INACTIVE"
  ) {
    throw new AppError(
      successCode.BAD_REQUEST,
      `User is ${isUserExits.isActive}`,
      ""
    );
  }

  if (isUserExits.isDeleted) {
    throw new AppError(successCode.BAD_REQUEST, "User is deleted", "");
  }
  const isPasswordMatch = await bcryptjs.compare(
    password as string,
    isUserExits.password
  );
  if (!isPasswordMatch) {
    throw new AppError(successCode.UNAUTHORIZED, "Invalid password", "");
  }
  const userToken = tokenUser(isUserExits);

  const { password: pass, ...rest } = isUserExits.toObject();
  return {
    accessToken: userToken.accessToken,
    refreshToken: userToken.refreshToken,
    rest: rest,
  };
};

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken = await accessTokenAndRefreshToken(refreshToken);

  return {
    accessToken: newAccessToken,
  };
};
export const AuthService = {
  userLogin,
  getNewAccessToken,
};
