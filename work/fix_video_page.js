const fs = require("fs");
const base = "C:/Users/Administrator/Documents/Codex/2026-07-16/new-chat/packages/web/src";

const videoPagePath = base + "/app/video/[id]/page.tsx";
let text = fs.readFileSync(videoPagePath, "utf-8");

// Replace VideoPlayer usage to include qualities
text = text.replace(
  '<VideoPlayer src={video.url} poster={video.thumbnail} />',
  '<VideoPlayer src={video.url} poster={video.thumbnail} qualities={video.qualities} />'
);

fs.writeFileSync(videoPagePath, text, "utf-8");
console.log("Video page updated with qualities prop");