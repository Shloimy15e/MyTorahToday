import Image from "next/image";

export default function HeroWithTitle(props: { title: string }) {
  return (
    <div className="relative w-full bg-gray-950 flex justify-center items-center">
      <picture className="w-full">
        <source srcSet="/images/banner.webp" type="image/webp" />
        <Image
          src="/images/banner.jpg" // Fallback image
          alt="banner"
          width={1707}
          height={282}
          className="object-cover w-full opacity-60"
        />
      </picture>
      <h1 className="absolute capitalize text-white text-3xl md:text-5xl lg:text-6xl font-bold">
        {props.title}
      </h1>
    </div>
  );
}
