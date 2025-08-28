import { Request, Response } from "express";
import AppError from "../../errors/appError";
import { catchAsycn } from "../../utilities/catchAsync";
import { sendResponse } from "../../utilities/sendResponse";
import { AuthService } from "./auth.service";

import httpStatus from "http-status-codes";
import { setAuthCookie } from "../../utilities/setCookie";
import { JwtPayload } from "jsonwebtoken";

const userLogin = catchAsycn(async (req: Request, res: Response) => {
  const loginInfo = await AuthService.userLogin(req.body);
  res.cookie("refreshToken", loginInfo.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.cookie("accessToken", loginInfo.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  sendResponse(res, {
    success: true,
    successCode: httpStatus.OK,
    message: "User Logged In Successfully",
    data: loginInfo,
  });
});

const getNewAccessToken = catchAsycn(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "No refresh token recieved from cookies",
      ""
    );
  }
  const tokenInfo = await AuthService.getNewAccessToken(refreshToken as string);

  setAuthCookie(res, tokenInfo);

  sendResponse(res, {
    success: true,
    successCode: httpStatus.OK,
    message: "New access token generated successfully",
    data: tokenInfo,
  });
});

const logout = catchAsycn(async (req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  sendResponse(res, {
    success: true,
    successCode: httpStatus.OK,
    message: "User Logged Out Successfully",
    data: null,
  });
});

const resetPassword = catchAsycn(async (req: Request, res: Response) => {
  const decodedToken = req.user;

  await AuthService.resetPassword(req.body, decodedToken as JwtPayload);
  sendResponse(res, {
    success: true,
    successCode: httpStatus.OK,
    message: "Password Change  Succesfully",
    data: null,
  });
});

const setPassword = catchAsycn(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const { password } = req.body;

  await AuthService.setPassword(decodedToken.userId, password);
  sendResponse(res, {
    success: true,
    successCode: httpStatus.OK,
    message: "Password Change  Succesfully",
    data: null,
  });
});

const forgotPassword = catchAsycn(async (req: Request, res: Response) => {
  const { email } = req.body;

  await AuthService.forgotPassword(email);
  sendResponse(res, {
    success: true,
    successCode: httpStatus.OK,
    message: "Email Sent Succesfully",
    data: null,
  });
});
const changePassword = catchAsycn(async (req: Request, res: Response) => {
  const decodedToken = req.user;
  const newPassword = req.body.newPassword;
  const oldPassword = req.body.oldPassword;
  await AuthService.changePassword(
    decodedToken as JwtPayload,
    newPassword,
    oldPassword
  );
  sendResponse(res, {
    success: true,
    successCode: httpStatus.OK,
    message: "Password Change  Succesfully",
    data: null,
  });
});

export const AuthController = {
  userLogin,
  getNewAccessToken,
  logout,
  resetPassword,
  setPassword,
  forgotPassword,
  changePassword,
};
