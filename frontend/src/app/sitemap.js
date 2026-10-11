import { api, siteUrl } from "@/lib/api";
export const dynamic = "force-dynamic";
export default async function sitemap() {
  const { projects } = await api("/portfolio");
  return [
    { url: siteUrl },
    ...projects.map((project) => ({
      url: `${siteUrl}/projects/${project.slug}`,
      lastModified: new Date(project.updatedAt),
    })),
  ];
}
