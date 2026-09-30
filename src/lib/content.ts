/**
 * Everything the site says lives in this file.
 * Edit copy here — components only handle layout and motion.
 */

export const site = {
  name: "Chandra Irugalbandara",
  firstName: "Chandra",
  lastName: "Irugalbandara",
  // Switch to your custom domain once its DNS points at GitHub Pages.
  url: "https://chandralegend.github.io",
  title: "Chandra Irugalbandara — AI engineer, researcher & builder",
  description:
    "I build reliable AI systems, invent new tools, and make existing ones better. Associate Technical Lead (AI) at Gapstars and founder of Leaf Monkey Labs, building Salli and Pinglo.",
  tagline: "I build reliable AI systems, invent new tools, and make existing ones better.",
  roleLine: "AI engineer · Researcher · Builder",
  location: {
    city: "Colombo",
    country: "Sri Lanka",
    timeZone: "Asia/Colombo",
    coords: "6°55′N 79°51′E",
  },
  // Public contact email. Leave empty to route every CTA to LinkedIn instead.
  email: "irugalbandarachandra@gmail.com",
  availability: ["Speaking", "Client projects", "Investor conversations"],
  nameMeaning: "Chandra — Sanskrit for “moon”.",
};

export type Social = { label: string; handle: string; href: string };

export const socials: Social[] = [
  { label: "LinkedIn", handle: "in/chandralegend", href: "https://www.linkedin.com/in/chandralegend/" },
  { label: "GitHub", handle: "@chandralegend", href: "https://github.com/chandralegend" },
  { label: "X", handle: "@xchandralegend", href: "https://x.com/xchandralegend" },
  { label: "Google Scholar", handle: "197 citations", href: "https://scholar.google.com/citations?user=VepbpE8AAAAJ" },
  { label: "ORCID", handle: "0009-0002-2230-4403", href: "https://orcid.org/0009-0002-2230-4403" },
  { label: "Instagram", handle: "@realchandralegend", href: "https://www.instagram.com/realchandralegend/" },
];

export const linkedin = socials[0].href;

export const roles = [
  { title: "Associate Technical Lead (AI)", org: "Gapstars", href: "https://www.gapstars.net" },
  { title: "Founder", org: "Leaf Monkey Labs", href: "https://leafmonkey.org" },
  { title: "Visiting Lecturer", org: "University of Moratuwa", href: "https://uom.lk" },
];

export const manifesto =
  "I like building things that don’t exist yet — and fixing the ones that almost work. Right now, that means making AI systems reliable enough to trust.";

export const pillars = [
  {
    index: "i",
    title: "Research",
    body: "Peer-reviewed work on making language models cheaper and more dependable in production — including a first-author paper at IEEE ISPASS.",
  },
  {
    index: "ii",
    title: "Products",
    body: "Salli and Pinglo at Leaf Monkey Labs — AI that does real work for real customers, with deterministic engines wherever the numbers have to be right.",
  },
  {
    index: "iii",
    title: "Leading & teaching",
    body: "Technical leadership on agentic AI at Gapstars, and teaching AI beyond the theory at the University of Moratuwa.",
  },
];

export const marquee = [
  "Reliable AI",
  "Agents that do real work",
  "Small models in production",
  "AI × programming languages",
  "Built in Sri Lanka",
  "Thinking outside the box",
];

export type Glyph = "orbits" | "types" | "shell" | "wave" | "lens" | "hub";

export type Project = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  href: string;
  tags: string[];
  glyph: Glyph;
  status: string;
};

/** Products I'm building now, at Leaf Monkey Labs. */
export const projects: Project[] = [
  {
    id: "salli",
    name: "Salli",
    tagline: "Stop guessing. Start knowing.",
    description:
      "Personal finance and tax planning built for Sri Lanka: a real double-entry ledger, a deterministic IRD tax engine, and an AI advisor that explains your numbers but never makes them up.",
    href: "https://salli.leafmonkey.org",
    tags: ["Personal finance", "Tax engine", "AI advisor"],
    glyph: "wave",
    status: "Live",
  },
  {
    id: "pinglo",
    name: "Pinglo",
    tagline: "Turn every enquiry into a paid booking.",
    description:
      "An AI booking assistant for businesses booked by the hour — courts, lessons, coaching. It answers on WhatsApp, Instagram, LINE and web chat, checks the real calendar, holds the slot and takes payment, and hands over to a human any time.",
    href: "https://pinglo.leafmonkey.org",
    tags: ["AI agents", "Bookings", "Payments"],
    glyph: "hub",
    status: "Early access",
  },
];

export const scholar = {
  href: "https://scholar.google.com/citations?user=VepbpE8AAAAJ",
  citations: 197,
  hIndex: 4,
  i10: 3,
  asOf: "Sep 2026",
};

export type Publication = {
  title: string;
  venue: string;
  year: number;
  citations: number;
  summary: string;
  href: string;
  note?: string;
};

