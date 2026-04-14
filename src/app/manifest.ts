import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ReferentialSheet — Developer Command Reference",
    short_name: "ReferentialSheet",
    description:
      "A curated, searchable library of developer cheatsheets — Bash, Git, Docker, Kubernetes, Python, SQL, Regex, and more.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
