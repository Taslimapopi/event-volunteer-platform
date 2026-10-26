import {
  Schema,
  model,
  models,
  type Model,
  type InferSchemaType,
} from "mongoose";

export const EVENT_STATUSES = ["draft", "published", "closed"] as const;

const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    requiredSkills: { type: [String], default: [] },
    registrationDeadline: { type: Date, required: true },
    status: { type: String, enum: EVENT_STATUSES, default: "draft" },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

eventSchema.index({ title: "text" });

export type EventDoc = InferSchemaType<typeof eventSchema>;

export const Event =
  (models.Event as Model<EventDoc>) || model<EventDoc>("Event", eventSchema);
