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
  "/overview",
  checkAuth(...Object.values(Role)),
  walletController.getOverview
);
router.post("/add-balance", checkAuth(Role.ADMIN), walletController.addBalance); // phone in body
router.post("/cash-in", checkAuth(Role.AGENT), walletController.cashIn); // agent -> user
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
router.post("/deposit", checkAuth(Role.USER), walletController.deposit);
router.post(
  "/withdraw-money",
  checkAuth(...Object.values(Role)),
  walletController.withdrawMoney
);

router.patch("/block", checkAuth(Role.ADMIN), walletController.blockWallet); // phone in body
router.patch("/unblock", checkAuth(Role.ADMIN), walletController.unblockWallet); // phone in body
router.get("/all", checkAuth(Role.ADMIN), walletController.getAllWallets);

router.get("/:id", checkAuth(Role.ADMIN), walletController.getWalletById);

export const walletRoutes = router;
