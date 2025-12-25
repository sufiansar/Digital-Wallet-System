import { Types } from "mongoose";
import { IBlog } from "./blog.interface";
import Post, { Blog } from "./blog.model";

const createBlog = async (
  userId: string,
  body: any,
  file?: Express.Multer.File
) => {
  const payload: any = { ...body };

  if (file) {
    payload.coverImage = file.path;
  }

  if (typeof payload.tags === "string") {
    payload.tags = payload.tags.split(",").map((t: string) => t.trim());
  }

  // normalize published flag
  if (payload.published !== undefined) {
    payload.published =
      payload.published === true || payload.published === "true";
  }

  // generate slug from title
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
  if (blogId !== payload.authorId?.toString()) {
    throw new Error("You are not authorized to update this blog");
  }
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
  if (blogToDelete.authorId.toString() !== userId) {
    throw new Error("You are not authorized to delete this blog");
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
