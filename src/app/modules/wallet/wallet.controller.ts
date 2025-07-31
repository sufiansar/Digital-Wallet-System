import { Request, Response } from "express";
import { sendResponse } from "../../utilities/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { catchAsycn } from "../../utilities/catchAsync";
import { walletService } from "./wallet.service";

const getMyWallet = catchAsycn(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const result = await walletService.getMyWallet(user.userId);
  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Wallet fetched successfully",
    data: result,
  });
});

const getWalletById = catchAsycn(async (req: Request, res: Response) => {
  const walletId = req.params.id;
  const result = await walletService.getWalletById(walletId);
  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Wallet fetched successfully",
    data: result,
  });
});

export const walletController = {
  getMyWallet,
  getWalletById,
};