export const publications: Publication[] = [
  {
    title: "Scaling Down to Scale Up: A Cost-Benefit Analysis of Replacing OpenAI’s LLM with Open Source SLMs in Production",
    venue: "IEEE ISPASS 2024",
    year: 2024,
    citations: 121,
    note: "First author",
    summary: "When can a product team swap GPT-4 for self-hosted small language models — and what does it really cost them?",
    href: "https://arxiv.org/abs/2312.14972",
  },
  {
    title: "Meaning Typed Prompting: A Technique for Efficient, Reliable Structured Output Generation",
    venue: "arXiv",
    year: 2024,
    citations: 5,
    summary: "Using types, meanings and code abstractions — instead of rigid JSON schemas — to get dependable structured output from LLMs.",
    href: "https://arxiv.org/abs/2410.18146",
  },
  {
    title: "LLMs are Meaning-Typed Code Constructs",
    venue: "arXiv",
    year: 2024,
    citations: 1,
    summary: "The original Meaning-Typed Programming paper: treating LLM calls as typed constructs of the programming language itself.",
    href: "https://arxiv.org/abs/2405.08965v1",
  },
  {
    title: "A Secure and Smart Home Automation System with Speech Recognition and Power Measurement Capabilities",
    venue: "Sensors (MDPI)",
    year: 2023,
    citations: 52,
    summary: "Private, offline voice control for the home — with per-appliance power tracking, no cloud required.",
    href: "https://doi.org/10.3390/s23135784",
  },
  {
    title: "HomeIO: Offline Smart Home Automation System with Automatic Speech Recognition and Household Power Usage Tracking",
    venue: "IEEE World AI IoT Congress 2022",
    year: 2022,
    citations: 18,
    summary: "A Raspberry Pi hub and ESP32 smart plugs on a local mesh: voice-controlled appliances that keep working when the internet doesn’t.",
    href: "https://ieeexplore.ieee.org/document/9817282/",
  },
];

export type JourneyItem = {
  period: string;
  title: string;
  org: string;
  href?: string;
  note: string;
  phase: number; // 0 new moon → 1 full moon, drawn as the timeline bullet
};

export const journey: JourneyItem[] = [
  {
    period: "Now",
    title: "Associate Technical Lead (AI)",
    org: "Gapstars",
    href: "https://www.gapstars.net",
    note: "Agentic AI with Stekz, and Data/AI Guild Master — turning ambitious product ideas into dependable, shipped software.",
    phase: 1,
  },
  {
    period: "Now",
    title: "Founder",
    org: "Leaf Monkey Labs",
    href: "https://leafmonkey.org",
    note: "Building Salli, personal finance and tax for Sri Lanka, and Pinglo, an AI booking assistant for businesses booked by the hour.",
    phase: 0.9,
  },
  {
    period: "Now",
    title: "Visiting Lecturer",
    org: "University of Moratuwa",
    href: "https://uom.lk",
    note: "Back where it started — showing students the world of AI beyond the theory.",
    phase: 0.8,
  },
  {
    period: "2024 — 2025",
    title: "Senior AI/ML Engineer",
    org: "Virtusa",
    note: "Agentic customer experience for UnitedHealth Group, built with Google.",
    phase: 0.6,
  },
  {
    period: "2022 — 2024",
    title: "Machine Learning Engineer",
    org: "Jaseci Labs",
    note: "Research and engineering on LLM integration for the Jac language. First-authored “Scaling Down to Scale Up” (ISPASS ’24).",
    phase: 0.45,
  },
  {
    period: "2017 — 2022",
    title: "BSc (Hons) Electrical Engineering",
    org: "University of Moratuwa",
    note: "Where the smart-home research started — HomeIO at IEEE AIIoT, later extended in Sensors.",
    phase: 0.22,
  },
];

// Earlier roles shown as a one-line footnote under the timeline.
export const alsoAt = ["promiseQ"];

export const talks = [
  {
    title: "Reliable AI in production",
    blurb: "What it takes to make LLM systems dependable: evaluation, guardrails, and designing for the day the model is wrong.",
    formats: ["Keynote", "Technical talk"],
  },
  {
    title: "Small models, big savings",
    blurb: "Lessons from “Scaling Down to Scale Up” — when self-hosted small language models beat GPT-class APIs, and when they don’t.",
    formats: ["Technical talk", "Workshop"],
  },
  {
    title: "Agents that do real work",
    blurb: "What it takes to let an AI agent take bookings and payments for a real business: guardrails, human handoff, and knowing when not to answer.",
    formats: ["Keynote", "Workshop"],
  },
  {
    title: "Types over prompts",
    blurb: "Meaning-typed programming and prompting: letting the structure of your code do the prompt engineering.",
    formats: ["Technical talk", "University session"],
  },
];

export const talkFormats = ["Keynotes", "Technical talks", "Workshops", "Panels", "University sessions", "Podcasts"];

export const doors = [
  {
    index: "01",
    title: "Invite me to speak",
    body: "Keynotes, workshops and panels on building AI that holds up in production.",
    cta: "Book a talk",
    subject: "Speaking invitation",
  },
  {
    index: "02",
    title: "Build with me",
    body: "Need an AI system built — or an existing one made dependable? Let’s scope it together.",
    cta: "Start a project",
    subject: "Project enquiry",
  },
  {
    index: "03",
    title: "Invest & partner",
    body: "Curious about what we’re building at Leaf Monkey Labs? I’d love to talk.",
    cta: "Say hello",
    subject: "Leaf Monkey Labs",
  },
];

/** Link attributes for contact CTAs: LinkedIn opens in a new tab, mailto does not. */
export const contactTarget = site.email ? {} : { target: "_blank", rel: "noreferrer" };

export function contactHref(subject?: string) {
  if (!site.email) return linkedin;
  return `mailto:${site.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
}

export const sections = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "research", label: "Research" },
  { id: "journey", label: "Journey" },
  { id: "speaking", label: "Speaking" },
  { id: "contact", label: "Contact" },
];
