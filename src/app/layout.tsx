import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { roles, site, socials } from "@/lib/content";
import SceneLoader from "@/components/canvas/SceneLoader";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Cursor from "@/components/ui/Cursor";
import Nav from "@/components/ui/Nav";
import PhaseHud from "@/components/ui/PhaseHud";
import Preloader from "@/components/ui/Preloader";
import Terminal from "@/components/ui/Terminal";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  keywords: [
    site.name,
    "AI engineer",
    "machine learning",
    "large language models",
    "AI agents",
    "Nomos",
    "Leaf Monkey Labs",
    "Stekz",
    "Sri Lanka",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: "en_US",
    firstName: site.firstName,
    lastName: site.lastName,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${site.name} — ${site.tagline}` }],
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description, images: ["/og.png"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#07070a",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: site.url,
  description: site.description,
  jobTitle: roles[0].title,
  worksFor: roles.slice(0, 2).map((r) => ({ "@type": "Organization", name: r.org, url: r.href })),
  alumniOf: { "@type": "CollegeOrUniversity", name: "University of Moratuwa" },
  address: { "@type": "PostalAddress", addressLocality: site.location.city, addressCountry: "LK" },
  knowsAbout: ["Large language models", "AI agents", "Machine learning", "Programming languages", "Open source"],
  sameAs: socials.map((s) => s.href),
};

// Runs before first paint: enables JS-only styles, shows the preloader once per session,
// and removes any service worker left over from the previous site.
const boot = `(function(){var d=document.documentElement;d.classList.add('js');var r=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;var v=false;try{v=!!sessionStorage.getItem('visited')}catch(e){}d.classList.add(v||r?'no-preloader':'is-loading');if('serviceWorker'in navigator)navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(x){x.unregister()})});setTimeout(function(){if(!window.__animReady)d.classList.add('reveal-all');if(!window.__preloaderDone){d.classList.remove('is-loading');d.classList.add('no-preloader')}},7000)})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SceneLoader />
        <div className="vignette" aria-hidden="true" />
        <Preloader />
        <Nav />
        {children}
        <PhaseHud />
        <Terminal />
        <Cursor />
        <div className="grain" aria-hidden="true" />
        <SmoothScroll />
      </body>
    </html>
  );
}
