import Image from "next/image";
import Link from "next/link";
import { api, imageSource } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const { profile } = await api("/portfolio");
  return {
    title: profile.name,
    description: profile.intro,
    openGraph: {
      title: `${profile.name} · ${profile.role}`,
      description: profile.intro,
      type: "website",
      locale: "id_ID",
    },
  };
}
export default async function Home() {
  const { profile, projects, skills, testimonials, socials } =
    await api("/portfolio");
  const categories = [...new Set(skills.map((skill) => skill.category))];
  return (
    <>
      <Navbar profile={profile} />
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">{profile.location}</p>
            <h1 id="hero-title">
              {profile.name}
              <span>{profile.role}.</span>
            </h1>
            <p className="intro">{profile.intro}</p>
            <div className="actions">
              <a className="button" href="#karya">
                {profile.projectCta}
              </a>
              <a className="text-link" href="#kontak">
                {profile.contactCta}
              </a>
            </div>
          </div>
          <aside className="hero-aside">
            {profile.avatarUrl && (
              <Image
                src={imageSource(profile.avatarUrl)}
                alt={profile.avatarAlt}
                width={480}
                height={560}
                priority
                className="portrait"
              />
            )}
            <p className="availability">{profile.availability}</p>
            {profile.cvUrl ? (
              <a
                className="text-link"
                href={profile.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {profile.cvLabel}
              </a>
            ) : (
              <span className="muted">Resume belum tersedia</span>
            )}
          </aside>
        </section>
        {profile.exampleMode && (
          <div className="example-note">
            Portfolio preview / Deskripsi profil, proyek, dan keahlian di
            halaman ini masih menggunakan konten contoh.
          </div>
        )}
        <section id="karya" className="section">
          <div className="section-heading">
            <span className="index">01 / {profile.navProjects}</span>
            <h2>{profile.projectHeading}</h2>
          </div>
          <div className="project-list">
            {projects.length ? (
              projects.map((project, index) => (
                <article
                  className={`project ${project.featured ? "featured" : ""}`}
                  key={project.id}
                >
                  <Link
                    className="project-image"
                    href={`/projects/${project.slug}`}
                  >
                    <Image
                      src={imageSource(project.imageUrl)}
                      alt={project.imageAlt}
                      width={1200}
                      height={760}
                      sizes="(max-width: 760px) 100vw, 65vw"
                    />
                  </Link>
                  <div className="project-copy">
                    <p className="eyebrow">
                      {String(index + 1).padStart(2, "0")}
                      {project.featured ? " / Featured Project" : ""}
                    </p>
                    <h3>
                      <Link href={`/projects/${project.slug}`}>
                        {project.title}
                      </Link>
                    </h3>
                    <p>{project.description}</p>
                    <ul className="stack" aria-label="Teknologi">
                      {project.techStack.map((tech) => (
                        <li key={tech}>{tech}</li>
                      ))}
                    </ul>
                    <Link
                      className="text-link"
                      href={`/projects/${project.slug}`}
                    >
                      View Case Study
                    </Link>
                    <div className="project-links">
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Demo
                        </a>
                      )}
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Source Code
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p>Project akan ditampilkan di sini setelah siap dibagikan.</p>
            )}
          </div>
        </section>
        <section id="keahlian" className="section skills-section">
          <div className="section-heading">
            <span className="index">02 / {profile.navSkills}</span>
            <h2>{profile.skillHeading}</h2>
          </div>
          <div className="skill-groups">
            {categories.length ? (
              categories.map((category) => (
                <div className="skill-group" key={category}>
                  <h3>{category}</h3>
                  <div>
                    {skills
                      .filter((skill) => skill.category === category)
                      .map((skill) => (
                        <article key={skill.id}>
                          <h4>{skill.name}</h4>
                          <p>{skill.context}</p>
                        </article>
                      ))}
                  </div>
                </div>
              ))
            ) : (
              <p>Daftar skills sedang disiapkan.</p>
            )}
          </div>
        </section>
        <section
          className="section testimonial-section"
          aria-labelledby="testimonials-title"
        >
          <span className="index">Testimonials</span>
          <h2 id="testimonials-title">{profile.testimonialHeading}</h2>
          {testimonials.length ? (
            <div className="quotes">
              {testimonials.map((item) => (
                <figure key={item.id}>
                  <blockquote>{item.quote}</blockquote>
                  <figcaption>
                    {item.photoUrl && (
                      <Image
                        src={imageSource(item.photoUrl)}
                        alt={`Foto ${item.name}`}
                        width={48}
                        height={48}
                      />
                    )}
                    <div>
                      {item.name}
                      <span>{item.relation}</span>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p className="muted">Belum ada testimoni yang dipublikasikan.</p>
          )}
        </section>
        <section id="kontak" className="section contact-section">
          <div>
            <span className="index">03 / {profile.navContact}</span>
            <h2>{profile.contactHeading}</h2>
            <p>{profile.contactIntro}</p>
            <div className="social-links">
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
            </div>
          </div>
          <ContactForm label="Send Message" />
        </section>
      </main>
      <Footer profile={profile} socials={socials} />
    </>
  );
}
