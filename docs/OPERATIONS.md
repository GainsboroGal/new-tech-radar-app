# Operations

## Environment variables

See README. Kill switches: `ENABLE_AUTOMATED_SCANS`, `ENABLE_GITHUB_DISCOVERY`.

## Functions

| Function | Type | Role |
|----------|------|------|
| `scan-scheduler` | Scheduled `0 */6 * * *` | Lock → sources → invoke worker |
| `scan-worker-background` | Background | Bounded discovery, snapshot publish |
| `get-opportunities` | Sync | Serve current snapshot |
| `get-scan-status` | Sync | Lock, last success, version |

## Snapshot publication

1. Build payload
2. setJSON snapshots/{version}
3. Strong-consistency readback
4. Update current-pointer
5. Save scan run + last-success
6. Release lock

Failed write does not flip the pointer.
