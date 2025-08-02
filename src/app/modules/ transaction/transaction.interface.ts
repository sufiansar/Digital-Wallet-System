import { Types } from "mongoose";

export interface ITransaction {
  sender: Types.ObjectId | null;
  receiver: Types.ObjectId;
  amount: number;
  type:
    | "sendmoney"
    | "cash-in"
    | "cash-out"
    | "withdrawal"
    | "deposit"
    | "commission";
  status: "pending" | "completed" | "reversed";
  createdAt?: Date;
  updatedAt?: Date;
}
