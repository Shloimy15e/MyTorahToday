import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TopicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
