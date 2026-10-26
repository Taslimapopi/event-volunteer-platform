import {
  Schema,
  model,
  models,
  type Model,
  type InferSchemaType,
} from "mongoose";

export const REG_STATUSES = [
  "registered",
  "confirmed",
  "attended",
  "cancelled",
] as const;

const registrationSchema = new Schema(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    selectedSkill: { type: String, required: true },
    status: { type: String, enum: REG_STATUSES, default: "registered" },
  },
  { timestamps: true },
);

// ek user ek event e ekbar-i register korte parbe
registrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export type RegistrationDoc = InferSchemaType<typeof registrationSchema>;

export const Registration =
  (models.Registration as Model<RegistrationDoc>) ||
  model<RegistrationDoc>("Registration", registrationSchema);
