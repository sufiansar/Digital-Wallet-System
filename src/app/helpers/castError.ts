import mongoose from "mongoose";
import { IGenericError } from "../interfaces/errorInterface";

export const handelCastError = (
  err: mongoose.Error.CastError
): IGenericError => {
  return {
    StatusCodes: 400,
    message: "Invalid MongoDB Object ID. Please send a valid ID.",
  };
};
