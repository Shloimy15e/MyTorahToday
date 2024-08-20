import Header from "@/components/Header";
import MainTopics from "@/components/MainTopics";
import Footer from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Torah Today - Topics",
}
export default function Topics() {
  return (
    <>
      <Header />
      <MainTopics />
      <Footer />
    </>
  );
}