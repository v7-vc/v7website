import data from './projects.json';

export interface Project {
  slug: string;
  name: string;
  category: string;
  card: string; // branded card image path (public-relative)
  url?: string; // external company site
  tagline?: string;
  industry?: string;
  about?: string;
  logo?: string; // brand logo image used on the detail page
}

// Source of truth is projects.json — edited by hand or via the /admin CMS (Sveltia).
export const projects: Project[] = data.projects as Project[];
