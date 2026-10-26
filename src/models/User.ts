import {
  Schema,
  model,
  models,
  type Model,
  type InferSchemaType,
} from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["organizer", "volunteer"], required: true },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema>;

export const User =
  (models.User as Model<UserDoc>) || model<UserDoc>("User", userSchema);
