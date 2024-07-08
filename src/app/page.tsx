import Header from "../components/header";
import Footer from "../components/footer"

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-50">
        <div className="">
          <iframe
            width="736"
            height="414"
            src="https://www.youtube.com/embed/oWNTwP8GbtA"
            title="[1245] Melachim 1 - 7 (until pasuk 23) Highlighting the details that matter"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="rounded-2xl shadow-lg border-0"
          ></iframe>
        </div>
      </main>
      <Footer />
    </>
  );
}
