const colors: Record<string, string> = {
  registered: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  attended: "bg-purple-100 text-purple-700",
  cancelled: "bg-gray-200 text-gray-700",
  draft: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-700",
  closed: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        colors[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
