// Builds docs/index.html (served by GitHub Pages) from the playbook source.
// Wraps the artifact in a full HTML document and adds a light access-code gate.
// Usage: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

// Not a secret: anyone reading the page source can see it. It only keeps casual visitors out.
const ACCESS_CODE = "musebadges";

const source = readFileSync(new URL("./client-experience-playbook.html", import.meta.url), "utf8");

const gateHead = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<script>
  try { if (localStorage.getItem("cxp:gate") !== "ok") document.documentElement.classList.add("locked"); }
  catch (e) { document.documentElement.classList.add("locked"); }
</script>
<style>
  html.locked body > :not(#gate) { display: none !important; }
  #gate { display: none; }
  html.locked #gate { display: grid; place-items: center; min-height: 100vh; padding: 16px; background: var(--bg); color: var(--ink); font-family: "Atkinson Hyperlegible", "Onest", system-ui, sans-serif; }
  #gate form { width: min(100%, 360px); background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 28px 24px; display: grid; gap: 14px; }
  #gate h1 { margin: 0; font-family: "Bricolage Grotesque", system-ui, sans-serif; font-size: 1.5rem; }
  #gate p { margin: 0; color: var(--muted); }
  #gate input { font: inherit; font-size: 1rem; padding: 12px 14px; border-radius: 10px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); }
  #gate button { font: inherit; font-weight: 700; padding: 12px 14px; border-radius: 10px; border: 0; background: var(--accent); color: var(--accent-ink); cursor: pointer; }
  #gate .err { color: var(--bad); min-height: 1.3em; }
</style>`;

const gateBody = `<div id="gate">
  <form id="gateForm">
    <h1>Client Experience Playbook</h1>
    <p>Enter the team access code.<br><span lang="uk">Введіть код доступу команди.</span></p>
    <input id="gateCode" type="password" autocomplete="off" aria-label="Access code / Код доступу" required>
    <button type="submit">Open · Відкрити</button>
    <p class="err" id="gateErr" role="alert"></p>
  </form>
</div>
<script>
  document.getElementById("gateForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = document.getElementById("gateCode").value.trim().toLowerCase();
    if (code === ${JSON.stringify(ACCESS_CODE)}) {
      try { localStorage.setItem("cxp:gate", "ok"); } catch (err) {}
      document.documentElement.classList.remove("locked");
    } else {
      document.getElementById("gateErr").textContent = "That code didn't work. · Код не підходить.";
    }
  });
</script>`;

const page = `<!doctype html>
<html lang="en">
<head>
${gateHead}
${source}
${gateBody}
</html>
`;

mkdirSync(new URL("./docs/", import.meta.url), { recursive: true });
writeFileSync(new URL("./docs/index.html", import.meta.url), page);
writeFileSync(new URL("./docs/.nojekyll", import.meta.url), "");
console.log("Built docs/index.html");
