"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Slice = { name: string; value: number };
type PerEvent = { name: string; registered: number; capacity: number };

type Props = {
  byCategory: Slice[];
  perEvent: PerEvent[];
  timeline: Slice[];
  volunteerStatus: Slice[];
};

const COLORS = [
  "#4f46e5",
  "#06b6d4",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
];

// chart e data na thakle faka chart na dekhiye message dekhai
function ChartCard({
  title,
  empty,
  children,
}: {
  title: string;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-semibold">{title}</h2>
      {empty ? (
        <p className="flex h-72 items-center justify-center text-sm text-gray-500">
          Not enough data yet
        </p>
      ) : (
        <div className="h-72">{children}</div>
      )}
    </div>
  );
}

function PieBlock({ data }: { data: Slice[] }) {
  // Pie ke fill data r bhitore diye dei
  const colored = data.map((d, i) => ({
    ...d,
    fill: COLORS[i % COLORS.length],
  }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={colored}
          dataKey="value"
          nameKey="name"
          outerRadius={90}
          label
        />
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default function AnalyticsCharts({
  byCategory,
  perEvent,
  timeline,
  volunteerStatus,
}: Props) {
  const hasValues = (d: Slice[]) => d.some((x) => x.value > 0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="Events by category" empty={byCategory.length === 0}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={byCategory.map((d, i) => ({
              ...d,
              fill: COLORS[i % COLORS.length],
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" name="Events" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Registrations vs capacity"
        empty={perEvent.length === 0}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={perEvent}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="registered" name="Registered" fill="#4f46e5" />
            <Bar dataKey="capacity" name="Capacity" fill="#cbd5e1" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Upcoming vs completed events"
        empty={!hasValues(timeline)}
      >
        <PieBlock data={timeline} />
      </ChartCard>

      <ChartCard title="Volunteer status" empty={!hasValues(volunteerStatus)}>
        <PieBlock data={volunteerStatus} />
      </ChartCard>
    </div>
  );
}
