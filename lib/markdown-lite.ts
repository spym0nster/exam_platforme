export function renderMarkdownLite(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = escaped.split("\n");
  const html: string[] = [];
  let inList = false;

  for (const line of lines) {
    const isListItem = /^-\s+/.test(line);
    if (isListItem && !inList) {
      html.push("<ul>");
      inList = true;
    }
    if (!isListItem && inList) {
      html.push("</ul>");
      inList = false;
    }
    const inline = line
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
    if (isListItem) {
      html.push(`<li>${inline.replace(/^-\s+/, "")}</li>`);
    } else if (line.trim() === "") {
      html.push("<br>");
    } else {
      html.push(`<div>${inline}</div>`);
    }
  }
  if (inList) html.push("</ul>");
  return html.join("");
}
