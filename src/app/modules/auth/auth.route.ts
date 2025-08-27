import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuths";
import { Role } from "../user/user.interface";

const router = Router();

router.post("/login", AuthController.userLogin);
router.post("/refresh-token", AuthController.getNewAccessToken);
router.post("/logout", AuthController.logout);

router.post(
  "/change-password",
  checkAuth(...Object.values(Role)),
  AuthController.changePassword
);
router.post(
  "/set-password",
  checkAuth(...Object.values(Role)),
  AuthController.setPassword
);

router.post("/forgot-password", AuthController.forgotPassword);
router.post(
  "/reset-password",
  checkAuth(...Object.values(Role)),
  AuthController.resetPassword
);

export const AuthRoutes = router;
