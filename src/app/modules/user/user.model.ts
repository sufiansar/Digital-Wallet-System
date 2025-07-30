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

const agentProfileSchema = new Schema(
  {
    commissionRate: {
      type: Number,
      default: 0.5,
    },
  },
  {
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

    defaultMoney: {
      type: Number,
      default: 0,
    },

    agentProfile: {
      type: agentProfileSchema,
      required: false,
    },

    isActive: {
      type: String,
      enum: Object.values(Isactive),
      default: Isactive.ACTIVE,
    },
    isDeleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },

    auths: [authschema],
  },
  { timestamps: true, versionKey: false }
);

userSchema.pre("save", function (this: any, next) {
  if (this.isNew || this.isModified("role")) {
    if (this.role === Role.USER) {
      this.defaultMoney = 50;
      (this as any).agentProfile = undefined;
    } else if (this.role === Role.AGENT) {
      this.defaultMoney = 50;
      if (!(this as any).agentProfile) {
        (this as any).agentProfile = { commissionRate: 0.5 };
      }
    } else if (this.role === Role.ADMIN) {
      this.defaultMoney = 0;
      (this as any).agentProfile = undefined;
    }
  }

  next();
});

export const User = model("User", userSchema);
export default User;
