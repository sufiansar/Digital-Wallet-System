import { Request, Response } from "express";
import AppError from "../../errors/appError";
import { catchAsycn } from "../../utilities/catchAsync";
import { sendResponse } from "../../utilities/sendResponse";
import { AuthService } from "./auth.service";

import httpStatus from "http-status-codes";
import { setAuthCookie } from "../../utilities/setCookie";

const userLogin = catchAsycn(async (req: Request, res: Response) => {
  const loginInfo = await AuthService.userLogin(req.body);
  res.cookie("refreshToken", loginInfo.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  res.cookie("accessToken", loginInfo.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
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
    secure: false,
    sameSite: "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  sendResponse(res, {
    success: true,
    successCode: httpStatus.OK,
    message: "User Logged Out Successfully",
    data: null,
  });
});

export const AuthController = {
  userLogin,
  getNewAccessToken,
  logout,
};
