"use client";

import { useLayoutEffect } from "react";

const ATTRS = ["alt", "title", "aria-label", "placeholder"];
const norm = (s: string) => s.replace(/\s+/g, " ").trim();

/**
 * Serbian previews of a site written in English: after hydration every text node and label
 * whose (trimmed) text is in `dict` is swapped for its translation, and a MutationObserver keeps
 * doing it as the page changes (tabs, sliders, typed text). The page stays hidden until the
 * first pass (translateGateCss), so nobody sees English flash by. Text carrying the business's own
 * name or numbers isn't in the dictionary and stays as it is.
 */
export function Translate({ dict }: { dict: Record<string, string> }) {
  // Layout effect: runs before the page's own animation code (useGSAP) splits any text
  useLayoutEffect(() => {
    const tr = (s: string | null) => {
      if (!s) return null;
      const v = dict[norm(s)];
      if (v == null) return null;
      return (s.match(/^\s*/)?.[0] ?? "") + v + (s.match(/\s*$/)?.[0] ?? "");
    };
    const text = (n: Node) => {
      const p = n.parentElement;
      if (!p || p.closest("script,style,[data-no-translate]")) return;
      const v = tr(n.nodeValue);
      if (v != null && v !== n.nodeValue) n.nodeValue = v;
    };
    const attrs = (el: Element) => {
      for (const a of ATTRS) {
        const cur = el.getAttribute(a);
        const v = tr(cur);
        if (v != null && v !== cur) el.setAttribute(a, v);
      }
    };
    const walk = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) return text(root);
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      attrs(root as Element);
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      while (w.nextNode()) {
        const n = w.currentNode;
        if (n.nodeType === Node.TEXT_NODE) text(n);
        else attrs(n as Element);
      }
    };
    walk(document.body);
    document.documentElement.classList.add("tr-ready");
    const mo = new MutationObserver((list) => {
      for (const m of list) {
        if (m.type === "characterData") text(m.target);
        else if (m.type === "attributes") attrs(m.target as Element);
        else m.addedNodes.forEach(walk);
      }
    });
    mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    return () => mo.disconnect();
  }, [dict]);
  return null;
}

/** Hide the page until the first translation pass; show it anyway after 2.5 s if JS fails. */
export const translateGateCss = "html:not(.tr-ready) body{opacity:0;animation:tr-reveal 0s 2.5s forwards}@keyframes tr-reveal{to{opacity:1}}";

/**
 * Dev helper: every visible English fragment on the page that the dictionary doesn't cover yet.
 * Run `copy(window.__untranslated())` in the console on a Serbian preview.
 */
if (typeof window !== "undefined") {
  (window as unknown as { __untranslated: () => string[] }).__untranslated = () => {
    const out = new Set<string>();
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    while (w.nextNode()) {
      const n = w.currentNode;
      if (n.nodeType === Node.TEXT_NODE) {
        if (n.parentElement?.closest("script,style,[data-no-translate]")) continue;
        const t = norm(n.nodeValue ?? "");
        if (/[A-Za-z]{2,}/.test(t)) out.add(t);
      } else {
        for (const a of ATTRS) {
          const t = norm((n as Element).getAttribute(a) ?? "");
          if (/[A-Za-z]{2,}/.test(t)) out.add(t);
        }
      }
    }
    return [...out];
  };
}
