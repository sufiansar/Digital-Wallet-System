import { Router } from "express";
import { OtpController } from "./otp.controller";

const router = Router();

router.post("/send", OtpController.sendOtp);
router.post("/verify", OtpController.verifyOTP);

export const OtpRouter = router;
