import VolunteersTable from "@/components/organizer/VolunteersTable";

export default async function VolunteersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <VolunteersTable eventId={id} />
    </main>
  );
}
