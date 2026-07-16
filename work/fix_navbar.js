const fs = require("fs");
const base = "C:/Users/Administrator/Documents/Codex/2026-07-16/new-chat/packages/web/src/components/Navbar.tsx";

let text = fs.readFileSync(base, "utf-8");

// Replace useSearchParams import
text = text.replace(
  "import { useSearchParams } from 'next/navigation';",
  "import { usePathname } from 'next/navigation';"
);

// Replace the useSearchParams usage with a simpler approach
text = text.replace(
  `const searchParams = useSearchParams();
  const cat = searchParams.get('cat');
  const logoSrc = cat ? '/?cat=' + cat : '/';`,
  `const pathname = usePathname();
  const logoSrc = typeof window !== 'undefined' && pathname === '/' ? (() => {
    const p = new URLSearchParams(window.location.search);
    const c = p.get('cat');
    return c ? '/?cat=' + c : '/';
  })() : '/';`
);

fs.writeFileSync(base, text, "utf-8");
console.log("Navbar fixed");