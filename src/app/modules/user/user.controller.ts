import { JwtPayload } from "jsonwebtoken";
import { catchAsycn } from "../../utilities/catchAsync";
import { Iuser } from "./user.interface";
import { userService } from "./user.service";

const createUser = catchAsycn(async (req, res, next) => {
  const payload: Iuser = req.body;
  const user = await userService.createUser(payload);
  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: user,
  });
});

const userUpdate = catchAsycn(async (req, res, decodedToken: JwtPayload) => {
  const { id } = req.params;
  const payload: Iuser = req.body;

  const user = await userService.userUpdate(id, payload, decodedToken);
  if (!user) {
    res.status(404).json({
      status: "fail",
      message: "User not found",
    });
    return;
  }
  res.status(200).json({
    status: "success",
    message: "User updated successfully",
    data: user,
  });
});

const deleteUser = catchAsycn(async (req, res, _next) => {
  const { id } = req.params;
  const user = await userService.deleteUser(id, { isDeleted: true });
  if (!user) {
    res.status(404).json({
      status: "fail",
      message: "User not found",
    });
    return;
  }
  res.status(200).json({
    status: "success",
    message: "User deleted successfully",
    data: user,
  });
});
const getUser = catchAsycn(async (req, res, _next) => {
  const { id } = req.params;
  const query: Partial<Iuser> = req.query as Partial<Iuser>;
  const user = await userService.getUser(id, query);
  if (!user) {
    res.status(404).json({
      status: "fail",
      message: "User not found",
    });
    return;
  }
  res.status(200).json({
    status: "success",
    message: "User retrieved successfully",
    data: user,
  });
});
export const userController = {
  createUser,
  userUpdate,
  deleteUser,
  getUser,
};
