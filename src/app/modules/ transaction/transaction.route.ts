import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuths";
import { Role } from "../user/user.interface";
import { transactionController } from "./transaction.controller";

const router = Router();

router.get(
  "/my",
  checkAuth(...Object.values(Role)),
  transactionController.getMyTransactions
);
router.get(
  "/commissions",
  checkAuth(Role.AGENT),
  transactionController.getCommissionHistory
);
router.get(
  "/all",
  checkAuth(Role.AGENT, Role.ADMIN),
  transactionController.getAllTransactions
);

export const transactionRoutes = router;
