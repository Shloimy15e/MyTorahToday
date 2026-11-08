"use client";

import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { useState } from "react";
import { useToast } from "../context/ToastProvider";
import { signOut } from "next-auth/react";
import { useSessionContext } from "@/context/SessionContext";
import { useRouter } from "next/navigation";

export default function LogoutDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { showToast } = useToast();
  const { session } = useSessionContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const handleLogout = async () => {
    if (!session) { onClose(); return; }
    setIsLoading(true);
    setError("");
    try {
      await signOut({ redirect: false });
      document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      showToast("Logged out successfully", "success");
      onClose();
      router.refresh();
    } catch {
      setError("We couldn’t log you out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop transition className="fixed inset-0 bg-stone-950/45 transition-opacity duration-200 data-[closed]:opacity-0 motion-reduce:duration-75" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel transition className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl transition duration-200 ease-out data-[closed]:translate-y-2 data-[closed]:opacity-0 motion-reduce:transform-none motion-reduce:duration-75 sm:p-8">
            <DialogTitle className="learning-display text-4xl text-stone-900">Log out?</DialogTitle>
            <Description className="mt-3 text-sm leading-6 text-stone-600">Your saved videos and likes will be here when you return.</Description>
            {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row" aria-busy={isLoading}>
              <button type="button" onClick={onClose} disabled={isLoading} data-autofocus className="min-h-12 flex-1 rounded-lg border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue disabled:opacity-60">Stay logged in</button>
              <button type="button" onClick={handleLogout} disabled={isLoading} className="min-h-12 flex-1 rounded-lg bg-primary-blue px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue disabled:cursor-wait disabled:opacity-60">{isLoading ? "Logging out…" : "Log out"}</button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
