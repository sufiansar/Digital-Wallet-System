import { NextFunction, Request, Response } from "express";
import { envConfig } from "../config/env";
import { handelValidationError } from "../helpers/handleValidationError";
import { handelDuplicateError } from "../helpers/handleDuplicateError";
import { handelCastError } from "../helpers/castError";
import { handelZodError } from "../helpers/handleZodError";
import AppError from "../errors/appError";

export const globalErrorHander = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (envConfig.NODE_ENV === "Development") {
    console.log(err);
  }

  let statusCode = 500;
  let message = "Something went wrong";
  let errorSource: any = [];

  //  Duplicate Key Error (MongoDB)
  if (err.code === 11000) {
    const simplifiedError = handelDuplicateError(err);
    statusCode = simplifiedError.StatusCodes;
    message = simplifiedError.message;
  } else if (err.name === "ValidationError") {
    const simplifiedError = handelValidationError(err);
    statusCode = simplifiedError.StatusCodes;
    errorSource = simplifiedError.errorSource;
    message = simplifiedError.message;
  } else if (err.name === "CastError") {
    const simplifiedError = handelCastError(err);
    statusCode = simplifiedError.StatusCodes;
    message = simplifiedError.message;
  }

  // Zod Error
  else if (err.name === "ZodError") {
    const simplifiedError = handelZodError(err);
    statusCode = simplifiedError.StatusCodes;
    errorSource = simplifiedError.errorSource;
    message = simplifiedError.message;
  }

  //  AppError (Custom)
  else if (err instanceof AppError) {
    statusCode = err.SuccessCode || 400;
    message = err.message;
  }

  // Default JavaScript Error
  else if (err instanceof Error) {
    message = err.message;
  }

  //  Response
  res.status(statusCode).json({
    success: false,
    message,
    errorSource,
    err: envConfig.NODE_ENV === "Development" ? err : null,
    stack: envConfig.NODE_ENV === "Development" ? err.stack : undefined,
  });
};
