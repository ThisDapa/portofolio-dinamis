import Link from "next/link";
export function Footer({ profile, socials }) {
  return (
    <footer className="footer">
      <p>{profile.footerNote}</p>
      <nav aria-label="Navigasi footer">
        <Link href="/#karya">{profile.navProjects}</Link>
        <Link href="/#kontak">{profile.navContact}</Link>
        {socials.map((social) => (
          <a
            key={social.id}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {social.label}
          </a>
        ))}
      </nav>
      <small>
        © {new Date().getFullYear()} {profile.copyright}
      </small>
    </footer>
  );
}
