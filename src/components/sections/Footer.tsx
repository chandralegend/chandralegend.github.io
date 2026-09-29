import { getPosts } from "@/lib/blog";
import { site } from "@/lib/content";
import TerminalButton from "@/components/ui/TerminalButton";

export default function Footer() {
  const blog = getPosts().length > 0;
  return (
    <footer className="footer" data-moon="moonset">
      <div className="container footer__top">
        <p className="footer__note">
          Designed and built in {site.location.city}. The moon is generated in real time with WebGL — no photos, just
          noise, craters and a little light.
        </p>
        <div className="footer__actions">
          <TerminalButton className="footer__terminal">
            Press <kbd>~</kbd> for a terminal
          </TerminalButton>
          {blog && (
            // eslint-disable-next-line @next/next/no-html-link-for-pages -- full load, so homepage scroll pins never leak into the blog
            <a href="/blog/" className="footer__back">
              Writing <span aria-hidden="true">↗</span>
            </a>
          )}
          <a href="#top" className="footer__back" data-cursor="Up">
            Back to orbit <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>

      <p className="footer__wordmark" aria-hidden="true">
        <span data-speed="0.12">{site.lastName}</span>
      </p>

      <div className="footer__base">
        <div className="container footer__bottom">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <span>Next.js · Three.js · GSAP</span>
          <span>{site.location.coords}</span>
        </div>
      </div>
    </footer>
  );
}
