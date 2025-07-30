import { Types } from "mongoose";

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
  AGENT = "AGENT",
}

export interface IAuths {
  providerId: string;
  provider: "google" | "credentials";
}

export enum Isactive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export interface Iuser {
  isModified: any;
  _id?: Types.ObjectId;
  name: string;
  email: string;
  phone?: number;
  password: string;
  picture?: string;
  defaultMoney?: number;
  agentProfile?: {
    commissionRate?: number;
  };
  commissionRate?: number;
  role?: Role;
  isActive?: Isactive;
  isDeleted?: boolean;
  isVerified?: boolean;
  auths: IAuths[];
}
