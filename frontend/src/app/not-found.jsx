import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="state-page">
      <p>404</p>
      <h1>Halaman ini tidak ditemukan.</h1>
      <Link className="text-link" href="/">
        Back to Home
      </Link>
    </main>
  );
}
