import { loaderKey, prepLogo } from "@/lib/lead-logo";

/**
 * A personalised preview's page loader: the lead's own logo on the site's ink, drawn the way the
 * Halden mark draws (each stroke traces its outline, then fills), the name sliding out of a mask
 * and a copper chalk line, then the cover lifts off through a gable-shaped opening — the hero's own
 * house window — onto the homepage. ~2.2 s, CSS only, so it runs from the first paint whatever the
 * JS is doing (globals.css, "lead loader").
 *
 * The inline script runs before the first paint: once per token per tab (a reload skips it), it
 * sets `<html data-loading>` so the hero's entrance waits (lib/loader: whenLoaderDone) until the
 * cover starts to lift, and hides it when it has gone (never later than 3 s), even if the page's JS
 * is slow. A click, tap, key or wheel skips it. Reduced motion: the finished logo for 0.6 s, then a fade.
 */
export function LeadLoader({ svg, token }: { svg: string; token: string }) {
  // Ends on the cover's own CSS animation events (its exit starting / ending), with a frame-clock cap
  // at 3 s: not setTimeout, whose low first ids other code's clearTimeout(idleCallbackId) can hit.
  const script = `(function(){var d=document.documentElement,el=document.currentScript&&document.currentScript.previousElementSibling,k=${JSON.stringify(loaderKey(token))};try{if(sessionStorage.getItem(k)){d.setAttribute("data-loader","skip");return}sessionStorage.setItem(k,"1")}catch(e){}
if(!el)return;d.setAttribute("data-loading","");d.setAttribute("data-loader","on");
var ended=0,gone=0,t0=performance.now(),ev=["pointerdown","keydown","wheel","touchstart"];
function done(){if(ended)return;ended=1;d.removeAttribute("data-loading");dispatchEvent(new Event("loader:done"))}
function off(){if(gone)return;gone=1;done();d.setAttribute("data-loader","done");ev.forEach(function(e){removeEventListener(e,skip,true)})}
function skip(){if(ended)return;d.setAttribute("data-loader","leaving");done()}
el.addEventListener("animationstart",function(e){if(e.target===el)done()});
el.addEventListener("animationend",function(e){if(e.target===el)off()});
(function cap(){if(gone)return;if(performance.now()-t0>3000)return off();requestAnimationFrame(cap)})();
ev.forEach(function(e){addEventListener(e,skip,{capture:true,passive:true})})})()`;
  return (
    <>
      <div className="lead-loader" aria-hidden data-no-translate suppressHydrationWarning>
        <div className="lead-loader-inner">
          <div className="lead-logo" dangerouslySetInnerHTML={{ __html: prepLogo(svg) }} />
          <span aria-hidden className="lead-loader-line" />
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: script }} />
    </>
  );
}
