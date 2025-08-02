import { model, Schema } from "mongoose";
import { IAuths, Isactive, Iuser, Role } from "./user.interface";

const authschema = new Schema<IAuths>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  {
    versionKey: false,
    _id: false,
  }
);

const userSchema = new Schema<Iuser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number },
    password: { type: String },
    picture: { type: String, default: "" },

    role: { type: String, enum: Object.values(Role), default: Role.USER },

    isActive: {
      type: String,
      enum: Object.values(Isactive),
      default: Isactive.ACTIVE,
    },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: true },

    auths: [authschema],
  },
  { timestamps: true, versionKey: false }
);

export const User = model("User", userSchema);
export default User;
