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

const addBalance = catchAsycn(async (req: Request, res: Response) => {
  const { amount } = req.body;
  const { userId } = req.params;
  const requester = req.user as JwtPayload;
  const result = await walletService.addBalance(userId, amount, requester);
  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Balance added successfully",
    data: result,
  });
});

const cashIn = catchAsycn(async (req: Request, res: Response) => {
  const agentId = (req.user as JwtPayload).userId;
  const { receiver, amount } = req.body;
  const result = await walletService.cashIn(agentId, receiver, amount);
  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Cash-in successful",
    data: result,
  });
});

const cashOut = catchAsycn(async (req: Request, res: Response) => {
  const result = await walletService.cashOut(req.body);
  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Cash-out successful",
    data: result,
  });
});

const sendMoney = catchAsycn(async (req: Request, res: Response) => {
  const senderId = (req.user as JwtPayload).userId;
  const { receiverId, amount } = req.body;
  const result = await walletService.sendMoney(senderId, receiverId, amount);
  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Money sent successfully",
    data: result,
  });
});

const withdrawMoney = catchAsycn(async (req: Request, res: Response) => {
  const userId = (req.user as JwtPayload).userId;
  const { amount } = req.body;
  const result = await walletService.withdrawMoney(userId, amount);
  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Money withdrawn successfully",
    data: result,
  });
});

const blockWallet = catchAsycn(async (req: Request, res: Response) => {
  const walletId = req.params.id;
  const result = await walletService.updateWalletBlockStatus(walletId, true);
  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Wallet blocked successfully",
    data: result,
  });
});
const unblockWallet = catchAsycn(async (req: Request, res: Response) => {
  const walletId = req.params.id;
  const result = await walletService.updateWalletBlockStatus(walletId, false);
  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Wallet unblocked successfully",
    data: result,
  });
});
const getAllWallets = catchAsycn(async (req: Request, res: Response) => {
  const result = await walletService.getAllWallets(
    req.query as Record<string, string>
  );
  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "All wallets retrieved successfully",
    data: result,
  });
});

export const walletController = {
  getMyWallet,
  getWalletById,
  addBalance,
  cashIn,
  cashOut,
  sendMoney,
  withdrawMoney,
  blockWallet,
  unblockWallet,
  getAllWallets,
};
