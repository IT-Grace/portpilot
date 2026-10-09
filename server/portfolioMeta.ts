import { planLimits } from "@shared/schema";
import type { Request } from "express";
import { storage } from "./storage";

// Link-preview bots (Slack, LinkedIn, X, iMessage...) don't run JavaScript, so
// public portfolio pages get their title and Open Graph tags filled in on the
// server before index.html is sent.

const PORTFOLIO_PATH = /^\/u\/([^/?#]+)/;
const MAX_DESCRIPTION_CHARS = 200;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}

/**
 * Returns `html` with portfolio-specific <title>, description and Open Graph
 * tags when the request is for a public portfolio page; otherwise (or on any
 * error) returns `html` unchanged. Does not count as a portfolio view.
 */
export async function injectPortfolioMeta(
  html: string,
  req: Request
): Promise<string> {
  const match = req.originalUrl.match(PORTFOLIO_PATH);
  if (!match) return html;

  try {
    const handle = decodeURIComponent(match[1]);
    const user = await storage.getUserByHandle(handle);
    if (!user || !user.isActive) return html;

    const portfolio = await storage.getPortfolio(user.id);
    if (!portfolio || !portfolio.isPublic) return html;

    const projects = (await storage.getProjects(portfolio.id))
      .filter((p) => p.selected)
      .slice(0, planLimits[user.plan].maxProjects);

    const name = user.name || `@${user.handle}`;
    const title = `${name} · PortPilot`;
    const projectList = projects
      .slice(0, 3)
      .map((p) => p.name)
      .join(", ");
    const description = truncate(
      user.bio ||
        (projects.length > 0
          ? `Developer portfolio featuring ${projects.length} project${
              projects.length === 1 ? "" : "s"
            }, including ${projectList}.`
          : `${name}'s developer portfolio.`),
      MAX_DESCRIPTION_CHARS
    );

    const protocol =
      req.get("x-forwarded-proto")?.split(",")[0].trim() || req.protocol;
    const url = `${protocol}://${req.get("host")}${req.originalUrl}`;

    const tags = [
      ["og:type", "profile"],
      ["og:site_name", "PortPilot"],
      ["og:title", title],
      ["og:description", description],
      ["og:url", url],
      ...(user.avatarUrl ? [["og:image", user.avatarUrl]] : []),
      ["profile:username", user.handle ?? ""],
    ]
      .map(
        ([property, content]) =>
          `<meta property="${property}" content="${escapeHtml(content)}" />`
      )
      .concat(
        [
          ["twitter:card", "summary"],
          ["twitter:title", title],
          ["twitter:description", description],
          ...(user.avatarUrl ? [["twitter:image", user.avatarUrl]] : []),
        ].map(
          ([name, content]) =>
            `<meta name="${name}" content="${escapeHtml(content)}" />`
        )
      )
      .join("\n    ");

    return html
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace(
        /<meta name="description"[^>]*>/,
        `<meta name="description" content="${escapeHtml(description)}" />`
      )
      .replace("</head>", `    ${tags}\n  </head>`);
  } catch (error) {
    console.error("Failed to add portfolio meta tags:", error);
    return html;
  }
}
