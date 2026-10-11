"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
export function Navbar({ profile }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const links = [
    ["karya", profile.navProjects],
    ["keahlian", profile.navSkills],
    ["kontak", profile.navContact],
  ];
  useEffect(function observeSections() {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-15% 0px -55% 0px" },
    );
    document
      .querySelectorAll("section[id]")
      .forEach((section) => observer.observe(section));
    return function stopObserving() {
      observer.disconnect();
    };
  }, []);
  return (
    <header className="site-header">
      <Link className="wordmark" href="/#main">
        {profile.name}
        <span> / {profile.role}</span>
      </Link>
      <button
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="main-nav"
        onClick={(event) => {
          event.preventDefault();
          setOpen(!open);
        }}
      >
        {open ? "Tutup" : "Menu"}
      </button>
      <nav
        id="main-nav"
        aria-label="Navigasi utama"
        className={open ? "nav open" : "nav"}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            document.querySelector(".menu-toggle")?.focus();
          }
        }}
      >
        {links.map(([id, label]) => (
          <a
            key={id}
            href={`/#${id}`}
            aria-current={active === id ? "location" : undefined}
            onClick={() => {
              setOpen(false);
            }}
          >
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}
