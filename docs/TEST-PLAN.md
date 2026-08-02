# Test Plan

## Unit (Vitest)

| Area | File |
|------|------|
| Schema | `src/tests/schema.test.ts` |
| Discovery | `src/tests/discovery.test.ts` |

```bash
npm test
```

## End-to-end critical flows

1. First open → opportunity detail
2. Search and filter
3. Change rarity mode
4. Save opportunity
5. Compare opportunities
6. Download calendar ICS
7. View scan-health
8. Explainability page
9. Operator console
10. API failure → seed/emergency still renders
