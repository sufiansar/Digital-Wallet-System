import { JwtPayload } from "jsonwebtoken";
import { catchAsycn } from "../../utilities/catchAsync";
import { Isactive, Iuser } from "./user.interface";
import { userService } from "./user.service";
import { sendResponse } from "../../utilities/sendResponse";
import AppError from "../../errors/appError";
import { Request, Response } from "express";

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

const getMe = catchAsycn(async (req, res) => {
  const decodedToken = req.user as JwtPayload;
  const result = await userService.getMe(decodedToken.userId);

  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Your profile Retrieved Successfully",
    data: result.data,
  });
});

const userUpdate = catchAsycn(async (req: Request, res: Response) => {
  const userId = (req.user as JwtPayload).userId;
  const payload = req.body;
  const updatedUser = await userService.updateUser(
    userId,
    payload,
    req.user as JwtPayload
  );

  sendResponse(res, {
    successCode: 200,
    success: true,
    message: "User updated successfully",
    data: updatedUser,
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
    data: users.data,
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

const blockUser = catchAsycn(async (req, res) => {
  const result = await userService.blockUser(req.params.phone);
  sendResponse(res, {
    successCode: 200,
    success: true,
    message: "User blocked",
    data: result,
  });
});

const getAllAgents = catchAsycn(async (req, res) => {
  const query = req.query;
  console.log(req.query, "dhukce");
  const result = await userService.getAllAgents(
    query as Record<string, string>
  );
  sendResponse(res, {
    successCode: 200,
    success: true,
    message: "All agents retrieved successfully",
    data: result.data,
    meta: {
      page: result.meta.page,
      limit: result.meta.limit,
      totalPages: result.meta.totalPage,
      totalItems: result.meta.total,
    },
  });
});

const unblockUser = catchAsycn(async (req, res) => {
  const result = await userService.unblockUser(req.params.phone);
  sendResponse(res, {
    successCode: 200,
    success: true,
    message: "User unblocked",
    data: result,
  });
});

const setInactiveUser = catchAsycn(async (req, res) => {
  const { phone } = req.body;
  const result = await userService.setInactiveUser(phone);
  sendResponse(res, {
    successCode: 200,
    success: true,
    message: "User set to inactive",
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
  getMe,
  blockUser,
  unblockUser,
  setInactiveUser,
  getAllAgents,
};
