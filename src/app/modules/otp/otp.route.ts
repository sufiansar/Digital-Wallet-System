import { Router } from "express";
import { OtpController } from "./otp.controller";

const router = Router();

router.post("/send", OtpController.sendOtp);
router.post("/verify", OtpController.verifyOTP);

router.post("/sendmail", OtpController.sendmailContractPage);

export const OtpRouter = router;
