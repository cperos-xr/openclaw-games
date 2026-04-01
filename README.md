# OpenClaw Adventures — GitHub Pages site

This folder contains a static site for the OpenClaw games. Use the steps below to publish it on GitHub Pages.

Quick publish (recommended):

1. Create a new GitHub repository (via the website or the `gh` CLI).
2. From this folder run:

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin git@github.com:USERNAME/REPO.git
git push -u origin main
```

The included GitHub Actions workflow will automatically deploy the repository to GitHub Pages on pushes to `main`.

If you prefer to deploy from an existing repo, copy these files into the repo root or a `docs/` folder and either:

- let the included workflow deploy the repository (adjust `path:` in the workflow if you put the site under a subfolder), or
- enable Pages in your repository settings and point it at the `docs/` folder or `main` branch.

Local preview:

```bash
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Notes:
- `.nojekyll` is included to prevent Jekyll from ignoring files.
- Add a `CNAME` file if you plan to use a custom domain.
- Replace placeholder game pages under `games/` with your actual HTML/CSS/JS games.
