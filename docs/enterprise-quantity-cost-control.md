# MASON & ARC OS — Enterprise Quantity & Cost Control

## Purpose
This branch introduces the foundation of an integrated QS and cost-estimating workflow into the existing Mason & Arc PostgreSQL/Next.js admin workspace. It is **not yet an independently certified construction estimating system**, and **must not be released to production until QA and a staging migration succeed**.

### Verified current scope in this branch
- Native admin route: `/app/admin/quantity-cost` (inside the existing Owner/Manager admin shell).
- PostgreSQL master data: 61 draft material types, 64 draft work activities, and 100 draft consumption recipes imported from the original workbook. No prices or labor/equipment market rates were invented or seeded.
- Quote history: supplier, Egyptian governorate, unit, transport allowance, source reference, quotation date, validity and Owner approval.
- Separate contractor quotations for labor and equipment, with Owner approval, supplier source and validity.
- Quantity measurement rules: VOLUME, AREA, LENGTH, COUNT, DIRECT with geometry validation and deductions.
- BOQ calculation: source-gated recipe/material/labor/equipment costs and estimate-level markups. The total is `null` and marked `INCOMPLETE` if any line is unpriced, even when a partial subtotal exists.
- Pure `BigInt` fixed-point decimal engine (9 decimal places), plus initial unit tests.
- Design: light Mason & Arc editorial admin treatment, original site/brand assets left unchanged.

### Cost truthfulness rule
Never display an unverified or missing price as a market quotation. An estimate needs approved, unexpired, region-specific material and contractor rates, plus technically approved recipes. `pricedSubtotalEgp` is explicitly partial when `totalEgp` is null.

### Data sources
The seed catalog came from `Mason_Arc_Complete_Construction_Estimator.xlsx`, not independently certified design specifications. Structural concrete recipes, reinforcement and dimensional assumptions must be reviewed by an authorized qualified engineer before use. Egyptian prices are supplied by evidence-backed vendor quotations; there is **no live Egyptian supplier price feed connected in this branch**.

### Database setup
`db/schema.sql` now includes the additive QS migration and idempotent draft catalog seed. Run on a backup-restorable staging database **before** production. The migration is mirrored in `db/migrations/20261109-enterprise-quantity-cost-control.sql`, with the source records mirrored in `db/seeds/20261109-estimator-catalog.sql` for review. Do not apply both the full schema and standalone migration/seed as independent manual steps unless deliberate; `ON CONFLICT DO NOTHING` makes seeding idempotent.

### QA gates before any production merge
1. `npm test`, `npm run lint`, `npm run build`.
2. PostgreSQL staging migration/rollback rehearsal and repeat seeding (row counts 61/64/100).
3. Auth tests: anonymous 401; Engineer read/takeoff only; Manager submit quotes; Owner approve; client receives 403.
4. Geometry property tests, decimal precision, overflow/negative inputs, 0/1/10% markup order, mixed units and deductions.
5. E2E: create project estimate → takeoff → recipe approval with drawing/spec reference → supplier and labor quotes → Owner approval → regional price/validity check → complete BOQ.
6. Cross-check measured takeoff and cost totals against a signed QS workbook/independent manual calculation, including cases of missing prices and rate expiry.
7. Website + client portal smoke tests (existing public pages, logins, admin navigation, desktop/mobile).
8. Verify prices through real source documents for the relevant Egyptian governorate; benchmark against procurement invoices and signed supplier offers.
9. Security and audit: DB permissions, change logs, approval evidence, concurrency, backups, retention, export and quote revocation.

### Deliberately not yet delivered
- Revit/IFC/BIM takeoff import with model-to-line traceability.
- Drawing revision comparison, automated takeoff QA, and signed electronic QS approval.
- Purchase orders, inventory reservation, vendor tender comparison, subcontractor invoices and paid-vs-committed reconciliation.
- Baseline snapshot approval workflow and change orders.
- Automatic nationwide live market price scraping/integration, or certified market benchmarking.
- Full enterprise hardening, security review, staging end-to-end testing and production release.

These are required before calling the system production-grade/enterprise-complete. Use this branch as the controlled starting implementation rather than declaring Level 05 finished.
