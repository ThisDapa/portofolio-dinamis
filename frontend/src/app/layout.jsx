import "@fontsource-variable/fraunces";
import "@fontsource/source-sans-3/400.css";
import "@fontsource/source-sans-3/600.css";
import "./globals.css";
import { siteUrl } from "@/lib/api";
export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Portfolio", template: "%s | Portfolio" },
  description:
    "Selected projects, skills, dan pendekatan saya dalam membangun aplikasi web.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <a className="skip-link" href="#main">
          Lewati navigasi
        </a>
        {children}
      </body>
    </html>
  );
}
