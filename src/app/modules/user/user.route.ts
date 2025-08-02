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
  "/:id",
  checkAuth(Role.ADMIN),
  validationRequest(zodUpdateUserSchema),
  userController.userUpdate
);

router.get("/", checkAuth(Role.ADMIN), userController.getAllUsers);

router.delete(
  "/:id",
  checkAuth(...Object.values(Role)),
  validationRequest(zodUpdateUserSchema),
  userController.deleteUser
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
