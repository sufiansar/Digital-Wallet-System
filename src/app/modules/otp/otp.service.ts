import crypto from "crypto";
import { User } from "../user/user.model";
import AppError from "../../errors/appError";
import { sendEmail } from "../../utilities/sendMail";
import httpStatus from "http-status-codes";

const OTP_EXPIRATION_MINUTES = 2;

const generateOtp = (length = 6) => {
  const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
  return otp;
};

const sendOtp = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(404, "User not found", "");
  }
  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  await sendEmail({
    to: email,
    subject: "Your OTP Code",
    templateName: "otp",
    templateData: {
      otp: otp,
      year: new Date().getFullYear(),
      name: user.name,
    },
  });
};

const verifyOTP = async (email: string, otp: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found", undefined);
  }
  if (user.isVerified) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "You are already verified",
      undefined
    );
  }
  if (!user.otp || !user.otpExpires) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "OTP not found. Please request a new one.",
      undefined
    );
  }
  if (user.otp !== otp) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid OTP", undefined);
  }
  if (user.otpExpires < new Date()) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "OTP expired. Please request a new one.",
      undefined
    );
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;
  await user.save();
};

const sendmailContractPage = async (payload: {
  email: string;
  name: string;
  subject: string;
  message: string;
}) => {
  const { email, name, subject, message } = payload;
  await sendEmail({
    to: email,
    subject: subject,
    templateName: "contract",
    templateData: {
      name: name,
      message: message,
      subject: subject,
    },
  });
};

export const OtpService = {
  sendOtp,
  verifyOTP,
  sendmailContractPage,
};
