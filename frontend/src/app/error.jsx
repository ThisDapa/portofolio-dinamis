"use client";
export default function ErrorPage({ reset }) {
  return (
    <main id="main" className="state-page">
      <h1>Halaman belum bisa dimuat.</h1>
      <p>Ada kendala saat memuat halaman. Silakan coba beberapa saat lagi.</p>
      <button
        className="button"
        onClick={() => {
          reset();
        }}
      >
        Try Again
      </button>
    </main>
  );
}
