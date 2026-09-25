# AHSY Property Market Atlas

This is a static, English-language browser viewer for the PLZ-2026 AHSY indices.
Python runs locally in the visitor's browser through Pyodide; there is no server,
database, or collection of user data.

## Rebuild the web data

From the repository root, run:

```powershell
python WEBTOOL/build_data.py
```

The build requires `pandas` and `geopandas`. It reads the published PLZ-2026
CSV files and postcode shapefile, then writes compact assets under `WEBTOOL/data`.

## Test locally

The browser must receive the files over HTTP (opening `index.html` directly will
not work):

```powershell
python -m http.server 8000 --directory WEBTOOL
```

Open `http://localhost:8000/`.

## Publish and embed

The included GitHub Actions workflow publishes the `WEBTOOL` directory. Enable
GitHub Pages with **Source: GitHub Actions** in the repository settings, then
push to `main`. In Google Sites, choose
**Insert → Embed → By URL** and paste the GitHub Pages URL. A height of roughly
900–1,100 pixels works well on desktop; the viewer rearranges itself on narrow
screens.
