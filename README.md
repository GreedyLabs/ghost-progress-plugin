# ghost-progress-plugin

A tiny, dependency-free **reading progress bar** you can drop into any site via
CDN — no build step, no theme editing. Built for the GreedyLabs Ghost blog, but
works on any HTML page. Companion to
[ghost-toc-plugin](https://github.com/GreedyLabs/ghost-toc-plugin).

- Fills a thin bar from 0% to 100% as the reader moves through the article
- Measured against the **article content**, not the whole page
- Follows your Ghost theme accent color automatically
- Configure everything with `data-*` attributes
- **Fully namespaced** under `greedylabs-ghost-progress` (classes + CSS vars) so
  it never clashes with your theme's styles

## Quick start

Add this once. For **Ghost**: Settings → Code injection → **Site Footer**.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/GreedyLabs/ghost-progress-plugin@1/progress.css">
<script src="https://cdn.jsdelivr.net/gh/GreedyLabs/ghost-progress-plugin@1/progress.min.js"
        data-content=".gh-content"
        data-position="top"></script>
```

> `@1` resolves to the latest `v1.x.x` release and jsDelivr auto-minifies it (the
> `.min` suffix). Pin an exact version like `@v1.0.0` for a fully reproducible build.

## Options

All set as `data-*` attributes on the `<script>` tag.

| Attribute | Default | Description |
|---|---|---|
| `data-content` | `.gh-content, article, main, .post-content, .entry-content` | CSS selector for the article body the bar measures |
| `data-position` | `top` | `top` or `bottom` of the viewport |
| `data-height` | `4` | Bar thickness (px) |
| `data-color` | auto | Bar color. **Defaults to your Ghost theme accent** (`--ghost-accent-color`), then `#1a73e8`. Set only to override. |
| `data-z-index` | `100` | Stacking order |

## Styling

Override the CSS variables on `.greedylabs-ghost-progress` — no need to fork the CSS:

```css
.greedylabs-ghost-progress {
    --greedylabs-ghost-progress-color:  #e8590c;  /* the fill */
    --greedylabs-ghost-progress-height: 4px;      /* thickness */
    --greedylabs-ghost-progress-track:  rgba(0,0,0,.06); /* unread track */
}
```

## Programmatic API

```js
var bar = GreedyLabsGhostProgress.create({ content: ".article", position: "bottom" });
bar.destroy();   // removes the bar and all listeners
```

## Notes

- Place the `<script>` without `defer`/`async` so it can read its own `data-*` options.
- If the content selector matches nothing, the bar isn't rendered.

## License

MIT © GreedyLabs
