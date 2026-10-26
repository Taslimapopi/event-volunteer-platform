import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Access denied</h1>
      <p className="text-gray-600">
        You don&apos;t have permission to view this page.
      </p>
      <Link href="/" className="text-indigo-600 hover:underline">
        Go home
      </Link>
    </main>
  );
}
