import express, { Request, Response } from "express";
import { router } from "./modules/router";
const app = express();

app.use(express.json());
app.use("/api/v1", router);
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    massage: "Welcome To Wallet System API",
  });
});
export default app;
