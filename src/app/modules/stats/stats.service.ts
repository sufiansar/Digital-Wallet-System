import { Transaction } from "../ transaction/transaction.model";
import { Isactive } from "../user/user.interface";
import User from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";

const now = new Date();
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);

const getUserStats = async () => {
  // Wallet stats
  const totalWalletsPromise = Wallet.countDocuments();
  const fundedWalletsPromise = Wallet.countDocuments({ balance: { $gt: 0 } });
  const emptyWalletsPromise = Wallet.countDocuments({ balance: 0 });
  const walletsLast7DaysPromise = Wallet.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const walletsLast30DaysPromise = Wallet.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  const walletsByRolePromise = Wallet.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userData",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "agent",
        foreignField: "_id",
        as: "agentData",
      },
    },
    {
      $project: {
        role: {
          $cond: [
            { $gt: [{ $size: "$userData" }, 0] },
            { $arrayElemAt: ["$userData.role", 0] },
            { $arrayElemAt: ["$agentData.role", 0] },
          ],
        },
      },
    },
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);

  // User stats
  const totalUsersPromise = User.countDocuments({ role: "user" });
  const totalAgentsPromise = User.countDocuments({ role: "agent" });

  const totalActiveUsersPromise = User.countDocuments({
    isActive: Isactive.ACTIVE,
  });
  const totalInActiveUsersPromise = User.countDocuments({
    isActive: Isactive.INACTIVE,
  });
  const totalBlockedUsersPromise = User.countDocuments({
    isActive: Isactive.BLOCKED,
  });
  const newUsersInLast7DaysPromise = User.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const newUsersInLast30DaysPromise = User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  // Transaction stats
  const totalTransactionsPromise = Transaction.countDocuments();
  const totalTransactionVolumePromise = Transaction.aggregate([
    { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
  ]);

  const [
    totalWallets,
    fundedWallets,
    emptyWallets,
    walletsLast7Days,
    walletsLast30Days,
    walletsByRole,
    totalUsers,
    totalAgents,
    totalActiveUsers,
    totalInActiveUsers,
    totalBlockedUsers,
    newUsersInLast7Days,
    newUsersInLast30Days,
    totalTransactions,
    transactionVolumeResult,
  ] = await Promise.all([
    totalWalletsPromise,
    fundedWalletsPromise,
    emptyWalletsPromise,
    walletsLast7DaysPromise,
    walletsLast30DaysPromise,
    walletsByRolePromise,
    totalUsersPromise,
    totalAgentsPromise,
    totalActiveUsersPromise,
    totalInActiveUsersPromise,
    totalBlockedUsersPromise,
    newUsersInLast7DaysPromise,
    newUsersInLast30DaysPromise,
    totalTransactionsPromise,
    totalTransactionVolumePromise,
  ]);

  const totalTransactionVolume = transactionVolumeResult[0]?.totalAmount || 0;

  return {
    // Wallet stats
    totalWallets,
    fundedWallets,
    emptyWallets,
    walletsLast7Days,
    walletsLast30Days,
    walletsByRole,

    // User stats
    totalUsers,
    totalAgents,
    totalActiveUsers,
    totalInActiveUsers,
    totalBlockedUsers,
    newUsersInLast7Days,
    newUsersInLast30Days,

    // Transaction stats
    totalTransactions,
    totalTransactionVolume,
  };
};

const getWalletStats = async () => {
  const totalWalletsPromise = Wallet.countDocuments();
  const fundedWalletsPromise = Wallet.countDocuments({ balance: { $gt: 0 } });
  const emptyWalletsPromise = Wallet.countDocuments({ balance: 0 });
  const walletsLast7DaysPromise = Wallet.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const walletsLast30DaysPromise = Wallet.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  const walletsByBalanceRangePromise = Wallet.aggregate([
    {
      $bucket: {
        groupBy: "$balance",
        boundaries: [0, 1, 1001, Infinity],
        default: "Other",
        output: { count: { $sum: 1 } },
      },
    },
  ]);

  const walletsByRolePromise = Wallet.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userData",
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "agent",
        foreignField: "_id",
        as: "agentData",
      },
    },
    {
      $project: {
        role: {
          $cond: [
            { $gt: [{ $size: "$userData" }, 0] },
            { $arrayElemAt: ["$userData.role", 0] },
            { $arrayElemAt: ["$agentData.role", 0] },
          ],
        },
      },
    },
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);

  const [
    totalWallets,
    fundedWallets,
    emptyWallets,
    walletsLast7Days,
    walletsLast30Days,
    walletsByBalanceRange,
    walletsByRole,
  ] = await Promise.all([
    totalWalletsPromise,
    fundedWalletsPromise,
    emptyWalletsPromise,
    walletsLast7DaysPromise,
    walletsLast30DaysPromise,
    walletsByBalanceRangePromise,
    walletsByRolePromise,
  ]);

  return {
    totalWallets,
    fundedWallets,
    emptyWallets,
    walletsLast7Days,
    walletsLast30Days,
    walletsByBalanceRange,
    walletsByRole,
  };
};

const getTransactionStats = async () => {
  const totalTransactionsPromise = Transaction.countDocuments();
  const successfulTransactionsPromise = Transaction.countDocuments({
    status: "completed",
  });
  const failedTransactionsPromise = Transaction.countDocuments({
    status: "failed",
  });

  const transactionsLast7DaysPromise = Transaction.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const transactionsLast30DaysPromise = Transaction.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  const transactionsByTypePromise = Transaction.aggregate([
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
      },
    },
  ]);

  const transactionsByStatusPromise = Transaction.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const sendMoneyPromise = Transaction.countDocuments({ type: "sendMoney" });
  const withdrawPromise = Transaction.countDocuments({ type: "withdrawal" });
  const depositPromise = Transaction.countDocuments({ type: "deposit" });
  const cashInPromise = Transaction.countDocuments({ type: "cashIn" });
  const cashOutPromise = Transaction.countDocuments({ type: "cashOut" });

  const [
    totalTransactions,
    successfulTransactions,
    failedTransactions,
    transactionsLast7Days,
    transactionsLast30Days,
    transactionsByType,
    transactionsByStatus,
    sendMoney,
    withdraw,
    deposit,
    cashIn,
    cashOut,
  ] = await Promise.all([
    totalTransactionsPromise,
    successfulTransactionsPromise,
    failedTransactionsPromise,
    transactionsLast7DaysPromise,
    transactionsLast30DaysPromise,
    transactionsByTypePromise,
    transactionsByStatusPromise,
    sendMoneyPromise,
    withdrawPromise,
    depositPromise,
    cashInPromise,
    cashOutPromise,
  ]);

  return {
    totalTransactions,
    successfulTransactions,
    failedTransactions,
    transactionsLast7Days,
    transactionsLast30Days,
    transactionsByType,
    transactionsByStatus,
    sendMoney,
    withdraw,
    deposit,
    cashIn,
    cashOut,
  };
};

export const statsService = {
  getUserStats,
  getWalletStats,
  getTransactionStats,
};
