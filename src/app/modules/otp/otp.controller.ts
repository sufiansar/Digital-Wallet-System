import { Request, Response } from "express";
import { OtpService } from "./otp.service";
import { catchAsycn } from "../../utilities/catchAsync";
import { sendResponse } from "../../utilities/sendResponse";
import httpStatus from "http-status-codes";

const sendOtp = catchAsycn(async (req: Request, res: Response) => {
  const { email } = req.body;
  console.log(`Sending OTP to: ${req.body.email}`);

  await OtpService.sendOtp(email);

  sendResponse(res, {
    success: true,
    successCode: httpStatus.CREATED,
    message: "Otp Sent  Successfully",
    data: null,
  });
});

const verifyOTP = catchAsycn(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  await OtpService.verifyOTP(email, otp);
  sendResponse(res, {
    successCode: 200,
    success: true,
    message: "OTP verified successfully",
    data: null,
  });
});

export const OtpController = {
  sendOtp,
  verifyOTP,
};
