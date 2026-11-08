"use client";

import { useState } from "react";
import Link from "next/link";
import LoginDialog from "./LoginDialog";
import SignupDialog from "./SignupDialog";
import LogoutDialog from "./LogoutDialog";
import { useSessionContext } from "@/context/SessionContext";
import { useRouter } from "next/navigation";

export const Error401 = ({ title, description }: { title?: string; description?: string }) => {
  const [dialog, setDialog] = useState<"login" | "signup" | "logout" | null>(null);
  const { session, status } = useSessionContext();
  const router = useRouter();

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
      <div className="max-w-xl">
        <h1 className="learning-display text-4xl leading-tight text-stone-900 sm:text-5xl">{session ? "Let’s reconnect your account" : title || "Log in to keep learning"}</h1>
        <p className="mt-5 text-base leading-7 text-stone-600">{session ? "Your session needs to be renewed. Log out, then log back in to continue." : description || "Log in to access your saved videos, likes, and viewing history."}</p>
        {status === "loading" ? <p role="status" className="mt-7 text-sm text-stone-600">Checking your account…</p> :
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setDialog(session ? "logout" : "login")} className="min-h-12 rounded-lg bg-primary-blue px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue">{session ? "Log out" : "Log in"}</button>
            {!session && <button type="button" onClick={() => setDialog("signup")} className="min-h-12 rounded-lg border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue">Create an account</button>}
            {session && <button type="button" onClick={() => router.refresh()} className="min-h-12 rounded-lg border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue">Try again</button>}
          </div>}
        <Link href="/topics" className="mt-5 inline-flex min-h-11 items-center text-sm text-stone-600 underline decoration-stone-300 underline-offset-4 transition-colors hover:text-primary-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue">Explore topics while you’re here</Link>
      </div>
      <SignupDialog isOpen={dialog === "signup"} onClose={() => setDialog(null)} />
      <LoginDialog isOpen={dialog === "login"} onClose={() => setDialog(null)} />
      <LogoutDialog isOpen={dialog === "logout"} onClose={() => setDialog(null)} />
    </section>
  );
};
