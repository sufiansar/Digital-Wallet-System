import { Transaction } from "./transaction.model";
import { QueryBuilder } from "../../utilities/QueryBuilder";

const getMyTransactions = async (userId: string) => {
  return Transaction.find({
    $or: [{ sender: userId }, { receiver: userId }],
  }).sort({ createdAt: -1 });
};

const getAllTransactions = async (query: Record<string, string>) => {
  const transactions = await new QueryBuilder(Transaction.find(), query)
    .sort()
    .paginate();
  const [data, meta] = await Promise.all([
    transactions.build(),
    transactions.getMeta(),
  ]);
  return { transactions: data, meta };
};

const getCommissionHistory = async (agentId: string) => {
  return Transaction.find({ receiver: agentId, type: "commission" }).sort({
    createdAt: -1,
  });
};

export const transactionService = {
  getMyTransactions,
  getAllTransactions,
  getCommissionHistory,
};
