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
    "I build reliable AI systems, invent new tools, and make existing ones better. Associate Technical Lead (AI) at Gapstars, founder of Leaf Monkey Labs, creator of Nomos.",
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
  { title: "Creator", org: "Nomos", href: "https://github.com/dowhiledev/nomos" },
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
    title: "Open source",
    body: "Tools other builders use: agents you can audit, typed prompting without JSON-schema boilerplate, and a friendlier Unix shell.",
  },
  {
    index: "iii",
    title: "Building",
    body: "Technical leadership on agentic AI at Gapstars, and new AI-native products at Leaf Monkey Labs — from first sketch to production.",
  },
];

export const marquee = [
  "Reliable AI",
  "Agents you can audit",
  "Small models in production",
  "AI × programming languages",
  "Open source",
  "Thinking outside the box",
];

export type Glyph = "orbits" | "types" | "shell" | "wave" | "lens" | "hub";

export type Project = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  repo: string;
  href: string;
  site?: string;
  tags: string[];
  stars: number; // fallback — refreshed from GitHub at build time
  glyph: Glyph;
  status?: string;
};

export const projects: Project[] = [
  {
    id: "nomos",
    name: "Nomos",
    tagline: "Ship agents you can audit.",
    description:
      "A framework for building AI agents whose behaviour you can inspect and trust — so teams can put agents in production without crossing their fingers.",
    repo: "dowhiledev/nomos",
    href: "https://github.com/dowhiledev/nomos",
    tags: ["Python", "AI agents", "Framework"],
    stars: 88,
    glyph: "orbits",
  },
  {
    id: "semantix",
    name: "Semantix",
    tagline: "Structured outputs, without the schema.",
    description:
      "The framework behind my Meaning Typed Prompting paper: reliable structured output from LLMs using the types and meanings already in your code — no Pydantic, no JSON Schema.",
    repo: "dowhiledev/semantix",
    href: "https://github.com/dowhiledev/semantix",
    tags: ["Python", "LLMs", "Prompting"],
    stars: 27,
    glyph: "types",
    status: "Archived",
  },
  {
    id: "nutshell",
    name: "Nutshell",
    tagline: "A friendlier Unix shell.",
    description:
      "An enhanced shell with a simplified command language, package management and AI-powered assistance built in — the terminal, minus the folklore.",
    repo: "dowhiledev/nutshell",
    href: "https://github.com/dowhiledev/nutshell",
    tags: ["C", "Shell", "Developer tools"],
    stars: 24,
    glyph: "shell",
  },
  {
    id: "vibelang",
    name: "VibeLang",
    tagline: "Prompts as a language feature.",
    description:
      "A programming language with native prompt blocks, so generative-AI features slot into any codebase as naturally as a function call.",
    repo: "dowhiledev/vibelang",
    href: "https://github.com/dowhiledev/vibelang",
    tags: ["C", "Language design", "LLMs"],
    stars: 0,
    glyph: "wave",
  },
  {
    id: "saf-eval",
    name: "SAF-Eval",
    tagline: "Is that answer actually true?",
    description:
      "Search-Augmented Factuality Evaluator — a modular Python package for checking the factuality of AI-generated responses against the open web.",
    repo: "dowhiledev/saf-eval",
    href: "https://github.com/dowhiledev/saf-eval",
    tags: ["Python", "Evaluation", "Factuality"],
    stars: 1,
    glyph: "lens",
  },
  {
    id: "uai",
    name: "UAI",
    tagline: "One interface, any agent framework.",
    description:
      "Unified Agent Interface — run different agent frameworks behind a single, consistent API, so switching stacks doesn’t mean rewriting your product.",
    repo: "dowhiledev/uai",
    href: "https://github.com/dowhiledev/uai",
    tags: ["Python", "AI agents", "Interop"],
    stars: 0,
    glyph: "hub",
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
    note: "Building Salli, personal finance for Sri Lanka, alongside applied AI research that’s published where it holds up.",
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
    period: "Ongoing",
    title: "Creator & maintainer",
    org: "Open source",
    href: "https://github.com/dowhiledev",
    note: "Nomos, Semantix, Nutshell, VibeLang, SAF-Eval and UAI — tools for building AI that behaves.",
    phase: 0.7,
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
    title: "Agents you can audit",
    blurb: "Building AI agents whose every decision can be inspected, tested and trusted — the thinking behind Nomos.",
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
