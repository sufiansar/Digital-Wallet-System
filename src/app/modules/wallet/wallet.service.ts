import mongoose from "mongoose";
import AppError from "../../errors/appError";
import User from "../user/user.model";
import { Wallet } from "./wallet.model";
import { Role } from "../user/user.interface";
import { JwtPayload } from "jsonwebtoken";
import { QueryBuilder } from "../../utilities/QueryBuilder";
import { Transaction } from "../ transaction/transaction.model";

const findUserByPhone = async (phone: string) => {
  const user = await User.findOne({ phone });
  if (!user) throw new AppError(404, "User not found", "");
  return user;
};

const getMyWallet = async (phone: string) => {
  const user = await findUserByPhone(phone);
  const wallet = await Wallet.findOne({ user: user._id });
  if (!wallet) throw new AppError(404, "Wallet not found", "");
  return wallet;
};

const getWalletById = async (walletId: string) => {
  const wallet = await Wallet.findById(walletId);
  if (!wallet) throw new Error("Wallet not found");
  return wallet;
};

const addBalance = async (
  phone: string,
  amount: number,
  requester: JwtPayload
) => {
  if (requester.role !== Role.ADMIN)
    throw new AppError(403, "Only admin can add balance", "");

  const user = await findUserByPhone(phone);
  if (user.role !== Role.AGENT)
    throw new AppError(403, "Can only add balance to agents", "");
  if (amount <= 0) throw new AppError(400, "Amount must be greater than 0", "");

  const wallet = await Wallet.findOneAndUpdate(
    { user: user._id },
    { $inc: { balance: amount } },
    { new: true }
  ).populate("user", "phone name email role");
  if (!wallet) throw new AppError(404, "Wallet not found", "");

  await Transaction.create({
    sender: null,
    receiver: user._id,
    amount,
    type: "deposit",
    status: "completed",
  });
  return wallet;
};

