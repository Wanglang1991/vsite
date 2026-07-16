const fs = require("fs");
const base = "C:/Users/Administrator/Documents/Codex/2026-07-16/new-chat/packages/web/src/components/CategoryBar.tsx";

let text = fs.readFileSync(base, "utf-8");

// Fix all literal \uXXXX in category names
text = text.replace("'\\u52a8\\u753b'", "'\u52a8\u753b'");
text = text.replace("'\\u97f3\\u4e50'", "'\u97f3\u4e50'");
text = text.replace("'\\u6e38\\u620f'", "'\u6e38\u620f'");
text = text.replace("'\\u8fd0\\u52a8'", "'\u8fd0\u52a8'");
text = text.replace("'\\u79d1\\u6280'", "'\u79d1\u6280'");
text = text.replace("'\\u81ea\\u7136'", "'\u81ea\u7136'");
text = text.replace("'\\u65c5\\u884c'", "'\u65c5\u884c'");
text = text.replace("'\\u7f8e\\u98df'", "'\u7f8e\u98df'");
text = text.replace("'\\u5f71\\u89c6'", "'\u5f71\u89c6'");
text = text.replace("'\\u65f6\\u5c1a'", "'\u65f6\u5c1a'");

fs.writeFileSync(base, text, "utf-8");
console.log("CategoryBar fixed");