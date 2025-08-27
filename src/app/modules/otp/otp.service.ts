import crypto from "crypto";
import { User } from "../user/user.model";
import AppError from "../../errors/appError";
import { sendEmail } from "../../utilities/sendMail";
import httpStatus from "http-status-codes";
import { redisClient } from "../../config/radis.config";

const OTP_EXPIREATION = 2 * 60;

const generateOtp = (length = 6) => {
  const otp = crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
  return otp;
};

const sendOtp = async (email: string) => {
  const user = await User.findOne({ email });
  console.log(user);

  if (!user) {
    throw new AppError(404, "User not found", "");
  }
  const otp = generateOtp();
  const redisKey = `otp:${email}`;
  console.log(`Redis Key: ${redisKey}`);
  console.log(`OTP: ${otp}`);

  await redisClient.set(redisKey, otp, {
    expiration: {
      type: "EX",
      value: OTP_EXPIREATION,
    },
  });

  console.log(redisKey);

  sendEmail({
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

  const redisKey = `otp:${email}`;

  const savedOtp = await redisClient.get(redisKey);

  if (!savedOtp) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid OTP", undefined);
  }

  if (savedOtp !== otp) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid OTP", undefined);
  }

  await Promise.all([
    User.updateOne({ email }, { isVerified: true }, { runValidators: true }),
    redisClient.del([redisKey]),
  ]);
};

export const OtpService = {
  sendOtp,
  verifyOTP,
};
