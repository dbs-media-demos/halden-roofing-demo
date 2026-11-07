import { projects, type Project } from "@/content/projects";
import { photos, slimPhoto } from "@/lib/photos";
import { ProjectsRailClient, type FeaturedProject, type RailProject } from "./ProjectsRailClient";

const row = (p: Project): RailProject => ({ slug: p.slug, title: p.title, city: p.city, neighborhood: p.neighborhood, material: p.material, photo: slimPhoto(photos[p.hero]) });

const f = projects[0];
const featured: FeaturedProject = { ...row(f), year: f.year, summary: f.summary, stats: f.stats, before: slimPhoto(photos[f.before]), after: slimPhoto(photos[f.after]) };

export function ProjectsRail() {
  return <ProjectsRailClient projects={projects.map(row)} featured={featured} />;
}
