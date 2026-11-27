// Runs in <head> before the first paint (see app/layout.tsx), so the page
// never flashes the wrong theme. Kept as a plain string so the server-only
// layout can import it. The key must match THEME_KEY in lib/theme.ts.
export const THEME_KEY = "bk.theme.v1";

export const THEME_SCRIPT = `(function(){try{var p=localStorage.getItem("${THEME_KEY}");var d=p==="dark"||(p!=="light"&&window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})()`;
