/**
 * The lead's own logo (CRM, already sanitised): `<svg viewBox>` with `<g data-part="mark">` (stroked
 * shapes) and `<g data-part="word">` (the name). Used by the page loader, the header and the footer.
 */

const SHAPES = /<(path|circle|rect|line|polyline|polygon|ellipse)\b/g;

/**
 * Ready for the loader's draw: every mark shape gets `pathLength="1"` (so stroke-dash 1 = its whole
 * outline) and its own start delay (`--d`, staggered across at most ~0.4 s however many shapes),
 * and the root gets `aria-hidden`. Done on the server, so the markup React hydrates is the same.
 */
export function prepLogo(svg: string) {
  let out = svg.replace(/<svg\b/, '<svg aria-hidden="true" focusable="false"');
  const m = /(<g\b[^>]*data-part=["']mark["'][^>]*>)([\s\S]*?)(<\/g>)/.exec(out);
  if (m) {
    const n = (m[2].match(SHAPES) ?? []).length;
    const step = n > 1 ? Math.min(0.11, 0.4 / (n - 1)) : 0;
    let i = 0;
    const body = m[2].replace(SHAPES, (_t, tag: string) => `<${tag} pathLength="1" data-draw style="--d:${(i++ * step).toFixed(3)}s"`);
    out = out.slice(0, m.index) + m[1] + body + m[3] + out.slice(m.index + m[0].length);
  }
  return out;
}

/** The loader is shown once per preview token per tab (sessionStorage). */
export const loaderKey = (token: string) => `lead-loader:${token}`;
