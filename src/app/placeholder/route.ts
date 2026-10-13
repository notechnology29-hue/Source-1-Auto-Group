/** Generates a branded placeholder car image so seed data renders without external assets. */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawColor = searchParams.get("c") ?? "0066FF";
  const color = /^[0-9a-fA-F]{6}$/.test(rawColor) ? `#${rawColor}` : "#0066FF";
  const label = (searchParams.get("label") ?? "").slice(0, 30).replace(/[<>&"']/g, "");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
<defs>
<radialGradient id="bg" cx="50%" cy="85%" r="80%"><stop offset="0" stop-color="#1b2540"/><stop offset="1" stop-color="#090A0F"/></radialGradient>
<linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
</defs>
<rect width="800" height="500" fill="url(#bg)"/>
<ellipse cx="400" cy="395" rx="290" ry="18" fill="#000" opacity=".6"/>
<path d="M110 340 L130 275 Q150 240 215 232 L300 160 Q320 142 360 142 L470 142 Q510 142 535 165 L600 232 Q680 240 700 285 L710 340 Z" fill="url(#body)" stroke="#0066FF" stroke-opacity=".5" stroke-width="2"/>
<path d="M318 175 L372 160 L372 232 L260 232 Z M392 160 L470 160 Q490 160 505 175 L545 232 L392 232 Z" fill="#0b1020" opacity=".85"/>
<g fill="#0b0d14" stroke="#aab2c0" stroke-width="6"><circle cx="215" cy="345" r="50"/><circle cx="595" cy="345" r="50"/></g>
<g fill="#6b7385"><circle cx="215" cy="345" r="20"/><circle cx="595" cy="345" r="20"/></g>
<text x="24" y="474" fill="#6b7385" font-family="sans-serif" font-size="22" letter-spacing="3">${label.toUpperCase()}</text>
</svg>`;

  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
