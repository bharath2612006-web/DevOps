# Bharath U – Portfolio

Personal portfolio built with plain HTML, CSS and JavaScript (no build step), and deployed to GitHub Pages with GitHub Actions.

## Project structure

```
.
├── index.html                    # page content
├── css/style.css                 # styles
├── js/main.js                    # interactive hero plot
├── .github/workflows/deploy.yml  # CI/CD: deploys to GitHub Pages on every push to main
└── README.md
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Publish to GitHub

```bash
git init
git add .
git commit -m "Add portfolio website"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

## Turn on GitHub Pages (one time)

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push any change to `main`. The **Deploy portfolio to GitHub Pages** workflow runs and publishes the site.

The live URL is `https://<your-username>.github.io/<repo-name>/`. Share that link, plus the repository link, with your lecturer.

## Updating the site

Edit the files, then:

```bash
git add .
git commit -m "Describe your change"
git push
```

The workflow redeploys automatically.
