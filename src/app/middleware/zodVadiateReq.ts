import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodRawShape, ZodError } from "zod";

type AnyZodObject = ZodObject<ZodRawShape>;

export const validationRequest =
  (zodSchema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body?.data) {
        try {
          req.body = JSON.parse(req.body.data);
        } catch {
          return res.status(400).json({
            success: false,
            message: "Invalid JSON format in 'data' field",
          });
        }
      }

      req.body = await zodSchema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error,
        });
      }

      next(error);
    }
  };
