import { getProjects } from "@/lib/github";
import Animations from "@/components/providers/Animations";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import Hero from "@/components/sections/Hero";
import Journey from "@/components/sections/Journey";
import Marquee from "@/components/sections/Marquee";
import Research from "@/components/sections/Research";
import Speaking from "@/components/sections/Speaking";
import Work from "@/components/sections/Work";

export default async function Home() {
  const projects = await getProjects();
  const stars = projects.reduce((sum, p) => sum + p.stars, 0);

  return (
    <>
      <main id="main">
        <Hero />
        <About stars={stars} />
        <Marquee />
        <Work projects={projects} stars={stars} />
        <Research />
        <Journey />
        <Speaking />
        <Contact />
      </main>
      <Footer />
      <Animations />
    </>
  );
}
