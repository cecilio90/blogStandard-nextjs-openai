import Image from "next/image";
import HeroImage from "../public/hero.webp"
import { Logo } from "../components/Logo/Logo";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen w-screen overflow-hidden flex justify-center items-center relative">
      <Image src={HeroImage} alt="hero" className="absolute" />
      <div className="relative z-10 text-white px-10 py-5 text-center max-w-screen-sm bg-slate-900/90 rounded-md backdrop-blur-md">
        <Logo />
        <p>
          The AI-powered SAAS solution to generate SEO-optimizzed blog posts in minutes.
          Get high-quality content, without sacrificing your time.
        </p>
        <Link href="/post/new" className="btn">Begin</Link> 
      </div>
    </div>
  );
}
