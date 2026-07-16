const fs = require("fs");
const base = "C:/Users/Administrator/Documents/Codex/2026-07-16/new-chat/packages/web/src/components/SearchOverlay.tsx";

let text = fs.readFileSync(base, "utf-8");

// Add data-search-overlay attribute to the panel div
text = text.replace(
  "<div className={'fixed top-16 left-0 right-0 z-50",
  "<div data-search-overlay className={'fixed top-16 left-0 right-0 z-50"
);

fs.writeFileSync(base, text, "utf-8");
console.log("SearchOverlay updated");