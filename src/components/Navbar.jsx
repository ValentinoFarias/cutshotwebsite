/**
 * Navbar — the sticky top bar: skip link, wordmark, two section anchors and
 * the survey page.
 *
 * Server component. No state, no JavaScript. The hairline that appears under
 * the bar once the page has scrolled is a CSS scroll-driven animation living
 * in the NAVBAR banner of style.css; browsers without `animation-timeline`
 * simply show the hairline all the time.
 *
 * The identity on the left is the WORDMARK plus a clay dot — deliberately not
 * the logo drawing, which does not exist yet and must not be invented.
 *
 * The section anchors start with "/" so they also work from /survey: from
 * there they go back to the home page and jump to the section, and on the home
 * page itself the browser just scrolls.
 */

const navLinks = [
  { href: "/#what-it-does", label: "What it does" },
  { href: "/#download", label: "Download" },
  { href: "/survey", label: "Survey" },
];

/**
 * @param {{ currentPath?: string }} props
 *   The path of the page being shown, so its link can be marked as current.
 */
export default function Navbar({ currentPath = "/" }) {
  return (
    <header className="home__navbar">
      <a className="home__visually-hidden home__skip-link" href="#main-content">
        Skip to content
      </a>

      <nav className="home__container home__navbar-inner" aria-label="Primary">
        <a className="home__wordmark" href="/">
          CutShot
          <span className="home__wordmark-dot" aria-hidden="true" />
        </a>

        <ul className="home__nav-list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                className="home__nav-link"
                href={link.href}
                // Screen readers announce "current page"; the CSS underlines it.
                aria-current={link.href === currentPath ? "page" : undefined}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
