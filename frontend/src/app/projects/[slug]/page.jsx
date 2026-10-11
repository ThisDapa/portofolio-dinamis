import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiError, imageSource } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
async function getProject(slug) {
  try {
    return await api(`/projects/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}
export async function generateMetadata({ params }) {
  const project = await getProject((await params).slug);
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      type: "article",
    },
  };
}
export default async function ProjectPage({ params }) {
  const [project, { profile, socials }] = await Promise.all([
    getProject((await params).slug),
    api("/portfolio"),
  ]);
  return (
    <>
      <Navbar profile={profile} />
      <main id="main" className="detail">
        <Link href="/#karya" className="text-link">
          Back to Projects
        </Link>
        <p className="eyebrow">
          {project.featured ? "Featured Project" : "Case Study"}
          {profile.exampleMode ? " / Concept Project" : ""}
        </p>
        <h1>{project.title}</h1>
        <p className="intro">{project.description}</p>
        <ul className="stack">
          {project.techStack.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
        <Image
          className="detail-image"
          src={imageSource(project.imageUrl)}
          alt={project.imageAlt}
          width={1200}
          height={760}
          priority
          sizes="(max-width: 1000px) 100vw, 1100px"
        />
        <div className="project-body">
          {project.content.split("\n\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <div className="actions">
          {project.demoUrl && (
            <a
              className="button"
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Live Demo
            </a>
          )}
          {project.repoUrl && (
            <a
              className="text-link"
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Source Code
            </a>
          )}
        </div>
      </main>
      <Footer profile={profile} socials={socials} />
    </>
  );
}
