import { Request, Response } from "express";
import { catchAsycn } from "../../utilities/catchAsync";
import { blogService } from "./blog.service";
import { sendResponse } from "../../utilities/sendResponse";
import AppError from "../../errors/appError";
import { IBlog } from "./blog.interface";

const createBlog = catchAsycn(async (req: Request, res: Response) => {
  const userId = (req as any).user._id;

  const payload = (() => {
    if (!req.body || !req.body.data) return req.body;
    try {
      return JSON.parse(req.body.data);
    } catch (err) {
      throw new AppError(
        400,
        "Invalid JSON payload in 'data' field",
        "INVALID_JSON"
      );
    }
  })();

  const fileUrl = (() => {
    if (req.file) return (req.file as Express.Multer.File).path;
    const files = (req as any).files as Record<string, any[]> | undefined;
    console.log(files);
    if (files) {
      for (const key of ["coverImage", "image", "file"]) {
        const arr = files[key];
        if (arr && arr.length > 0) {
          return arr[0].path;
        }
        console.log(arr);
      }
    }
    console.log(files);
    return undefined;
  })();

  if (!fileUrl) {
    throw new AppError(
      400,
      "Cover image file is required. Send multipart/form-data with a file field named coverImage, image, or file.",
      "FILE_REQUIRED"
    );
  }

  payload.coverImage = fileUrl;

  const blog = await blogService.createBlog(userId, payload);

  console.log(payload);
  sendResponse(res, {
    success: true,
    successCode: 201,
    message: "Blog created successfully",
    data: blog,
  });
});

const getAllBlogs = catchAsycn(async (req: Request, res: Response) => {
  const blogs = await blogService.getAllBlogs();

  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Blogs fetched successfully",
    data: blogs,
  });
});

const getBlogById = catchAsycn(async (req: Request, res: Response) => {
  const blogId = req.params.id;
  const blog = await blogService.getBlogById(blogId);

  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Blog fetched successfully",
    data: blog,
  });
});

const updateBlog = catchAsycn(async (req: Request, res: Response) => {
  const blogId = req.params.id;

  let payload: any;
  if (req.body.data) {
    payload = JSON.parse(req.body.data);
  } else {
    payload = { ...req.body };
  }

  if (req.file) {
    payload.coverImage = (req.file as Express.Multer.File).path;
  }

  const blog = await blogService.updateBlog(blogId, payload);

  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Blog updated successfully",
    data: blog,
  });
});

const deleteBlog = catchAsycn(async (req: Request, res: Response) => {
  const blogId = req.params.id;
  const userId = req.user._id;
  const blog = await blogService.deleteBlog(blogId, userId);

  sendResponse(res, {
    success: true,
    successCode: 200,
    message: "Blog deleted successfully",
    data: blog,
  });
});
export const BlogController = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
