# Accessibility

Target: **WCAG 2.2 AA** practices.

## Implemented baseline

- Semantic HTML landmarks (header, main, nav, article)
- Visible `:focus-visible` outlines (accent colour)
- Button/link contrast on dark and light tokens
- Signal Ring has `role="img"` + descriptive `aria-label`
- Search and filter controls have `aria-label`
- `aria-pressed` on Save / Compare toggles
- `aria-live="polite"` on scan-health status
- Reduced-motion: transitions disabled via `prefers-reduced-motion`
- Keyboard-reachable controls (native buttons/links/inputs)
- Compare table uses `<th scope="row">` for field labels

## Manual checks before release

- [ ] Tab through Discover → card Details → Opportunity → Shortlist → Compare → How this works → Operator
- [ ] Screen reader announces Signal Ring and scan status
- [ ] No information by colour alone (verification text + ring label)
- [ ] 200% zoom usable
- [ ] Width 320px: filters wrap, cards stack, no horizontal trap
- [ ] Touch targets ≥ ~44×44px on primary actions

## Known gaps (track in Phase 6+)

- Full axe-core CI not wired yet
- Operator console not behind authenticated Netlify Identity gate in UI (env secrets protect writes)
- Skip-to-content link can be added as a fast follow