const cashIn = async (
  agentId: string,
  receiverPhone: string,
  amount: number
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const receiver = await findUserByPhone(receiverPhone);
    const agentWallet = await Wallet.findOne({ user: agentId }).session(
      session
    );

    const receiverWallet = await Wallet.findOne({ user: receiver._id }).session(
      session
    );

    if (!agentWallet || agentWallet.isBlocked)
      throw new AppError(403, "Agent wallet blocked", "");
    if (!receiverWallet || receiverWallet.isBlocked)
      throw new AppError(403, "Receiver wallet blocked", "");
    if (agentWallet.balance < amount)
      throw new AppError(400, "Insufficient balance", "");
    if (receiver._id.equals(agentId))
      throw new AppError(400, "You cannot cash in to your own wallet", "");
    agentWallet.balance -= amount;
    receiverWallet.balance += amount;

    await agentWallet.save({ session });
    await receiverWallet.save({ session });

    await Transaction.create(
      [
        {
          sender: agentId,
          receiver: receiver._id,
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

const deposit = async (userId: string, agentPhone: string, amount: number) => {
  if (amount <= 0) {
    throw new AppError(400, "Deposit amount must be greater than zero", "");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const agent = await findUserByPhone(agentPhone);

    if (!agent) throw new AppError(404, "Agent not found", "");

    if (agent.role !== "AGENT") {
      throw new AppError(400, "Deposit can only be made to an agent", "");
    }

    if (agent._id.equals(userId)) {
      throw new AppError(400, "You cannot deposit to your own wallet", "");
    }

    const userWallet = await Wallet.findOne({ user: userId }).session(session);
    const agentWallet = await Wallet.findOne({ user: agent._id }).session(
      session
    );

    if (!userWallet || userWallet.isBlocked)
      throw new AppError(403, "User wallet blocked", "");
    if (!agentWallet || agentWallet.isBlocked)
      throw new AppError(403, "Agent wallet blocked", "");

    if (userWallet.balance < amount)
      throw new AppError(400, "Insufficient balance in user wallet", "");

    userWallet.balance -= amount;
    agentWallet.balance += amount;

    await userWallet.save({ session });
    await agentWallet.save({ session });

    await Transaction.create(
      [
        {
          sender: userId,
          receiver: agent._id,
          amount,
          type: "deposit",
          status: "completed",
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return {
      agentWallet,
      depositedAmount: amount,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const sendMoney = async (
  senderPhone: string,
  receiverPhone: string,
  amount: number
) => {
  const sender = await findUserByPhone(senderPhone);
  const receiver = await findUserByPhone(receiverPhone);

  if (sender._id.equals(receiver._id))
    throw new AppError(400, "Cannot send money to yourself", "");
  if (receiver.role !== Role.USER)
    throw new AppError(403, "Only users can receive money", "");

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const senderWallet = await Wallet.findOne({ user: sender._id }).session(
      session
    );
    const receiverWallet = await Wallet.findOne({ user: receiver._id }).session(
      session
    );

    if (!senderWallet || senderWallet.isBlocked)
      throw new AppError(403, "Sender wallet blocked", "");
    if (!receiverWallet || receiverWallet.isBlocked)
      throw new AppError(403, "Receiver wallet blocked", "");
    if (senderWallet.balance < amount)
      throw new AppError(400, "Insufficient balance", "");

    senderWallet.balance -= amount;
    receiverWallet.balance += amount;

    await senderWallet.save({ session });
    await receiverWallet.save({ session });

    await Transaction.create(
      [
        {
          sender: sender._id,
          receiver: receiver._id,
          amount,
          type: "sendmoney",
          status: "completed",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return {
      sender: senderWallet,
      receiver: receiverWallet,
      transferredAmount: amount,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
const cashOut = async (
  senderPhone: string,
  receiverPhone: string,
  amount: number
) => {
  const sender = await findUserByPhone(senderPhone);
  const receiver = await findUserByPhone(receiverPhone);

  if (sender._id.equals(receiver._id))
    throw new AppError(400, "Cannot cash out to yourself", "");
  if (sender.role !== Role.USER) {
    throw new AppError(403, "Only users can perform cash-out", "");
  }

  if (receiver.role !== Role.AGENT) {
    throw new AppError(403, "Can only cash out to agents", "");
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const senderWallet = await Wallet.findOne({ user: sender._id }).session(
      session
    );
    const receiverWallet = await Wallet.findOne({ user: receiver._id }).session(
      session
    );

    if (!senderWallet || senderWallet.isBlocked)
      throw new AppError(403, "Sender wallet blocked", "");
    if (!receiverWallet || receiverWallet.isBlocked)
      throw new AppError(403, "Receiver wallet blocked", "");
    if (senderWallet.balance < amount)
      throw new AppError(400, "Insufficient balance", "");

    const commission = Math.round((amount / 1000) * 4 * 100) / 100; // 0.4% commission

    senderWallet.balance -= amount;
    receiverWallet.balance += amount + commission;

    await senderWallet.save({ session });
    await receiverWallet.save({ session });

    await Transaction.create(
      [
        {
          sender: sender._id,
          receiver: receiver._id,
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
          receiver: receiver._id,
          amount: commission,
          type: "commission",
          status: "completed",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return { senderWallet, receiverWallet, commission };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const withdrawMoney = async (phone: string, amount: number) => {
  const user = await findUserByPhone(phone);

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const wallet = await Wallet.findOne({ user: user._id }).session(session);
    if (!wallet || wallet.isBlocked)
      throw new AppError(403, "Wallet blocked", "");
    if (wallet.balance < amount)
      throw new AppError(400, "Insufficient balance", "");

    wallet.balance -= amount;
    await wallet.save({ session });

    await Transaction.create(
      [
        {
          sender: user._id,
          receiver: user._id,
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

// Block/unblock wallet
const updateWalletBlockStatus = async (phone: string, isBlocked: boolean) => {
  const user = await findUserByPhone(phone);
  const wallet = await Wallet.findOneAndUpdate(
    { user: user._id },
    { isBlocked },
    { new: true }
  );
  if (!wallet) throw new AppError(404, "Wallet not found", "");
  return wallet;
};

// Get all wallets
const getAllWallets = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Wallet.find(), query);
  const wallets = await queryBuilder.sort().paginate();
  const [data, meta] = await Promise.all([wallets.build(), wallets.getMeta()]);
  return { wallets: data, meta };
};

export const getOverview = async (userId: string) => {
  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) throw new Error("Wallet not found");
  const recentTransactions = await Transaction.find({
    $or: [{ sender: userId }, { receiver: userId }],
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  return {
    balance: wallet.balance,
    recentTransactions,
  };
};
export const walletService = {
  getMyWallet,
  addBalance,
  cashIn,
  sendMoney,
  cashOut,
  withdrawMoney,
  updateWalletBlockStatus,
  getAllWallets,
  getWalletById,
  getOverview,
  deposit,
};
