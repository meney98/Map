# Fonadhoo House Map
GitHub Pages-ready black-and-white interactive map based on the supplied WAMCO/Fonadhoo PDF.

## Publish
Upload `index.html`, `style.css`, `app.js`, `map.svg`, and `houses.json` to a GitHub repository. In **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/ (root)`, then save.

## Features
- Full original map reference in black and white
- Pan and zoom (mouse/touch)
- Searchable labels extracted from the supplied PDF
- Search result highlighting and automatic zoom
- No added dot markers

## Important
This first build preserves the source map visually and overlays searchable labels. Individual house polygons are not yet separately traced as SVG shapes; that is the next stage if every house block must be independently clickable/editable.
