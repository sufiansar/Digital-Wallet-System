import { Types } from "mongoose";
import { IBlog } from "./blog.interface";
import Post, { Blog } from "./blog.model";
import { Role } from "../user/user.interface";

const createBlog = async (
  userId: string,
  body: any,
  file?: Express.Multer.File
) => {
  const payload: any = { ...body };

  if (file) {
    payload.coverImage = file.path;
  }

  if (payload.published !== undefined) {
    payload.published =
      payload.published === true || payload.published === "true";
  }

  payload.slug = payload.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const blog = await Blog.create({
    ...payload,
    authorId: new Types.ObjectId(userId),
  });

  return blog;
};

const getAllBlogs = async (): Promise<IBlog[]> => {
  const blogs = await Blog.find();
  return blogs;
};
const getBlogById = async (blogId: string): Promise<IBlog | null> => {
  const blog = await Blog.findById(blogId);
  return blog;
};
const updateBlog = async (
  blogId: string,
  payload: Partial<IBlog>
): Promise<IBlog | null> => {
  const blog = await Blog.findByIdAndUpdate(blogId, payload, {
    new: true,
    runValidators: true,
  });
  return blog;
};
const deleteBlog = async (blogId: string, userId: string) => {
  const blogToDelete = await Blog.findById(blogId);
  if (!blogToDelete) {
    throw new Error("Blog not found");
  }

  const blog = await Blog.findByIdAndDelete(blogId);
  return blog;
};

export const blogService = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
