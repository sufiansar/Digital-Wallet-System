import { Request, Response } from "express";
import { sendResponse } from "../../utilities/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { catchAsycn } from "../../utilities/catchAsync";
import { walletService } from "./wallet.service";

const getMyWallet = catchAsycn(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const result = await walletService.getMyWallet(user.phone);
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
  const { phone, amount } = req.body;
  const requester = req.user as JwtPayload;

  const result = await walletService.addBalance(phone, amount, requester);
  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Balance added successfully",
    data: result,
  });
});

const cashIn = catchAsycn(async (req: Request, res: Response) => {
  const agentId = (req.user as JwtPayload).userId;
  const { receiverPhone, amount } = req.body;

  const result = await walletService.cashIn(agentId, receiverPhone, amount);

  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Cash-in successful",
    data: result,
  });
});

const deposit = catchAsycn(async (req: Request, res: Response) => {
  const userId = (req.user as JwtPayload).userId;
  const { receiverPhone, amount } = req.body;

  const result = await walletService.deposit(
    userId,
    receiverPhone,
    Number(amount)
  );

  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Deposit successful",
    data: result,
  });
});

const sendMoney = catchAsycn(async (req: Request, res: Response) => {
  const senderPhone = req.user?.phone;
  const { receiverPhone, amount } = req.body;

  const result = await walletService.sendMoney(
    senderPhone,
    receiverPhone,
    amount
  );

  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Money sent successfully",
    data: result,
  });
});

const cashOut = catchAsycn(async (req: Request, res: Response) => {
  const senderPhone = req.user?.phone;
  const { receiverPhone, amount } = req.body;
  const result = await walletService.cashOut(
    senderPhone,
    receiverPhone,
    amount
  );

  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Cash-out successful",
    data: result,
  });
});

const withdrawMoney = catchAsycn(async (req: Request, res: Response) => {
  const userPhone = (req.user as JwtPayload).phone;
  const { amount } = req.body;
  const result = await walletService.withdrawMoney(userPhone, amount);
  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Money withdrawn successfully",
    data: result,
  });
});

const blockWallet = catchAsycn(async (req: Request, res: Response) => {
  const { phone } = req.body;
  const result = await walletService.updateWalletBlockStatus(phone, true);
  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Wallet blocked successfully",
    data: result,
  });
});

const unblockWallet = catchAsycn(async (req: Request, res: Response) => {
  const { phone } = req.body;

  const result = await walletService.updateWalletBlockStatus(phone, false);
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

const getOverview = catchAsycn(async (req: Request, res: Response) => {
  const userId = (req.user as JwtPayload).userId;
  const data = await walletService.getOverview(userId);
  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Wallet overview fetched successfully",
    data,
  });
});

export const walletController = {
  getMyWallet,
  addBalance,
  cashIn,
  sendMoney,
  cashOut,
  withdrawMoney,
  blockWallet,
  unblockWallet,
  getAllWallets,
  getWalletById,
  getOverview,
  deposit,
};
