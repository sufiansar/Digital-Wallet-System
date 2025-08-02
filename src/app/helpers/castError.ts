import mongoose from "mongoose";
import { TGenericErrorResponse } from "../interfaces/errorInterface";

export const handelCastError = (
  err: mongoose.Error.CastError
): TGenericErrorResponse => {
  const message = `Invalid value for field "${err.path}": "${err.value}". Please provide a valid MongoDB Object ID.`;

  return {
    statusCode: 400,
    message,
  };
};
