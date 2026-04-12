import BackToTopButton from "@/components/ui/BackToTopButton";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function InnerLayout({
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
      <BackToTopButton />
      <section>
        <Footer />
      </section>
    </>
  );
}
