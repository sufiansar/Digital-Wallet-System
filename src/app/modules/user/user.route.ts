import { Router } from "express";
import { userController } from "./user.controller";
import { validationRequest } from "../../middleware/zodVadiateReq";
import { zodUpdateUserSchema, zodUserSchema } from "./zodValidation";
import { checkAuth } from "../../middleware/checkAuths";
import { Role } from "./user.interface";

const router = Router();

router.post(
  "/create-user",

  validationRequest(zodUserSchema),
  userController.createUser
);
router.patch(
  "/profile",
  checkAuth(...Object.values(Role)),
  validationRequest(zodUpdateUserSchema),
  userController.userUpdate
);
router.get("/agents", checkAuth(Role.ADMIN), userController.getAllAgents);

router.get("/:id", checkAuth(...Object.values(Role)), userController.getMe);

router.get("/me", checkAuth(...Object.values(Role)), userController.getMe);

router.get("/", checkAuth(Role.ADMIN), userController.getAllUsers);

router.delete(
  "/:id",
  checkAuth(...Object.values(Role)),
  validationRequest(zodUpdateUserSchema),
  userController.deleteUser
);

router.patch(
  "/block-user/:phone",
  checkAuth(Role.ADMIN),
  userController.blockUser
);
router.patch(
  "/unblock-user/:phone",
  checkAuth(Role.ADMIN),
  userController.unblockUser
);
router.post(
  "/set-inactive-user",
  checkAuth(Role.ADMIN),
  userController.setInactiveUser
);

router.patch(
  "/approve-agent/:id",
  checkAuth(Role.ADMIN),
  userController.approveAgent
);
router.patch(
  "/suspend-agent/:id",
  checkAuth(Role.ADMIN),
  userController.suspendAgent
);

export const UserRoutes = router;
