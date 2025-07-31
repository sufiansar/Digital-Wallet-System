import mongoose from "mongoose";
import { IErrorSource, IGenericError } from "../interfaces/errorInterface";

export const handelValidationError = (
  err: mongoose.Error.ValidationError
): IGenericError => {
  const errorSource: IErrorSource[] = [];

  Object.values(err.errors).forEach((e: any) => {
    errorSource.push({
      path: e.path,
      message: e.message,
    });
  });
  return {
    StatusCodes: 400,
    message: "validation Error",
    errorSource,
  };
};
