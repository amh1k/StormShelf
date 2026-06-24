import mongoose, { Schema, type HydratedDocument, type Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";

interface IUser {
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
  refreshToken?: string;
}

interface IUserMethods {
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): Promise<string>;
  generateRefreshToken(): Promise<string>;
}

type UserModel = Model<IUser, Record<string, never>, IUserMethods>;
type IUserDocument = HydratedDocument<IUser, IUserMethods>;

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
};

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function (): Promise<string> {
  return jwt.sign(
    { _id: this._id, email: this.email, username: this.username },
    requiredEnv("ACCESS_TOKEN_SECRET"),
    {
      expiresIn: requiredEnv("ACCESS_TOKEN_EXPIRY") as SignOptions["expiresIn"],
    },
  );
};

userSchema.methods.generateRefreshToken = async function (): Promise<string> {
  return jwt.sign({ _id: this._id }, requiredEnv("REFRESH_TOKEN_SECRET"), {
    expiresIn: requiredEnv("REFRESH_TOKEN_EXPIRY") as SignOptions["expiresIn"],
  });
};

const User = mongoose.model<IUser, UserModel>("User", userSchema);

export { User };
export type { IUser, IUserDocument };
