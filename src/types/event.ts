export type EventItem = {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  capacity: number;
  requiredSkills: string[];
  registrationDeadline: string;
  status: "draft" | "published" | "closed";
  taken: number;
  available: number;
};
