import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy | My Torah Today" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-5 px-5 py-12 leading-relaxed text-stone-700 sm:px-8">
      <h1 className="learning-display text-4xl text-stone-900">Privacy</h1>
      <h2 className="text-xl font-semibold text-stone-900">Account security logs</h2>
      <p>
        When you submit a login or registration request, Dynamiq may record your IP address
        and a request ID to investigate account abuse and troubleshoot sign-in problems.
        Netlify stores these records in its operational logs according to the site’s hosting
        plan. Dynamiq uses these records for security and troubleshooting.
      </p>
      <p>
        For questions about these logs, contact{" "}
        <a className="text-primary-blue underline" href="https://dynamiq.dev">Dynamiq</a>.
      </p>
    </main>
  );
}
