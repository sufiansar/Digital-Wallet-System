import { Response, NextFunction } from "express";
import { envConfig } from "../config/env";
import { handelDuplicateError } from "../helpers/handleDuplicateError";
import { handelCastError } from "../helpers/castError";
import AppError from "../errors/appError";
import { handlerValidationError } from "../helpers/handleValidationError";
import { handlerZodError } from "../helpers/handleZodError";
export const globalErrorHandler = (
  err: any,
  res: Response,
  next: NextFunction
) => {
  if (envConfig.NODE_ENV === "Development") {
    console.error("Error :", err);
  }

  let statusCode = 500;
  let message = "Something went wrong";
  let errorSource: any = [];

  if (err.code === 11000) {
    const simplifiedError = handelDuplicateError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  } else if (err.name === "ValidationError") {
    const simplifiedError = handlerValidationError(err);
    statusCode = simplifiedError.statusCode;
    errorSource = simplifiedError.errorSources;
    message = simplifiedError.message;
  } else if (err.name === "CastError") {
    const simplifiedError = handelCastError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  } else if (err.name === "ZodError") {
    const simplifiedError = handlerZodError(err);
    statusCode = simplifiedError.statusCode;
    errorSource = simplifiedError.errorSources;
    message = simplifiedError.message;
  } else if (err instanceof AppError) {
    statusCode = err.SuccessCode || 400;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSource,
    err: envConfig.NODE_ENV === "Development" ? err : null,
    stack: envConfig.NODE_ENV === "Development" ? err.stack : undefined,
  });
  next();
};
