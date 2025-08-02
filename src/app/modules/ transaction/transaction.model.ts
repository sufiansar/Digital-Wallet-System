import { Schema, model } from "mongoose";
import { ITransaction } from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      required: true,
      enum: [
        "sendmoney",
        "cash-in",
        "cash-out",
        "withdrawal",
        "deposit",
        "commission",
      ],
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "reversed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Transaction = model("Transaction", transactionSchema);
