import { Router } from "express";
import { walletController } from "./wallet.controller";
import { checkAuth } from "../../middleware/checkAuths";
import { Role } from "../user/user.interface";

const router = Router();

router.get(
  "/my-wallet",
  checkAuth(...Object.values(Role)),
  walletController.getMyWallet
);

router.get(
  "/:id",
  checkAuth(...Object.values(Role.ADMIN)),
  walletController.getWalletById
);
export const walletRoutes = router;
