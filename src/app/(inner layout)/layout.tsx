"use client"
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSearchParams } from "next/navigation";

export default function InnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const topic = searchParams.get("topic") || "";
  const subtopic = searchParams.get("subtopic") || "";
  return (
    <>
      <section>
        <Header />
      </section>
      {children}
      <section>
        <Footer />
      </section>
    </>
  );
}
