import data from './projects.json';

export interface Project {
  slug: string;
  name: string;
  category: string;
  card: string; // branded card image path (public-relative)
  url?: string;
}

// Source of truth is projects.json — edited by hand or via the /admin CMS (Sveltia).
export const projects: Project[] = data.projects as Project[];
