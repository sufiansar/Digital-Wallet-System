import { catchAsycn } from "../../utilities/catchAsync";
import { sendResponse } from "../../utilities/sendResponse";
import { AuthService } from "./auth.service";

import httpStatus from "http-status-codes";

const userLogin = catchAsycn(async (req, res, next) => {
  const loginInfo = await AuthService.userLogin(req.body);
  sendResponse(res, {
    success: true,
    successCode: httpStatus.OK,
    message: "User Logged In Successfully",
    data: loginInfo,
  });
});

export const AuthController = {
  userLogin,
};
