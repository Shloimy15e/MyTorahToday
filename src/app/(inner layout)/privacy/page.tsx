import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy | My Torah Today" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-5 px-5 py-12 leading-relaxed text-stone-700 sm:px-8">
      <h1 className="learning-display text-4xl text-stone-900">Privacy</h1>
      <h2 className="text-xl font-semibold text-stone-900">Request logs</h2>
      <p>
        When you visit My Torah Today, Dynamiq may record your IP address and a request ID
        to investigate abuse and troubleshoot site errors.
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
