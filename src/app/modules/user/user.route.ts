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
  checkAuth(...Object.values(Role)),
  validationRequest(zodUpdateUserSchema),
  userController.userUpdate
);

router.delete(
  "/:id",
  validationRequest(zodUpdateUserSchema),
  userController.deleteUser
);

export const UserRoutes = router;
