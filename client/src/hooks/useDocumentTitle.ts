import { useEffect } from "react";

const SITE_NAME = "PortPilot";
const DEFAULT_TITLE = "PortPilot - Auto-Generate Developer Portfolios";

/**
 * Sets the browser tab title to "<title> · PortPilot", or the site's default
 * title for "". Pass null to leave the current title alone (e.g. while loading).
 */
export function useDocumentTitle(title: string | null) {
  useEffect(() => {
    if (title === null) return;
    document.title = title ? `${title} · ${SITE_NAME}` : DEFAULT_TITLE;
  }, [title]);
}
