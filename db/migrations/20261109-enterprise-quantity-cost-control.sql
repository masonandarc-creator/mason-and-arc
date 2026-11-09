-- MASON & ARC OS / Enterprise Quantity & Cost Control
-- Additive migration. Does not modify existing studio, website or finance tables.
-- Prices are NOT seeded: an unverified rate must never be treated as a market price.
CREATE TABLE IF NOT EXISTS qs_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE CHECK (length(code) BETWEEN 2 AND 48),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Other',
  unit TEXT NOT NULL CHECK (unit IN ('kg','ton','m','m²','m³','L','pcs','set')),
  pack_size NUMERIC(16,4) NOT NULL DEFAULT 1 CHECK (pack_size > 0),
  default_waste NUMERIC(8,6) NOT NULL DEFAULT 0 CHECK (default_waste >= 0 AND default_waste <= 1),
  specification TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Approved','Archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS qs_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL DEFAULT '',
  unit TEXT NOT NULL,
  measure_rule TEXT NOT NULL CHECK (measure_rule IN ('VOLUME','AREA','LENGTH','COUNT','DIRECT')),
  specification TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Approved','Archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS qs_consumption_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES qs_activities(id) ON DELETE RESTRICT,
  material_id UUID NOT NULL REFERENCES qs_materials(id) ON DELETE RESTRICT,
  coefficient NUMERIC(20,8) NOT NULL CHECK (coefficient > 0),
  waste_percent NUMERIC(8,6) NOT NULL DEFAULT 0 CHECK (waste_percent BETWEEN 0 AND 1),
  technical_basis TEXT NOT NULL DEFAULT '',
  approval_reference TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Approved','Archived')),
  approved_by TEXT REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(activity_id, material_id)
);
-- Supplier quotations are distinct from verified, date-bound market rates.
CREATE TABLE IF NOT EXISTS qs_supplier_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES qs_materials(id) ON DELETE RESTRICT,
  supplier_name TEXT NOT NULL,
  governorate TEXT NOT NULL,
  unit_price_egp NUMERIC(18,4) NOT NULL CHECK (unit_price_egp > 0),
  delivery_egp_per_unit NUMERIC(18,4) NOT NULL DEFAULT 0 CHECK (delivery_egp_per_unit >= 0),
  quoted_at DATE NOT NULL,
  valid_until DATE NOT NULL,
  source_reference TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Rejected','Superseded')),
  approved_by TEXT REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (valid_until IS NULL OR valid_until >= quoted_at),
  CHECK (status <> 'Approved' OR (approved_by IS NOT NULL AND approved_at IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS qs_quote_market_idx ON qs_supplier_quotes(material_id, governorate, status, quoted_at DESC);
-- The same evidence/provenance rules apply to local labor and plant rates.
CREATE TABLE IF NOT EXISTS qs_activity_rate_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES qs_activities(id) ON DELETE RESTRICT,
  component TEXT NOT NULL CHECK (component IN ('Labor','Equipment')),
  contractor_name TEXT NOT NULL,
  governorate TEXT NOT NULL,
  unit_rate_egp NUMERIC(18,4) NOT NULL CHECK (unit_rate_egp >= 0),
  quoted_at DATE NOT NULL,
  valid_until DATE NOT NULL,
  source_reference TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Rejected','Superseded')),
  approved_by TEXT REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (valid_until IS NULL OR valid_until >= quoted_at),
  CHECK (status <> 'Approved' OR (approved_by IS NOT NULL AND approved_at IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS qs_activity_market_idx ON qs_activity_rate_quotes(activity_id, component, governorate, status, quoted_at DESC);
CREATE TABLE IF NOT EXISTS qs_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  governorate TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft','Under Review','Approved','Superseded')),
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  overhead_percent NUMERIC(8,4) NOT NULL DEFAULT 0 CHECK (overhead_percent BETWEEN 0 AND 100),
  contingency_percent NUMERIC(8,4) NOT NULL DEFAULT 0 CHECK (contingency_percent BETWEEN 0 AND 100),
  profit_percent NUMERIC(8,4) NOT NULL DEFAULT 0 CHECK (profit_percent BETWEEN 0 AND 100),
  tax_percent NUMERIC(8,4) NOT NULL DEFAULT 0 CHECK (tax_percent BETWEEN 0 AND 100),
  currency TEXT NOT NULL DEFAULT 'EGP' CHECK (currency='EGP'),
  created_by TEXT REFERENCES users(id),
  approved_by TEXT REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS qs_estimates_project_idx ON qs_estimates(project_id, created_at DESC);
CREATE TABLE IF NOT EXISTS qs_takeoff_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES qs_estimates(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES qs_activities(id) ON DELETE RESTRICT,
  zone TEXT NOT NULL DEFAULT '',
  element_reference TEXT NOT NULL DEFAULT '',
  drawing_revision TEXT NOT NULL DEFAULT '',
  item_count NUMERIC(20,6) NOT NULL DEFAULT 1 CHECK (item_count >= 0),
  length_m NUMERIC(20,6) NOT NULL DEFAULT 0 CHECK (length_m >= 0),
  width_m NUMERIC(20,6) NOT NULL DEFAULT 0 CHECK (width_m >= 0),
  height_m NUMERIC(20,6) NOT NULL DEFAULT 0 CHECK (height_m >= 0),
  deduction NUMERIC(20,6) NOT NULL DEFAULT 0 CHECK (deduction >= 0),
  notes TEXT NOT NULL DEFAULT '',
  created_by TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS qs_takeoff_estimate_idx ON qs_takeoff_lines(estimate_id,activity_id);
-- Immutable approved cost/quantity record; later rate changes must never rewrite a baseline.
CREATE TABLE IF NOT EXISTS qs_estimate_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES qs_estimates(id) ON DELETE RESTRICT,
  revision INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  total_egp NUMERIC(20,2) NOT NULL CHECK (total_egp >= 0),
  approved_by TEXT NOT NULL REFERENCES users(id),
  approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(estimate_id,revision)
);
