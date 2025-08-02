import express, { Request, Response } from "express";
import { router } from "./modules/router";
const app = express();

import cookieParser from "cookie-parser";
import { notFoundRoute } from "./middleware/notFoundRoute";
import { globalErrorHandler } from "./middleware/errorHandlaer";

app.use(cookieParser());
app.use(express.json());
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    massage: "Welcome To Wallet System API",
  });
});

app.use(notFoundRoute);
app.use(globalErrorHandler);
export default app;
