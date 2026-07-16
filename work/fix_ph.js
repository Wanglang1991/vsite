const fs = require("fs");
const base = "C:/Users/Administrator/Documents/Codex/2026-07-16/new-chat/packages/web/src/components/Navbar.tsx";

let text = fs.readFileSync(base, "utf-8");
text = text.replace(
  'placeholder="\\u641c\\u7d22\\u89c6\\u9891..."',
  'placeholder="搜索视频..."'
);
fs.writeFileSync(base, text, "utf-8");
console.log("Placeholder fixed again");