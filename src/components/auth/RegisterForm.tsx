"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/lib/validators/auth";

export default function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "volunteer" },
  });

  async function onSubmit(data: RegisterInput) {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();

    if (!res.ok) {
      toast.error(json.error ?? "Registration failed");
      return;
    }

    toast.success("Account created! Please log in.");
    router.push("/login");
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Name</label>
        <input
          {...register("name")}
          className={inputClass}
          placeholder="Your name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          {...register("email")}
          type="email"
          className={inputClass}
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Password</label>
        <input
          {...register("password")}
          type="password"
          className={inputClass}
          placeholder="At least 6 characters"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          I want to join as
        </label>
        <select {...register("role")} className={inputClass}>
          <option value="volunteer">Volunteer</option>
          <option value="organizer">Organizer</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-600 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
