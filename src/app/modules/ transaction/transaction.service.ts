import { Transaction } from "./transaction.model";
import { QueryBuilder } from "../../utilities/QueryBuilder";

const getMyTransactions = async (
  userId: string,
  query: Record<string, any>
) => {
  let modelQuery = Transaction.find({
    $or: [{ sender: userId }, { receiver: userId }],
  });

  const queryBuilder = new QueryBuilder(modelQuery, query);

  if (query.type) {
    modelQuery = modelQuery.find({ type: query.type });
  }

  if (query.startDate || query.endDate) {
    const dateFilter: any = {};
    if (query.startDate) {
      dateFilter.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      dateFilter.$lte = new Date(query.endDate);
    }
    modelQuery = modelQuery.find({ createdAt: dateFilter });
  }

  const transactions = await queryBuilder.paginate().sort().build();
  const meta = await queryBuilder.getMeta();

  return { meta, transactions };
};

const getAllTransactions = async (query: Record<string, any>) => {
  const transactionsQuery = new QueryBuilder(Transaction.find(), query)
    .search(["type", "status"])
    .filter(["type", "status", "minAmount", "maxAmount"])
    .sort()
    .paginate();

  const [transactions, meta] = await Promise.all([
    transactionsQuery.build(),
    transactionsQuery.getMeta(),
  ]);

  return { transactions, meta };
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
