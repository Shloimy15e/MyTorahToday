"use client";

import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useToast } from "../context/ToastProvider";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { LoginForm } from "./ui/LoginForm";
import scrollArea from "./ui/ScrollArea.module.css";
import { motion, useReducedMotion } from "framer-motion";

type SignupValues = { username: string; email: string; password: string; confirmPassword: string };

export default function SignupDialog({ isOpen, onClose, initialView = "signup" }: { isOpen: boolean; onClose: () => void; initialView?: "login" | "signup" }) {
  const [view, setView] = useState(initialView);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentObserver = useRef<ResizeObserver | null>(null);
  const [contentHeight, setContentHeight] = useState<number | "auto">("auto");
  const reducedMotion = useReducedMotion();
  const measureContent = useCallback((node: HTMLDivElement | null) => {
    contentObserver.current?.disconnect();
    if (!node) return;
    setContentHeight(node.offsetHeight);
    contentObserver.current = new ResizeObserver(() => setContentHeight(node.offsetHeight));
    contentObserver.current.observe(node);
  }, []);
  useEffect(() => {
    if (isOpen) setView(initialView);
  }, [isOpen, initialView]);
  useEffect(() => {
    if (isOpen) titleRef.current?.focus({ preventScroll: true });
  }, [view, isOpen]);
  const { showToast } = useToast();
  const router = useRouter();
  const id = useId();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SignupValues>();

  const onSubmit = async (data: SignupValues) => {
    let accountIsCreated = accountCreated;
    setIsLoading(true);
    setError("");
    try {
      if (!accountCreated) {
        const response = await fetch("/api/auth/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const details = body?.error;
          const message = typeof details === "string" ? details : details && typeof details === "object"
            ? Object.values(details).flat().filter((value): value is string => typeof value === "string").join(" ")
            : "";
          setError(message || "We couldn’t create your account. Please check your details and try again.");
          return;
        }
        setAccountCreated(true);
        accountIsCreated = true;
      }
      setIsLoggingIn(true);
      const result = await signIn("credentials", { redirect: false, username: data.username, password: data.password });
      if (!result || result.error) {
        setError("Your account was created, but we couldn’t log you in. Try logging in below.");
        return;
      }
      showToast("Your account is ready", "success");
      setAccountCreated(false);
      reset();
      onClose();
      router.refresh();
    } catch {
      setError(accountIsCreated
        ? "Your account was created. Please try logging in again."
        : "We couldn’t connect. Please try again.");
    } finally {
      setIsLoading(false);
      setIsLoggingIn(false);
    }
  };

  const inputClass = "block min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-base text-stone-900 outline-none transition-colors focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-stone-100";
  const visibilityButton = (
    <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide passwords" : "Show passwords"} aria-pressed={showPassword} className="absolute right-1 top-0 flex h-11 w-11 items-center justify-center rounded-lg text-stone-500 hover:text-primary-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue">
      {showPassword ? <EyeSlashIcon aria-hidden="true" className="h-5 w-5" /> : <EyeIcon aria-hidden="true" className="h-5 w-5" />}
    </button>
  );

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop transition className="fixed inset-0 bg-stone-950/45 transition-opacity duration-200 data-[closed]:opacity-0 motion-reduce:duration-75" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel transition className={`${scrollArea.scrollbar} relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl bg-white p-6 shadow-xl transition duration-200 ease-out data-[closed]:translate-y-2 data-[closed]:opacity-0 motion-reduce:transform-none motion-reduce:duration-75 sm:p-7`}>
            <button type="button" onClick={onClose} aria-label={view === "login" ? "Close login" : "Close signup"} className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue"><XMarkIcon className="h-5 w-5" aria-hidden="true" /></button>
            <motion.div initial={false} animate={{ height: contentHeight }} transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <div ref={measureContent} className="flow-root">
            <DialogTitle ref={titleRef} tabIndex={-1} className="learning-display pr-8 text-3xl leading-tight text-stone-900 outline-none sm:text-[2rem]">{view === "login" ? "Welcome back" : accountCreated ? "Your account is ready" : "Make room for learning"}</DialogTitle>
            <Description className="mt-2 text-sm leading-6 text-stone-600">{view === "login" ? "Log in to save videos and return to your learning." : accountCreated ? "Log in to start saving your favorite videos." : "Save videos and keep track of what you’ve watched."}</Description>
            <motion.div key={view} initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.18, ease: "easeOut" }}>
            {view === "login" ? <div className="mt-5"><LoginForm onClose={onClose} onSignup={() => setView("signup")} /></div> : <>
            <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)} aria-busy={isLoading}>
              <div>
                <label htmlFor={`${id}-username`} className="block text-sm font-medium leading-5 text-stone-800">Username</label>
                <input id={`${id}-username`} type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} required disabled={isLoading} readOnly={accountCreated} className={`${inputClass} mt-1.5`} aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? `${id}-username-error` : undefined} {...register("username", { required: "Enter a username.", validate: value => value.trim() !== "" || "Enter a username." })} />
                {errors.username && <p id={`${id}-username-error`} className="mt-1.5 text-sm text-red-700">{errors.username.message}</p>}
              </div>
              {!accountCreated && <div>
                <label htmlFor={`${id}-email`} className="block text-sm font-medium leading-5 text-stone-800">Email <span className="font-normal text-stone-500">(optional)</span></label>
                <input id={`${id}-email`} type="email" autoComplete="email" disabled={isLoading} className={`${inputClass} mt-1.5`} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? `${id}-email-error` : undefined} {...register("email", { pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Enter a valid email address." } })} />
                {errors.email && <p id={`${id}-email-error`} className="mt-1.5 text-sm text-red-700">{errors.email.message}</p>}
              </div>}
              <div>
                <label htmlFor={`${id}-password`} className="block text-sm font-medium leading-5 text-stone-800">Password</label>
                <div className="relative mt-1.5">
                  <input id={`${id}-password`} autoComplete={accountCreated ? "current-password" : "new-password"} type={showPassword ? "text" : "password"} disabled={isLoading} required className={`${inputClass} pr-12`} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? `${id}-password-error` : `${id}-password-hint`} {...register("password", { required: "Enter a password.", minLength: { value: 8, message: "Password must be at least 8 characters long." }, validate: { hasNumber: value => /\d/.test(value) || "Password must contain at least one number.", doesNotContainUsername: (value, values) => !value.includes(values.username) || "Password cannot contain your username." } })} />
                  {visibilityButton}
                </div>
                {errors.password ? <p id={`${id}-password-error`} className="mt-1.5 text-sm text-red-700">{errors.password.message}</p> : <p id={`${id}-password-hint`} className="mt-1.5 text-xs leading-5 text-stone-600">At least 8 characters and one number. Leave out your username.</p>}
              </div>
              {!accountCreated && <div>
                <label htmlFor={`${id}-confirm`} className="block text-sm font-medium leading-5 text-stone-800">Confirm password</label>
                <input id={`${id}-confirm`} autoComplete="new-password" type={showPassword ? "text" : "password"} disabled={isLoading} required className={`${inputClass} mt-1.5`} aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? `${id}-confirm-error` : undefined} {...register("confirmPassword", { required: "Confirm your password.", validate: (value, values) => value === values.password || "Passwords do not match." })} />
                {errors.confirmPassword && <p id={`${id}-confirm-error`} className="mt-1.5 text-sm text-red-700">{errors.confirmPassword.message}</p>}
              </div>}
              {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">{error}</p>}
              <button type="submit" disabled={isLoading} className="min-h-12 w-full rounded-lg bg-primary-blue px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-wait disabled:opacity-60">{isLoggingIn ? "Logging in…" : isLoading ? "Creating account…" : accountCreated ? "Log in" : "Create account"}</button>
            </form>
            <p className="mt-3 text-center text-sm text-stone-600">Already have an account? <button type="button" onClick={() => setView("login")} disabled={isLoading} className="inline-flex min-h-11 items-center rounded-md px-1 font-semibold text-primary-blue underline decoration-primary-blue/30 underline-offset-4 transition-colors hover:decoration-primary-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-wait disabled:opacity-60">Log in</button></p>
            </>}
            </motion.div>
            </div>
            </motion.div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
