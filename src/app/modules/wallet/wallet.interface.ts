import { Types } from "mongoose";

export interface IWallet {
  user: Types.ObjectId;
  balance: number;
  isBlocked: boolean;
}

export interface CashOutParams {
  receiverId: string;
  senderId: string;
  amount: number;
}
