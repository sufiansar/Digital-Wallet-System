import { Router } from "express";
import { statsController } from "./stats.controller";
import { checkAuth } from "../../middleware/checkAuths";
import { Role } from "../user/user.interface";

const router = Router();

router.get("/user-stats", checkAuth(Role.ADMIN), statsController.getUserStats);
router.get(
  "/wallet-stats",
  checkAuth(Role.ADMIN),
  statsController.getWalletStats
);
router.get(
  "/transaction-stats",
  checkAuth(Role.ADMIN),
  statsController.getTransactionStats
);

export const StatsRoutes = router;
