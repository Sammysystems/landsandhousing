# Deploying

The live site is **https://sammysystems.github.io/landsandhousing/**

Source lives on `master`. The published site lives on the `gh-pages` branch.
Pages serves `gh-pages` from its root.

---

## Publish a change

```powershell
npm run lint      # type check
npm run build     # produces dist/

# publish dist/ to the gh-pages branch
$pub = "$env:LOCALAPPDATA\Temp\ghpages"
Remove-Item -Recurse -Force $pub -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $pub | Out-Null
Copy-Item -Recurse -Force .\dist\* $pub
New-Item -ItemType File -Force -Path (Join-Path $pub '.nojekyll') | Out-Null

Set-Location $pub
git init -q -b gh-pages
git config user.email "sammysystems@users.noreply.github.com"
git config user.name "Sammysystems"
git add -A
git commit -q -m "build: deploy site to gh-pages"
git remote add origin https://github.com/Sammysystems/landsandhousing.git
git push -q origin gh-pages
```

Pages picks the new commit up within a minute or two. There is no build cache to
clear and no deploy hook to wait on.

`.nojekyll` is required — without it GitHub Pages runs Jekyll, which ignores the
`dist/assets` directory and the site renders blank.

---

## Why there is no automated deploy yet

An Actions workflow is the better long-term setup, but the GitHub token on this
machine was granted without the `workflow` scope, and GitHub refuses any push
containing `.github/workflows/*` without it.

To switch to automatic deploys on every push:

1. Grant the scope (one browser step):

   ```powershell
   gh auth refresh -h github.com -s workflow
   ```

   Copy the one-time code it prints, open https://github.com/login/device,
   paste the code, approve.

2. Copy `pages.yml` from the local staging copy into `.github/workflows/pages.yml`
   and commit. The branch-based deploy above becomes unnecessary and the
   `gh-pages` branch can be deleted.

Until then, deploys are the manual four-step above.

---

## Changing where the site lives

`vite.config.ts` sets `base: './'` — relative asset paths. That is what lets one
build work both from a domain root and from a `/landsandhousing/` sub-path. If
the site is ever moved to a Vercel project or a custom domain, `base` can stay as
is.

---

## Secrets

None are needed for the frontend build. The advisor assistant calls a public
endpoint, configured by `VITE_LH_CONCIERGE_URL` with a working default already
baked in.

Everything sensitive lives on the function runtime, not in this repository:

| Where | What |
|---|---|
| `.env.local` | Local development only. Git-ignored. |
| `.insforge/project.json` | CLI credentials. Git-ignored. |
| Function secrets | Mail credentials, model key, leads inbox. Set on the function. |

`.env.example` is a template of placeholders and is safe to publish. If a real
value ever appears in a tracked file, treat it as compromised and rotate it —
the repository is public.