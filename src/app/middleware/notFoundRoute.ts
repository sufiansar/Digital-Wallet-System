import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const notFoundRoute = (req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "The requested route does not exist.",
  });
};
