import mongoose from "mongoose";

import AppError from "../../errors/appError";
import User from "../user/user.model";
import { Wallet } from "./wallet.model";
import { Role } from "../user/user.interface";
import { Transaction } from "../ transaction/transaction.model";
import { CashOutParams } from "./wallet.interface";
import { JwtPayload } from "jsonwebtoken";
import { QueryBuilder } from "../../utilities/QueryBuilder";

const getMyWallet = async (userId: string) => {
  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) throw new Error("Wallet not found");
  return wallet;
};

const getWalletById = async (walletId: string) => {
  const wallet = await Wallet.findById(walletId);
  if (!wallet) throw new Error("Wallet not found");
  return wallet;
};

const addBalance = async (
  userId: string,
  amount: number,
  requester: JwtPayload
) => {
  if (requester.role !== Role.ADMIN) {
    throw new AppError(403, "Only admin can add balance to any wallet", "");
  }

  const agentUser = await User.findById(userId);
  if (!agentUser) throw new AppError(404, "Target user not found", "");

  if (agentUser.role !== Role.AGENT) {
    throw new AppError(403, "Admin can only add balance to agent wallets", "");
  }

  if (amount <= 0) throw new AppError(400, "Amount must be greater than 0", "");
  const wallet = await Wallet.findOneAndUpdate(
    { user: userId },
    { $inc: { balance: amount } },
    { new: true }
  );
  if (!wallet) throw new AppError(404, "Wallet not found", "");
  await Transaction.create({
    sender: null,
    receiver: userId,
    amount,
    type: "deposit",
    status: "completed",
  });
  return wallet;
};

const cashIn = async (agentId: string, receiver: string, amount: number) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const agentWallet = await Wallet.findOne({ user: agentId }).session(
      session
    );

    if (!agentWallet || agentWallet.isBlocked)
      throw new AppError(403, "Agent wallet not accessible", "");
    if (agentWallet.balance < amount)
      throw new AppError(400, "Agent has insufficient balance", "");

    const receiverWallet = await Wallet.findOne({ user: receiver }).session(
      session
    );
    if (!receiverWallet || receiverWallet.isBlocked)
      throw new AppError(403, "Receiver wallet not accessible", "");
    if (receiver === agentId)
      throw new AppError(400, "You cannot cash in to your own wallet", "");

    agentWallet.balance -= amount;
    receiverWallet.balance += amount;

    await agentWallet.save({ session });
    await receiverWallet.save({ session });

    await Transaction.create(
      [
        {
          sender: agentId,
          receiver,
          amount,
          type: "cash-in",
          status: "completed",
        },
      ],
      { session }
    );
    await session.commitTransaction();
    return receiverWallet;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const cashOut = async (params: CashOutParams) => {
  const { receiverId, senderId, amount } = params;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const senderUser = await User.findById(senderId).session(session);
    if (!senderUser) throw new AppError(404, "Sender user not found", "");
    if (senderUser.role !== Role.USER)
      throw new AppError(403, "Only users can perform cash out", "");

    const receiverUser = await User.findById(receiverId).session(session);
    if (!receiverUser) throw new AppError(404, "Receiver user not found", "");
    if (receiverUser.role !== Role.AGENT)
      throw new AppError(403, "Cash out is only allowed to agents", "");

    const senderWallet = await Wallet.findOne({ user: senderId }).session(
      session
    );
    if (!senderWallet || senderWallet.isBlocked)
      throw new AppError(403, "Sender's wallet not accessible", "");

    const receiverWallet = await Wallet.findOne({ user: receiverId }).session(
      session
    );
    if (!receiverWallet || receiverWallet.isBlocked)
      throw new AppError(403, "Receiver's wallet not accessible", "");

    if (senderId === receiverId)
      throw new AppError(400, "You cannot cash out to your own wallet", "");

    if (senderWallet.balance < amount)
      throw new AppError(400, "Sender has insufficient balance", "");

    const commissionAmount = Math.round((amount / 1000) * 4 * 100) / 100;
    senderWallet.balance -= amount;
    receiverWallet.balance += amount + commissionAmount;

    await senderWallet.save({ session });
    await receiverWallet.save({ session });

    await Transaction.create(
      [
        {
          sender: senderId,
          receiver: receiverId,
          amount,
          type: "cash-out",
          status: "completed",
        },
      ],
      { session }
    );

    await Transaction.create(
      [
        {
          sender: null,
          receiver: receiverId,
          amount: commissionAmount,
          type: "commission",
          status: "completed",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return {
      senderWallet: {
        user: senderWallet.user,
        newBalance: senderWallet.balance,
      },
      receiverWallet: {
        user: receiverWallet.user,
        newBalance: receiverWallet.balance,
      },
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const sendMoney = async (
  senderId: string,
  receiverId: string,
  amount: number
) => {
  if (senderId === receiverId)
    throw new Error("You cannot send money to yourself");

  const receiverUser = await User.findById(receiverId);
  if (!receiverUser) throw new Error("Receiver user not found");

  if (receiverUser.role === Role.ADMIN || receiverUser.role === Role.AGENT) {
    throw new Error("You cannot send money to an admin or agent");
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const senderWallet = await Wallet.findOne({ user: senderId }).session(
      session
    );
    if (!senderWallet) throw new Error("Sender wallet not found");
    if (senderWallet.isBlocked) throw new Error("Sender wallet is blocked");
    if (senderWallet.balance < amount) throw new Error("Insufficient balance");

    const receiverWallet = await Wallet.findOne({ user: receiverId }).session(
      session
    );
    if (!receiverWallet) throw new Error("Receiver wallet not found");
    if (receiverWallet.isBlocked) throw new Error("Receiver wallet is blocked");

    senderWallet.balance -= amount;
    receiverWallet.balance += amount;

    await senderWallet.save({ session });
    await receiverWallet.save({ session });

    await Transaction.create(
      [
        {
          sender: senderId,
          receiver: receiverId,
          amount,
          type: "sendmoney",
          status: "completed",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return {
      sender: senderWallet,
      receiver: receiverWallet,
      transferredAmount: amount,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const withdrawMoney = async (userId: string, amount: number) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const wallet = await Wallet.findOne({ user: userId }).session(session);
    if (!wallet || wallet.isBlocked)
      throw new AppError(403, "Wallet not accessible", "");
    if (wallet.balance < amount)
      throw new AppError(400, "Insufficient funds", "");
    wallet.balance -= amount;
    await wallet.save({ session });
    await Transaction.create(
      [
        {
          sender: userId,
          receiver: userId,
          amount,
          type: "withdrawal",
          status: "completed",
        },
      ],
      { session }
    );
    await session.commitTransaction();
    return wallet;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const updateWalletBlockStatus = async (
  walletId: string,
  isBlocked: boolean
) => {
  const wallet = await Wallet.findByIdAndUpdate(
    walletId,
    { isBlocked },
    { new: true }
  );
  if (!wallet) throw new AppError(404, "Wallet not found", "");
  return wallet;
};
const getAllWallets = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Wallet.find(), query);

  const wallets = await queryBuilder.sort().paginate();
  const [data, meta] = await Promise.all([wallets.build(), wallets.getMeta()]);
  return { wallets: data, meta };
};

export const walletService = {
  getMyWallet,
  getWalletById,
  addBalance,
  cashIn,
  cashOut,
  sendMoney,
  withdrawMoney,
  updateWalletBlockStatus,
  getAllWallets,
};
