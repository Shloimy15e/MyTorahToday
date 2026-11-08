"use client";

import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useToast } from "@/context/ToastProvider";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

type LoginValues = { username: string; password: string };

export function LoginForm({ onClose, onSignup }: { onClose: () => void; onSignup?: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();
  const router = useRouter();
  const id = useId();

  const onSubmit = async (data: LoginValues) => {
    setIsLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", { username: data.username, password: data.password, redirect: false });
      if (!result || result.error) {
        setError("That username or password wasn’t recognized. Please try again.");
        return;
      }
      showToast("Logged in successfully", "success");
      onClose();
      router.refresh();
    } catch {
      setError("We couldn’t connect. Please try logging in again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "block min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-base text-stone-900 outline-none transition-colors placeholder:text-stone-500 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-stone-100";
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-busy={isLoading}>
      <div>
        <label htmlFor={`${id}-username`} className="block text-sm font-medium leading-5 text-stone-800">Username or email</label>
        <input id={`${id}-username`} type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} required disabled={isLoading} aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? `${id}-username-error` : undefined} className={`${inputClass} mt-1.5`} {...register("username", { required: "Enter your username or email.", validate: value => value.trim() !== "" || "Enter your username or email." })} />
        {errors.username && <p id={`${id}-username-error`} className="mt-1.5 text-sm text-red-700">{errors.username.message}</p>}
      </div>
      <div>
        <label htmlFor={`${id}-password`} className="block text-sm font-medium leading-5 text-stone-800">Password</label>
        <div className="relative mt-1.5">
          <input id={`${id}-password`} type={showPassword ? "text" : "password"} autoComplete="current-password" required disabled={isLoading} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? `${id}-password-error` : undefined} className={`${inputClass} pr-12`} {...register("password", { required: "Enter your password.", validate: value => value.trim() !== "" || "Enter your password." })} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute right-1 top-0 flex h-11 w-11 items-center justify-center rounded-lg text-stone-500 hover:text-primary-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue">
            {showPassword ? <EyeSlashIcon aria-hidden="true" className="h-5 w-5" /> : <EyeIcon aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && <p id={`${id}-password-error`} className="mt-1.5 text-sm text-red-700">{errors.password.message}</p>}
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">{error}</p>}
      <button type="submit" disabled={isLoading} className="min-h-12 w-full rounded-lg bg-primary-blue px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-wait disabled:opacity-60">{isLoading ? "Logging in…" : "Log in"}</button>
      {onSignup && <p className="text-center text-sm text-stone-600">New to My Torah Today? <button type="button" onClick={onSignup} disabled={isLoading} className="inline-flex min-h-11 items-center rounded-md px-1 font-semibold text-primary-blue underline decoration-primary-blue/30 underline-offset-4 transition-colors hover:decoration-primary-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-wait disabled:opacity-60">Create an account</button></p>}
    </form>
  );
}
