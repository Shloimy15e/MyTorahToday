import Image from "next/image";

export default function HeroWithTitle(props: { title: string }) {
  return (
    <div className="relative w-full bg-gray-950 flex justify-center items-center">
      <Image
        priority={true}
        src="/images/banner.jpg"
        alt="banner"
        width={30000}
        height={1080}
        className={"object-cover opacity-60"}
      />
      <h1 className="absolute capitalize text-white text-3xl md:text-5xl lg:text-6xl font-bold">
        {props.title}
      </h1>
    </div>
  );
}
