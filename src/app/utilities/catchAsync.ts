import { NextFunction, Request, Response } from "express";

type AsycnHandeler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const catchAsycn =
  (fn: AsycnHandeler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err: any) => {
      next(err);
    });
  };
