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
router.post(
  "/add-balance/:userId",
  checkAuth(Role.ADMIN),
  walletController.addBalance
);
router.post("/cash-in", checkAuth(Role.AGENT), walletController.cashIn);
router.post(
  "/cash-out",
  checkAuth(...Object.values(Role)),
  walletController.cashOut
);
router.post(
  "/send-money",
  checkAuth(...Object.values(Role)),
  walletController.sendMoney
);
router.post(
  "/withdraw-money",
  checkAuth(...Object.values(Role)),
  walletController.withdrawMoney
);

router.patch("/block/:id", checkAuth(Role.ADMIN), walletController.blockWallet);
router.patch(
  "/unblock/:id",
  checkAuth(Role.ADMIN),
  walletController.unblockWallet
);
router.get("/all", checkAuth(Role.ADMIN), walletController.getAllWallets);
router.get("/:id", checkAuth(Role.ADMIN), walletController.getWalletById);

export const walletRoutes = router;
