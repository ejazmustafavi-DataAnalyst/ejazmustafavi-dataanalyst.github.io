# Muhammad Ejaz — Portfolio

A small, dependency-free portfolio site. The project grid is not hand-written —
`script.js` calls the GitHub API on every page load and renders whatever
repositories exist on your account, with a filter bar by tool (Power BI,
Tableau, Python, SQL, Excel). Add or rename a repo on GitHub and the site
picks it up automatically next time someone visits.

## Files

```
index.html   structure & content
style.css    all styling (design tokens at the top)
script.js    fetches your repos and renders stats, filters, and cards
```

## Publish it on GitHub Pages (username site)

A repo named exactly `<your-username>.github.io` is served automatically at
`https://<your-username>.github.io`.

1. On GitHub, create a **new repository** named exactly:
   `ejazmustafavi-DataAnalyst.github.io`
   (it must match your username exactly, lowercase doesn't matter)
2. Upload these three files (`index.html`, `style.css`, `script.js`) to the
   root of that repo — either by dragging them into the GitHub web UI
   ("Add file → Upload files") or via git:
   ```bash
   git init
   git add index.html style.css script.js
   git commit -m "Launch portfolio"
   git branch -M main
   git remote add origin https://github.com/ejazmustafavi-DataAnalyst/ejazmustafavi-DataAnalyst.github.io.git
   git push -u origin main
   ```
3. Go to the repo's **Settings → Pages**. For a `<username>.github.io` repo
   this is usually already enabled on the `main` branch — if not, set
   **Source** to `main` / `(root)` and save.
4. Wait a minute, then visit `https://ejazmustafavi-DataAnalyst.github.io`.

If you'd rather host it under a project URL instead (e.g.
`username.github.io/portfolio`), name the repo anything you like and enable
Pages the same way — the site works from any path since it has no
absolute links.

## Customizing

- **Name / bio / email / links**: edit the text directly in `index.html`
  (hero, about, and contact sections).
- **Pinned/featured badge**: edit the `PINNED_REPOS` array at the top of
  `script.js` to match whatever you pin on your GitHub profile.
- **Colors**: all five accent colors and the base palette are CSS variables
  at the top of `style.css` under `:root`.
- **How tags are detected**: `getTags()` in `script.js` looks at each repo's
  name, description, language, and topics for keywords like "power bi",
  "tableau", "excel", etc. Adding GitHub **topics** to your repos (via repo
  Settings → Topics) is the most reliable way to make sure a project lands
  in the right filter.

## Notes

- The GitHub REST API allows 60 unauthenticated requests per hour per
  visitor's IP — plenty for a portfolio. If it's ever exceeded, the site
  shows a friendly fallback message linking straight to your GitHub repos
  tab instead of erroring out.
- Forked repositories are excluded from the grid so the feed only shows
  your own work. Remove the `.filter(r => !r.fork)` line in `script.js` if
  you want forks included too.
