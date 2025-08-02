import { Request, Response } from "express";
import { catchAsycn } from "../../utilities/catchAsync";
import { JwtPayload } from "jsonwebtoken";

import { sendResponse } from "../../utilities/sendResponse";
import { transactionService } from "./transaction.service";

const getMyTransactions = catchAsycn(async (req: Request, res: Response) => {
  const userId = (req.user as JwtPayload).userId;
  const result = await transactionService.getMyTransactions(userId);
  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Transactions fetched successfully",
    data: result,
  });
});

const getAllTransactions = catchAsycn(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await transactionService.getAllTransactions(
    query as Record<string, string>
  );
  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "All transactions retrieved successfully",
    data: result,
  });
});

const getCommissionHistory = catchAsycn(async (req: Request, res: Response) => {
  const agentId = (req.user as JwtPayload).userId;
  const result = await transactionService.getCommissionHistory(agentId);
  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Commission history retrieved",
    data: result,
  });
});

export const transactionController = {
  getMyTransactions,
  getAllTransactions,
  getCommissionHistory,
};
