import { model, Schema } from "mongoose";
import { IBlog } from "./blog.interface";

const postSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String, default: "" },
    tags: { type: [String], default: [] },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    published: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

export const Blog = model<IBlog>("Blog", postSchema);
export default Blog;
