# Performance

## Targets (Master Prompt §17)

| Metric | Target |
|--------|--------|
| Initial feed | No live external API required |
| JS (compressed) | ~200 KB where practical |
| LCP | < 2.5 s |
| INP | < 200 ms |
| CLS | < 0.1 |
| Local filter/search | ~300 ms |

## Design choices that help

- Static-first dataset (seed/emergency bundled)
- Minimal dependency set (React, RR, Zod)
- No heavy UI kit
- CSS variables, no large icon library
- Client-side filter/sort on small lists
- Lazy philosophy: no autoplay, no default trackers

## Measure before optimizing

After `npm run build`, record:

```bash
npx vite build
# inspect dist/ assets sizes
```

Log results in this file under a dated section when production numbers exist.

## Avoid

- Unnecessary hydration surfaces
- Duplicated dependency graphs
- Unbounded client lists without virtualization (N is small at launch)
