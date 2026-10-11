"use client";
import { useState } from "react";
import { api } from "@/lib/api";
export function ContactForm({ label }) {
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setStatus("");
    try {
      const result = await api("/contact", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(data)),
      });
      setStatus(result.message);
      form.reset();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Pesan belum terkirim. Coba lagi.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-pair">
        <label>
          Nama Anda
          <input name="name" required maxLength={100} autoComplete="name" />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
          />
        </label>
      </div>
      <label>
        Project brief
        <textarea
          name="message"
          required
          minLength={20}
          maxLength={5000}
          rows={5}
        />
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="form-bottom">
        <p>Gunakan email yang bisa dihubungi untuk membalas pesan Anda.</p>
        <button className="button" disabled={pending}>
          {pending ? "Mengirim…" : label}
        </button>
      </div>
      <p role="status" className="status">
        {status}
      </p>
    </form>
  );
}
