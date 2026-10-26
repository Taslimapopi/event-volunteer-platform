"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    const res = await signIn("credentials", { ...data, redirect: false });

    if (res?.error) {
      toast.error("Invalid email or password");
      return;
    }

    toast.success("Welcome back!");

    const session = await getSession();
    const fallback =
      session?.user.role === "organizer"
        ? "/organizer/dashboard"
        : "/volunteer/dashboard";

    // callbackUrl shudhu nijer site er path hole-i use korbo (security)
    const callbackUrl = searchParams.get("callbackUrl");
    router.push(callbackUrl?.startsWith("/") ? callbackUrl : fallback);
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {isSubmitting ? "Logging in..." : "Log in"}
      </button>

      <p className="text-center text-sm text-gray-600">
        No account?{" "}
        <Link href="/register" className="text-indigo-600 hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}
