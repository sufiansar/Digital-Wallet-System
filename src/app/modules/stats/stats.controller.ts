import { Request, Response } from "express";
import { catchAsycn } from "../../utilities/catchAsync";
import { sendResponse } from "../../utilities/sendResponse";
import { statsService } from "./stats.service";

const getUserStats = catchAsycn(async (req: Request, res: Response) => {
  const result = await statsService.getUserStats();
  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "User statistics fetched successfully",
    data: result,
  });
});

const getWalletStats = catchAsycn(async (req: Request, res: Response) => {
  const result = await statsService.getWalletStats();
  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Wallet statistics fetched successfully",
    data: result,
  });
});

const getTransactionStats = catchAsycn(async (req: Request, res: Response) => {
  const result = await statsService.getTransactionStats();
  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Transaction statistics fetched successfully",
    data: result,
  });
});

export const statsController = {
  getUserStats,
  getWalletStats,
  getTransactionStats,
};
