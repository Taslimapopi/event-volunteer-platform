"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const role = session?.user.role;

  const links = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
  ];
  if (role === "organizer") {
    links.push(
      { href: "/organizer/dashboard", label: "Dashboard" },
      { href: "/organizer/events", label: "Manage Events" },
      { href: "/organizer/events/new", label: "Create Event" },
      { href: "/organizer/analytics", label: "Analytics" },
    );
  }
  if (role === "volunteer") {
    links.push(
      { href: "/volunteer/dashboard", label: "Dashboard" },
      { href: "/volunteer/my-events", label: "My Events" },
    );
  }

  const linkClass = "text-sm text-gray-700 hover:text-indigo-600";

  const authArea =
    status === "loading" ? null : session ? (
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
      >
        Log out
      </button>
    ) : (
      <>
        <Link
          href="/login"
          className={linkClass}
          onClick={() => setOpen(false)}
        >
          Log in
        </Link>
        <Link
          href="/register"
          onClick={() => setOpen(false)}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
        >
          Register
        </Link>
      </>
    );

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-indigo-600">
          VolunteerHub
        </Link>

        {/* desktop */}
        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </Link>
          ))}
          {authArea}
        </div>

        {/* mobile menu button */}
        <button
          className="text-2xl md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {/* mobile menu */}
      {open && (
        <div className="flex flex-col gap-3 border-t px-4 py-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex items-center gap-4">{authArea}</div>
        </div>
      )}
    </header>
  );
}
