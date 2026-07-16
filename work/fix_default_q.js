const fs = require("fs");
const base = "C:/Users/Administrator/Documents/Codex/2026-07-16/new-chat/packages/web/src/components/VideoPlayer.tsx";

let text = fs.readFileSync(base, "utf-8");

// Change: sort qualities by height ascending (lowest first = 720p default)
text = text.replace(
  "const sources = qualities && qualities.length > 0",
  "const sortedQualities = qualities ? [...qualities].sort((a, b) => a.height - b.height) : null;\n  const sources = sortedQualities && sortedQualities.length > 0"
);

// Replace qualities.map with sortedQualities.map in sources
text = text.replace(
  "? qualities.map(q => ({ src: q.src, type: 'video/mp4', label: q.label }))",
  "? sortedQualities.map(q => ({ src: q.src, type: 'video/mp4', label: q.label }))"
);

// Update the quality menu to use sortedQualities
text = text.replace(
  "{qualities && qualities.length > 1 && (",
  "{sortedQualities && sortedQualities.length > 1 && ("
);
text = text.replace(
  "{qualities.map(q => (",
  "{sortedQualities.map(q => ("
);

fs.writeFileSync(base, text, "utf-8");
console.log("Default quality set to 720p");