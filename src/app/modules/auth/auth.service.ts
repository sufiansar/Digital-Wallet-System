import AppError from "../../errors/appError";
import User from "../user/user.model";
import successCode from "http-status-codes";
import bcryptjs from "bcryptjs";
import { IAuths, Isactive, Iuser } from "../user/user.interface";
import {
  accessTokenAndRefreshToken,
  tokenUser,
} from "../../utilities/tokenUser";
import Jwt, { JwtPayload } from "jsonwebtoken";
import { sendEmail } from "../../utilities/sendMail";
import { envConfig } from "../../config/env";

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
  if (!isUserExits.isVerified) {
    throw new AppError(403, "User Not Verified", "");
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

const setPassword = async (userId: string, PlainPassword: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(successCode.BAD_REQUEST, "User Not Found", "");
  }

  if (
    user.password &&
    user.auths.some((providerObject) => providerObject.provider === "google")
  ) {
    throw new AppError(
      successCode.BAD_REQUEST,
      "You Have already Set Password so You Can go nOw ",
      ""
    );
  }
  const hashPassword = await bcryptjs.hash(
    PlainPassword,
    Number(envConfig.BCRYPT_SALT_ROUND)
  );

  const credentialProvider: IAuths = {
    provider: "credentials",
    providerId: user.email,
  };

  const auths: IAuths[] = [...user.auths, credentialProvider];

  user.password = hashPassword;
  user.auths = auths;

  await user.save();
};

const resetPassword = async (
  payload: Record<string, any>,
  decodedToken: JwtPayload
) => {
  if (payload.id !== decodedToken.userId) {
    throw new AppError(
      successCode.UNAUTHORIZED,
      "You cannot reset your password",
      ""
    );
  }

  const user = await User.findById(decodedToken.userId).select("+password");

  if (!user) {
    throw new AppError(successCode.NOT_FOUND, "User not found", "");
  }

  if (!payload.newPassword) {
    throw new AppError(successCode.BAD_REQUEST, "New password is required", "");
  }

  const hashPassword = await bcryptjs.hash(
    payload.newPassword,
    Number(envConfig.BCRYPT_SALT_ROUND)
  );

  user.password = hashPassword;
  await user.save();
};

const forgotPassword = async (email: string) => {
  const isUserExit = await User.findOne({ email });

  if (!isUserExit) {
    throw new AppError(successCode.BAD_REQUEST, "User does not exist", "");
  }

  if (
    isUserExit.isActive === Isactive.BLOCKED ||
    isUserExit.isActive === Isactive.INACTIVE
  ) {
    throw new AppError(
      successCode.BAD_REQUEST,
      `User is ${isUserExit.isActive}`,
      ""
    );
  }

  if (isUserExit.isDeleted) {
    throw new AppError(successCode.BAD_REQUEST, "User deleted", "");
  }
  if (!isUserExit.isVerified) {
    throw new AppError(403, "User Not Verified", "");
  }

  const jwtPayload = {
    userId: isUserExit._id,
    email: isUserExit.email,
    role: isUserExit.role,
  };

  const resetLink = Jwt.sign(jwtPayload, envConfig.JWT.JWT_ACCESS_SECRET, {
    expiresIn: "10m",
  });

  const resetUILink = `${envConfig.FRONTEND_URL}/reset-Password?id=${isUserExit._id}&token=${resetLink}`;
  sendEmail({
    to: isUserExit.email,
    subject: "Forget Password",
    templateName: "forgetPassword",
    templateData: {
      name: isUserExit.name,
      resetUILink,
    },
  });
};

const changePassword = async (
  decodedToken: JwtPayload,
  newPassword: string,
  oldPassword: string
) => {
  const user = await User.findById(decodedToken.userId);
  const isOldPasswordMatch = await bcryptjs.compare(
    oldPassword,
    // @typescript-eslint/no-non-null-assertion
    user!.password as string
  );

  if (!isOldPasswordMatch) {
    throw new AppError(
      successCode.UNAUTHORIZED,
      "Passaword does not mathch Try Agin",
      ""
    );
  }
  // @typescript-eslint/no-non-null-assertion
  user!.password = await bcryptjs.hash(
    newPassword,
    Number(envConfig.BCRYPT_SALT_ROUND)
  );
  // @typescript-eslint/no-non-null-assertion
  user!.save();
};

export const AuthService = {
  userLogin,
  getNewAccessToken,
  resetPassword,
  forgotPassword,
  changePassword,
  setPassword,
};
