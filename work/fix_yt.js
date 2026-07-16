const fs = require("fs");
const base = "C:/Users/Administrator/Documents/Codex/2026-07-16/new-chat/packages/server/src/services";

let yt = fs.readFileSync(base + "/youtube.ts", "utf-8");

// In the map function, add qualities: [] to each video item
yt = yt.replace(
  "source: 'youtube' as const,",
  "source: 'youtube' as const,\n    qualities: [],"
);

fs.writeFileSync(base + "/youtube.ts", yt, "utf-8");
console.log("YouTube updated");