import { JwtPayload } from "jsonwebtoken";
import { catchAsycn } from "../../utilities/catchAsync";
import { Isactive, Iuser } from "./user.interface";
import { userService } from "./user.service";
import { sendResponse } from "../../utilities/sendResponse";
import AppError from "../../errors/appError";

const createUser = catchAsycn(async (req, res, next) => {
  const payload: Iuser = req.body;
  const user = await userService.createUser(payload);
  sendResponse(res, {
    successCode: 201,
    success: true,
    message: "User created successfully",
    data: user,
  });
  next();
});

const userUpdate = catchAsycn(async (req, res) => {
  const userId = req.params.id;
  const payload: Iuser = req.body;
  const verifiedToken = req.user;
  const user = await userService.userUpdate(
    userId,
    payload,
    verifiedToken as JwtPayload
  );

  sendResponse(res, {
    successCode: 200,
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

const deleteUser = catchAsycn(async (req, res) => {
  const { id } = req.params;
  const user = await userService.deleteUser(id, { isDeleted: true });
  if (!user) {
    throw new AppError(404, "User not found", "");
  }
  sendResponse(res, {
    successCode: 200,
    success: true,
    message: "User deleted successfully",
    data: user,
  });
});

const getAllUsers = catchAsycn(async (req, res) => {
  const query = req.query;
  const users = await userService.getAllUsers(query as Record<string, string>);
  sendResponse(res, {
    successCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: users,
  });
});

const approveAgent = catchAsycn(async (req, res) => {
  const agentId = req.params.id;
  const result = await userService.updateUserStatus(agentId, Isactive.ACTIVE);
  sendResponse(res, {
    successCode: 200,
    success: true,
    message: "Agent approved",
    data: result,
  });
});

const suspendAgent = catchAsycn(async (req, res) => {
  const agentId = req.params.id;
  const result = await userService.updateUserStatus(agentId, Isactive.INACTIVE);
  sendResponse(res, {
    successCode: 200,
    success: true,
    message: "Agent suspended",
    data: result,
  });
});

export const userController = {
  createUser,
  userUpdate,
  deleteUser,
  getAllUsers,
  approveAgent,
  suspendAgent,
};
