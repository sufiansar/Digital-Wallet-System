import express, { Request, Response } from "express";
import { router } from "./modules/router";
import cors from "cors";
const app = express();

import cookieParser from "cookie-parser";
import { notFoundRoute } from "./middleware/notFoundRoute";
import { globalErrorHandler } from "./middleware/errorHandlaer";
import { envConfig } from "./config/env";
// import { envConfig } from "./config/env";

app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [envConfig.FRONTEND_URL],
    credentials: true,
  })
);
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome To Wallet System API",
  });
});

app.use(notFoundRoute);
app.use(globalErrorHandler);
export default app;
