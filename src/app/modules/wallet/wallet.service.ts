import { Wallet } from "./wallet.model";

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

export const walletService = {
  getMyWallet,
  getWalletById,
};

// Logic to get the user's wallet
