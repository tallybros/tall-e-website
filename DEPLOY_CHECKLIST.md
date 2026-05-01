# Deploy Checklist

Run every step in order. Do not skip. Do not deploy if any step fails.

---

## 1. Snapshot production state

```bash
node tests/pre-deploy-check.cjs
```

- Paste the full output here before proceeding.
- Confirm brands list looks correct with Tally.
- If `brands: []` or any brand has an empty guide → **STOP. Fix first.**

Save the raw response to a local file **right now**, before touching anything:

```bash
curl -s https://www.tall-e.nl/api/settings > kv-snapshot-$(date +%Y%m%d-%H%M%S).json
```

Keep this file. If the deploy corrupts KV, this is what you restore from — not something you reconstruct from memory after the fact.

---

## 2. Summarise what changed

Fill in before every deploy:

| File | What it does | Touches KV? | Touches API contract? |
|------|-------------|-------------|----------------------|
|      |             | yes / no    | yes / no             |

Risk checklist:
- [ ] Data loss possible?
- [ ] API response shape changed? (breaks frontend if CDN cache is stale)
- [ ] Layout change? (needs regression test)
- [ ] A11y change? (needs a11y test)
- [ ] Auth change?
- [ ] Does this break the standalone personifiedAI site if it's still running?

---

## 3. Run the full test suite locally

```bash
npm test
```

All of these must pass:
- [ ] `test:unit` – utility functions, getBrandGuide paths, settings fallback
- [ ] build – Vite build succeeds, no errors
- [ ] `test:a11y` – zero WCAG 2AA errors on `/`, `/personified-ai`, `/personified-ai/admin`
- [ ] `test:regression` – all checks pass including:
  - no console errors on any route
  - all required elements present
  - **at least one persona visible** (catches empty-brands bug)
  - layout stable across persona switches (no shift on `#prompt-input` or `.output-grid`)
  - `#brand-desc` has fixed height (not `auto`)
  - `.persona-row` and `#brand-desc` inside `.persona-card`
  - output grid is two columns
  - admin gate renders + noindex meta present

---

## 4. Deploy to preview first

```bash
vercel
```

- Get the preview URL from the output.
- Open it and manually verify:
  - [ ] Demo loads with personas visible
  - [ ] Run a prompt — output looks correct
  - [ ] Admin gate shows at `/personified-ai/admin`
  - [ ] Contact form renders
  - [ ] Navbar links work from `/personified-ai` back to homepage sections

Then run the pre-deploy check against the preview URL:

```bash
node tests/pre-deploy-check.cjs --url https://YOUR-PREVIEW.vercel.app
```

---

## 5. Promote to production

Only after steps 1–4 are complete and confirmed:

```bash
vercel --prod
```

---

## 6. Post-deploy verification (production)

Run pre-deploy check against production to confirm state is intact:

```bash
node tests/pre-deploy-check.cjs
```

Then verify in browser:
- [ ] `tall-e.nl` loads
- [ ] `tall-e.nl/personified-ai` shows personas, run a prompt
- [ ] `tall-e.nl/personified-ai/admin` shows gate
- [ ] `tall-e.nl/#contact` scrolls to contact section

---

## 7. Rollback plan

Prepared **before** deploying:

```bash
# Code rollback
git revert <sha> && git push

# KV rollback (if settings were at risk)
# Write the restore command here before deploying:
# curl -X POST https://www.tall-e.nl/api/settings \
#   -H "Content-Type: application/json" \
#   -d '{"password":"...","model":"...","brands":[...]}'
```
