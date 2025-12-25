import { Types } from "mongoose";

export interface IBlog {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  authorId: Types.ObjectId;
  published?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
