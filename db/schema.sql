CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS positions (
  id TEXT PRIMARY KEY,
  department_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (department_id, name),
  UNIQUE (department_id, code)
);

-- A client is a company/account. A Client user is the single authorised
-- contact for that account, and may only see projects linked to this record.
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  company TEXT,
  contact_name TEXT NOT NULL DEFAULT '',
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  notes TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE clients ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT NOT NULL DEFAULT '';
UPDATE clients SET code = id WHERE code IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS clients_code_idx ON clients(code) WHERE code IS NOT NULL;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Owner','Manager','Engineer','Client')),
  employee_id TEXT,
  client_id TEXT,
  department TEXT,
  department_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
  position_id TEXT REFERENCES positions(id) ON DELETE SET NULL,
  avatar_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Keep existing databases in sync with the current schema.
ALTER TABLE users ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS position_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS one_client_contact_per_client_idx
  ON users(client_id)
  WHERE role = 'Client' AND client_id IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'users_department_id_fkey'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_department_id_fkey
      FOREIGN KEY (department_id) REFERENCES departments(id)
      ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'users_position_id_fkey'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_position_id_fkey
      FOREIGN KEY (position_id) REFERENCES positions(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS users_department_idx ON users(department_id);
CREATE INDEX IF NOT EXISTS users_position_idx ON users(position_id);

-- A stable legacy sign-in may point to the same account as its current email.
-- This avoids locking an owner out when the delivery email changes.
CREATE TABLE IF NOT EXISTS user_login_aliases (
  email TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS user_login_aliases_user_idx ON user_login_aliases(user_id);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'Meeting' CHECK (event_type IN ('Task','Site Visit','Deadline','Meeting','Milestone')),
  event_date DATE NOT NULL,
  end_date DATE,
  event_time TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Planned' CHECK (status IN ('Planned','Completed','Cancelled')),
  description TEXT NOT NULL DEFAULT '',
  google_event_id TEXT,
  created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS calendar_events_date_idx ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS calendar_events_project_idx ON calendar_events(project_id);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS password_reset_user_idx ON password_reset_tokens(user_id);
CREATE TABLE IF NOT EXISTS auth_rate_limits (
  key_hash TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL,
  phase TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  client_id TEXT,
  department TEXT,
  client_name TEXT,
  project_manager_id TEXT,
  project_manager_name TEXT,
  start_date DATE,
  target_date DATE,
  contract_value NUMERIC(18,2),
  budget NUMERIC(18,2),
  financial_currency TEXT NOT NULL DEFAULT 'EGP',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS contract_value NUMERIC(18,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget NUMERIC(18,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS financial_currency TEXT NOT NULL DEFAULT 'EGP';

-- Membership is the authoritative assignment of engineers to projects.
-- Owner and Manager have studio-wide access and do not need membership rows.
CREATE TABLE IF NOT EXISTS project_memberships (
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_on_project TEXT NOT NULL DEFAULT 'Team Member',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS project_memberships_user_idx
  ON project_memberships(user_id) WHERE active = TRUE;

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  project_name TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  assignee_id TEXT,
  assignee_name TEXT,
  department TEXT,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  deadline DATE,
  parent_task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tasks_project_idx ON tasks(project_id);
CREATE INDEX IF NOT EXISTS tasks_assignee_idx ON tasks(assignee_id);

CREATE TABLE IF NOT EXISTS project_files (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  project_name TEXT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  revision TEXT NOT NULL,
  document_number TEXT,
  discipline TEXT,
  issue_date DATE,
  visibility TEXT NOT NULL DEFAULT 'Internal' CHECK (visibility IN ('Internal', 'Client')),
  status TEXT NOT NULL,
  storage_key TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size BIGINT,
  uploaded_by_id TEXT,
  uploaded_by_name TEXT,
  parent_file_id TEXT REFERENCES project_files(id) ON DELETE SET NULL,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE project_files ADD COLUMN IF NOT EXISTS document_number TEXT;
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS discipline TEXT;
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS issue_date DATE;
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'Internal';
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS folder TEXT NOT NULL DEFAULT 'General';
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';
CREATE UNIQUE INDEX IF NOT EXISTS project_files_document_revision_idx
  ON project_files(project_id, document_number, revision)
  WHERE document_number IS NOT NULL;

CREATE TABLE IF NOT EXISTS transmittals (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  project_name TEXT,
  subject TEXT NOT NULL,
  recipient TEXT NOT NULL,
  issued_by TEXT NOT NULL,
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Issued', 'Acknowledged')),
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transmittal_files (
  transmittal_id TEXT NOT NULL REFERENCES transmittals(id) ON DELETE CASCADE,
  file_id TEXT NOT NULL REFERENCES project_files(id) ON DELETE CASCADE,
  PRIMARY KEY (transmittal_id, file_id)
);

CREATE INDEX IF NOT EXISTS transmittals_project_idx ON transmittals(project_id, issued_date DESC);

-- Progress updates are the deliberately curated client-facing status feed.
-- They are separate from internal tasks, cost, QA and site information.
CREATE TABLE IF NOT EXISTS project_updates (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  progress_percent INTEGER CHECK (progress_percent BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'Published' CHECK (status IN ('Draft', 'Published')),
  published_at TIMESTAMPTZ,
  created_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  project_name TEXT,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  revision TEXT,
  status TEXT NOT NULL,
  submitted_by_id TEXT,
  submitted_by_name TEXT,
  reviewed_by_id TEXT,
  reviewed_by_name TEXT,
  description TEXT NOT NULL DEFAULT '',
  file_id TEXT REFERENCES project_files(id) ON DELETE SET NULL,
  review_comment TEXT NOT NULL DEFAULT '',
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE approvals ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS file_id TEXT REFERENCES project_files(id) ON DELETE SET NULL;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS review_comment TEXT NOT NULL DEFAULT '';
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  sender_id TEXT,
  sender_name TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_transactions (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE finance_transactions ADD COLUMN IF NOT EXISTS transaction_date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE finance_transactions ADD COLUMN IF NOT EXISTS created_by_name TEXT;

CREATE TABLE IF NOT EXISTS site_reports (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  report_date DATE NOT NULL,
  weather TEXT,
  project_name TEXT,
  visit_type TEXT NOT NULL DEFAULT 'Site Visit',
  engineer_name TEXT,
  summary TEXT NOT NULL DEFAULT '',
  created_by_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE site_reports ADD COLUMN IF NOT EXISTS project_name TEXT;
ALTER TABLE site_reports ADD COLUMN IF NOT EXISTS visit_type TEXT NOT NULL DEFAULT 'Site Visit';
ALTER TABLE site_reports ADD COLUMN IF NOT EXISTS engineer_name TEXT;

CREATE TABLE IF NOT EXISTS site_issues (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  assigned_to_id TEXT,
  assigned_to_name TEXT,
  report_id TEXT REFERENCES site_reports(id) ON DELETE CASCADE,
  location TEXT NOT NULL DEFAULT '',
  task_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE site_issues ADD COLUMN IF NOT EXISTS assigned_to_name TEXT;
ALTER TABLE site_issues ADD COLUMN IF NOT EXISTS report_id TEXT REFERENCES site_reports(id) ON DELETE CASCADE;
ALTER TABLE site_issues ADD COLUMN IF NOT EXISTS location TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id TEXT,
  actor_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON audit_logs(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  priority TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS integration_credentials (
  key TEXT PRIMARY KEY,
  encrypted_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Public portfolio content is managed by the Owner from the website CMS.
CREATE TABLE IF NOT EXISTS website_projects (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  year TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Architecture',
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  translations JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS website_projects_published_idx ON website_projects(published, updated_at DESC);

-- Global public website content managed by the Owner.
CREATE TABLE IF NOT EXISTS website_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS website_project_sections (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES website_projects(id) ON DELETE CASCADE,
  eyebrow JSONB NOT NULL DEFAULT '{}'::jsonb,
  title JSONB NOT NULL DEFAULT '{}'::jsonb,
  description JSONB NOT NULL DEFAULT '{}'::jsonb,
  hero_statement JSONB NOT NULL DEFAULT '{}'::jsonb,
  layout TEXT NOT NULL DEFAULT 'editorial' CHECK (layout IN ('editorial', 'gallery', 'drawings', 'full_bleed')),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS website_project_sections_project_order_idx ON website_project_sections(project_id, display_order);

CREATE TABLE IF NOT EXISTS website_project_section_images (
  id TEXT PRIMARY KEY,
  section_id TEXT NOT NULL REFERENCES website_project_sections(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption JSONB NOT NULL DEFAULT '{}'::jsonb,
  alt_text JSONB NOT NULL DEFAULT '{}'::jsonb,
  layout TEXT NOT NULL DEFAULT 'auto' CHECK (layout IN ('auto', 'landscape', 'portrait', 'drawing', 'full_bleed')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS website_project_section_images_section_order_idx ON website_project_section_images(section_id, display_order);

-- AI outputs stay review-only until a human explicitly creates the linked item.
CREATE TABLE IF NOT EXISTS ai_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  requested_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  agent_key TEXT NOT NULL,
  input_summary TEXT NOT NULL DEFAULT '',
  output TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_action_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES ai_reviews(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Proposed' CHECK (status IN ('Proposed', 'Approved', 'Dismissed')),
  approved_by_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  status TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  value NUMERIC(18,2),
  currency TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS procurement_items (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  item TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  supplier TEXT,
  needed_by DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS office_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_id TEXT UNIQUE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT,
  revision TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  owner_name TEXT,
  file_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE office_documents ADD COLUMN IF NOT EXISTS legacy_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS office_documents_legacy_id_idx
  ON office_documents(legacy_id) WHERE legacy_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS quality_items (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS safety_items (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  severity TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timesheets (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  work_date DATE NOT NULL,
  hours NUMERIC(6,2) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS construction_items (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_wbs_nodes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES project_wbs_nodes(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  discipline TEXT NOT NULL DEFAULT '',
  planned_start DATE,
  planned_finish DATE,
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  budget NUMERIC(18,2), notes TEXT NOT NULL DEFAULT '', display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, code)
);
CREATE INDEX IF NOT EXISTS project_wbs_nodes_project_parent_order_idx ON project_wbs_nodes(project_id, parent_id, display_order);

CREATE TABLE IF NOT EXISTS project_schedule_activities (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  wbs_id TEXT REFERENCES project_wbs_nodes(id) ON DELETE SET NULL, activity_code TEXT NOT NULL, name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '', discipline TEXT NOT NULL DEFAULT '', responsible_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  responsible_name TEXT NOT NULL DEFAULT '', planned_duration_days INTEGER NOT NULL DEFAULT 0 CHECK (planned_duration_days >= 0),
  planned_start DATE, planned_finish DATE, actual_start DATE, actual_finish DATE,
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started','In Progress','Completed','On Hold')),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low','Medium','High','Critical')),
  is_milestone BOOLEAN NOT NULL DEFAULT FALSE, display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE (project_id, activity_code)
);
CREATE INDEX IF NOT EXISTS project_schedule_activities_project_wbs_order_idx ON project_schedule_activities(project_id, wbs_id, display_order);

CREATE TABLE IF NOT EXISTS project_activity_dependencies (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  predecessor_activity_id TEXT NOT NULL REFERENCES project_schedule_activities(id) ON DELETE CASCADE,
  successor_activity_id TEXT NOT NULL REFERENCES project_schedule_activities(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL DEFAULT 'FS' CHECK (relationship_type IN ('FS','SS','FF','SF')),
  lag_days INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (predecessor_activity_id <> successor_activity_id), UNIQUE (predecessor_activity_id, successor_activity_id, relationship_type)
);
CREATE INDEX IF NOT EXISTS project_activity_dependencies_project_idx ON project_activity_dependencies(project_id);

CREATE OR REPLACE FUNCTION notify_studio_event() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('studio_events', json_build_object(
    'table', TG_TABLE_NAME,
    'operation', TG_OP,
    'id', COALESCE(NEW.id, OLD.id),
    'at', NOW()
  )::text);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS projects_event ON projects;
CREATE TRIGGER projects_event AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH ROW EXECUTE FUNCTION notify_studio_event();

DROP TRIGGER IF EXISTS tasks_event ON tasks;
CREATE TRIGGER tasks_event AFTER INSERT OR UPDATE OR DELETE ON tasks
FOR EACH ROW EXECUTE FUNCTION notify_studio_event();

DROP TRIGGER IF EXISTS files_event ON project_files;
CREATE TRIGGER files_event AFTER INSERT OR UPDATE OR DELETE ON project_files
FOR EACH ROW EXECUTE FUNCTION notify_studio_event();

DROP TRIGGER IF EXISTS approvals_event ON approvals;
CREATE TRIGGER approvals_event AFTER INSERT OR UPDATE OR DELETE ON approvals
FOR EACH ROW EXECUTE FUNCTION notify_studio_event();

DROP TRIGGER IF EXISTS messages_event ON messages;
CREATE TRIGGER messages_event AFTER INSERT OR UPDATE OR DELETE ON messages
FOR EACH ROW EXECUTE FUNCTION notify_studio_event();

DROP TRIGGER IF EXISTS notifications_event ON notifications;
CREATE TRIGGER notifications_event AFTER INSERT OR UPDATE OR DELETE ON notifications
FOR EACH ROW EXECUTE FUNCTION notify_studio_event();

DROP TRIGGER IF EXISTS finance_event ON finance_transactions;
CREATE TRIGGER finance_event AFTER INSERT OR UPDATE OR DELETE ON finance_transactions
FOR EACH ROW EXECUTE FUNCTION notify_studio_event();

DROP TRIGGER IF EXISTS site_issues_event ON site_issues;
CREATE TRIGGER site_issues_event AFTER INSERT OR UPDATE OR DELETE ON site_issues
FOR EACH ROW EXECUTE FUNCTION notify_studio_event();

DROP TRIGGER IF EXISTS operations_procurement_event ON procurement_items;
CREATE TRIGGER operations_procurement_event AFTER INSERT OR UPDATE OR DELETE ON procurement_items
FOR EACH ROW EXECUTE FUNCTION notify_studio_event();

DROP TRIGGER IF EXISTS operations_quality_event ON quality_items;
CREATE TRIGGER operations_quality_event AFTER INSERT OR UPDATE OR DELETE ON quality_items
FOR EACH ROW EXECUTE FUNCTION notify_studio_event();

DROP TRIGGER IF EXISTS operations_safety_event ON safety_items;
CREATE TRIGGER operations_safety_event AFTER INSERT OR UPDATE OR DELETE ON safety_items
FOR EACH ROW EXECUTE FUNCTION notify_studio_event();

DROP TRIGGER IF EXISTS operations_construction_event ON construction_items;
CREATE TRIGGER operations_construction_event AFTER INSERT OR UPDATE OR DELETE ON construction_items
FOR EACH ROW EXECUTE FUNCTION notify_studio_event();


-- ---- Enterprise Quantity & Cost Control (2026-11-09) ----
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
  valid_until DATE,
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
  valid_until DATE,
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


-- ---- Draft workbook master data: engineering review required ----
-- Imported from Mason_Arc_Complete_Construction_Estimator.xlsx (2026-11-09).
-- UNVERIFIED reference-only quantities and engineering recipes.
-- Import as Draft: none are approved until reviewed by QS/discipline lead.
-- Explicitly NO market price data, supplier quotes, approved construction mix designs, or labor rates are seeded.
INSERT INTO qs_materials(code,name_ar,category,unit,pack_size,default_waste)
VALUES
('CEM','أسمنت بورتلاندي','Concrete & Steel','kg',50,.02),
('SAND','رمل','Concrete & Steel','m³',1,.05),
('AGG','زلط / سن خرسانة','Concrete & Steel','m³',1,.05),
('WATER','مياه خلط','Concrete & Steel','L',1000,.01),
('READY_CONC','خرسانة جاهزة','Concrete & Steel','m³',1,.01),
('FILL_SOIL','تربة ردم','Groundworks','m³',1,.05),
('CRUSHED_STONE','سن / إحلال','Groundworks','m³',1,.06),
('REBAR','حديد تسليح','Concrete & Steel','kg',1000,.03),
('FORM_PLY','مستهلكات شدة خشبية','Concrete & Steel','m²',1,.05),
('FORM_OIL','زيت فك شدات','Concrete & Steel','L',20,.03),
('BLOCK12','بلوك 12 سم','Masonry','pcs',1,.05),
('BLOCK20','بلوك 20 سم','Masonry','pcs',1,.05),
('RED_BRICK','طوب أحمر','Masonry','pcs',1000,.05),
('PUTTY','معجون حوائط','Paint & Finishes','kg',20,.05),
('PRIMER','سيلر / برايمر دهانات','Paint & Finishes','L',9,.05),
('PAINT_IN','دهان داخلي','Paint & Finishes','L',9,.05),
('PAINT_EXT','دهان خارجي','Paint & Finishes','L',9,.06),
('CERAMIC_FL','سيراميك أرضيات','Flooring & Cladding','m²',1,.08),
('CERAMIC_WL','سيراميك حوائط','Flooring & Cladding','m²',1,.1),
('PORCELAIN','بورسلين','Flooring & Cladding','m²',1,.1),
('MARBLE','رخام','Flooring & Cladding','m²',1,.12),
('ADHESIVE','لاصق بلاط','Flooring & Cladding','kg',25,.07),
('GROUT','سقية بلاط','Flooring & Cladding','kg',5,.06),
('BIT_MEM','رول عزل بيتومين','Waterproofing & Roof','m²',10,.12),
('BIT_PRIMER','برايمر بيتومين','Waterproofing & Roof','L',20,.06),
('WP_CEMENT','عزل إسمنتي','Waterproofing & Roof','kg',20,.08),
('ROOF_INS','ألواح عزل حراري','Waterproofing & Roof','m²',1,.08),
('GYPSUM','ألواح جبس بورد','Doors & Ceilings','m²',2.88,.08),
('METAL_PROF','قطاعات جبس بورد','Doors & Ceilings','m',3,.08),
('SCREW','مسمار جبس','Doors & Ceilings','pcs',1000,.08),
('DOOR_W','باب خشب','Doors & Ceilings','pcs',1,0),
('DOOR_M','باب معدني','Doors & Ceilings','pcs',1,0),
('WIN_AL','شباك ألومنيوم','Doors & Ceilings','m²',1,.03),
('GLASS','زجاج','Doors & Ceilings','m²',1,.05),
('PPR20','مواسير PPR 20مم','Plumbing','m',4,.05),
('PPR25','مواسير PPR 25مم','Plumbing','m',4,.05),
('UPVC50','صرف UPVC 50مم','Plumbing','m',6,.05),
('UPVC110','صرف UPVC 110مم','Plumbing','m',6,.05),
('WC','كرسي حمام','Plumbing','pcs',1,0),
('BASIN','حوض','Plumbing','pcs',1,0),
('MIXER','خلاط','Plumbing','pcs',1,0),
('FLOOR_DRAIN','بلاعة أرضية','Plumbing','pcs',1,0),
('CONDUIT20','خرطوم كهرباء 20مم','Electrical','m',50,.05),
('WIRE25','سلك 2.5مم²','Electrical','m',100,.05),
('WIRE4','سلك 4مم²','Electrical','m',100,.05),
('WIRE_MIX','سلك إضافي لنقطة كهرباء','Electrical','m',100,.06),
('ELEC_BOX','علبة كهرباء','Electrical','pcs',1,.04),
('SOCKET','بريزة','Electrical','pcs',1,.02),
('SWITCH','مفتاح','Electrical','pcs',1,.02),
('LIGHT','وحدة إضاءة','Electrical','pcs',1,.02),
('DB','لوحة توزيع','Electrical','pcs',1,0),
('GALV_DUCT','صاج دكت','HVAC & Fire','m²',1,.08),
('COPPER_PAIR','ماسورة نحاس مزدوجة','HVAC & Fire','m',1,.05),
('AC_UNIT','وحدة تكييف','HVAC & Fire','pcs',1,0),
('FIRE_PIPE','ماسورة حريق','HVAC & Fire','m',6,.05),
('SPRINKLER','رشاش حريق','HVAC & Fire','pcs',1,.02),
('PAVING','إنترلوك','External Works','m²',1,.06),
('CURB','بردورة','External Works','m',1,.05),
('TOPSOIL','تربة زراعية','External Works','m³',1,.08),
('TURF','نجيلة','External Works','m²',1,.08),
('IRR_PIPE','ماسورة ري','External Works','m',50,.05)
ON CONFLICT(code) DO NOTHING;
INSERT INTO qs_activities(code,category,title_ar,unit,measure_rule)
VALUES
('EXC','Groundworks','حفر التربة','m³','VOLUME'),
('BACKFILL','Groundworks','ردم ودمك','m³','VOLUME'),
('SUBBASE','Groundworks','طبقة إحلال سن','m³','VOLUME'),
('PCC_SITE','Concrete & Steel','خرسانة عادية - خلط بالموقع','m³','VOLUME'),
('RCC_SITE','Concrete & Steel','خرسانة مسلحة - خلط بالموقع','m³','VOLUME'),
('RCC_READY','Concrete & Steel','خرسانة جاهزة','m³','VOLUME'),
('REBAR','Concrete & Steel','حديد تسليح','kg','DIRECT'),
('FORMWORK','Concrete & Steel','شدة نجارة / فرم','m²','AREA'),
('BLOCK12','Masonry','مباني بلوك 12 سم','m²','AREA'),
('BLOCK20','Masonry','مباني بلوك 20 سم','m²','AREA'),
('BRICK12','Masonry','مباني طوب أحمر 12 سم','m²','AREA'),
('BRICK25','Masonry','مباني طوب أحمر 25 سم','m²','AREA'),
('LINTEL','Concrete & Steel','عتب خرسانة جاهزة','m³','VOLUME'),
('PLASTER_IN','Plaster & Screed','محارة داخلية','m²','AREA'),
('PLASTER_EXT','Plaster & Screed','محارة خارجية','m²','AREA'),
('FACADE_RENDER','Plaster & Screed','بياض واجهات أسمنتي','m²','AREA'),
('SCREED4','Plaster & Screed','مونة تسوية أرضيات 4 سم','m²','AREA'),
('SCREED6','Plaster & Screed','مونة تسوية أرضيات 6 سم','m²','AREA'),
('PUTTY','Paint & Finishes','معجون حوائط','m²','AREA'),
('PRIMER','Paint & Finishes','سيلر / برايمر دهانات','m²','AREA'),
('PAINT_IN','Paint & Finishes','دهان داخلي وجهان','m²','AREA'),
('PAINT_EXT','Paint & Finishes','دهان خارجي وجهان','m²','AREA'),
('CERAMIC_FL','Flooring & Cladding','سيراميك أرضيات','m²','AREA'),
('CERAMIC_WL','Flooring & Cladding','سيراميك حوائط','m²','AREA'),
('PORCELAIN','Flooring & Cladding','بورسلين أرضيات','m²','AREA'),
('MARBLE_FL','Flooring & Cladding','رخام أرضيات','m²','AREA'),
('TILE_SKIRT','Flooring & Cladding','وزرة سيراميك 10 سم','m','LENGTH'),
('WP_ROOF','Waterproofing & Roof','عزل بيتومين رول للأسطح','m²','AREA'),
('WP_WET','Waterproofing & Roof','عزل إسمنتي للحمامات','m²','AREA'),
('ROOF_INS','Waterproofing & Roof','عزل حراري للأسطح','m²','AREA'),
('GYP_CEIL','Doors & Ceilings','سقف جبس بورد','m²','AREA'),
('GYP_PART','Doors & Ceilings','قاطع جبس بورد وجهين','m²','AREA'),
('DOOR_W','Doors & Ceilings','باب خشب كامل','pcs','COUNT'),
('DOOR_M','Doors & Ceilings','باب معدني','pcs','COUNT'),
('WIN_AL','Doors & Ceilings','شبابيك ألومنيوم','m²','AREA'),
('GLAZING','Doors & Ceilings','زجاج واجهات','m²','AREA'),
('PPR20','Plumbing','ماسورة تغذية PPR 20 مم','m','LENGTH'),
('PPR25','Plumbing','ماسورة تغذية PPR 25 مم','m','LENGTH'),
('UPVC50','Plumbing','ماسورة صرف UPVC 50 مم','m','LENGTH'),
('UPVC110','Plumbing','ماسورة صرف UPVC 110 مم','m','LENGTH'),
('WC_SET','Plumbing','كرسي حمام','pcs','COUNT'),
('BASIN','Plumbing','حوض كامل','pcs','COUNT'),
('MIXER','Plumbing','خلاط','pcs','COUNT'),
('FLOOR_DRAIN','Plumbing','بلاعة أرضية','pcs','COUNT'),
('CONDUIT20','Electrical','خرطوم كهرباء 20 مم','m','LENGTH'),
('CABLE25','Electrical','سلك كهرباء 2.5 مم²','m','LENGTH'),
('CABLE4','Electrical','سلك كهرباء 4 مم²','m','LENGTH'),
('E_POINT','Electrical','نقطة كهرباء كاملة','pcs','COUNT'),
('SOCKET','Electrical','بريزة كهرباء','pcs','COUNT'),
('SWITCH','Electrical','مفتاح كهرباء','pcs','COUNT'),
('LIGHT','Electrical','وحدة إضاءة','pcs','COUNT'),
('DB','Electrical','لوحة توزيع كهرباء','pcs','COUNT'),
('HVAC_DUCT','HVAC & Fire','مجاري تكييف صاج','m²','AREA'),
('HVAC_COPPER','HVAC & Fire','مواسير نحاس تكييف مزدوجة','m','LENGTH'),
('AC_UNIT','HVAC & Fire','وحدة تكييف','pcs','COUNT'),
('FIRE_PIPE','HVAC & Fire','مواسير مكافحة حريق','m','LENGTH'),
('SPRINKLER','HVAC & Fire','رشاش حريق','pcs','COUNT'),
('PAVING','External Works','إنترلوك أرضيات','m²','AREA'),
('CURB','External Works','بردورة','m','LENGTH'),
('TOPSOIL','External Works','تربة زراعية','m³','VOLUME'),
('TURF','External Works','نجيلة طبيعية','m²','AREA'),
('IRR_PIPE','External Works','ماسورة ري','m','LENGTH'),
('DEMOLISH','Groundworks','إزالة / تكسير','m³','VOLUME'),
('CLEAN','External Works','نظافة نهائية للموقع','m²','AREA')
ON CONFLICT(code) DO NOTHING;
INSERT INTO qs_consumption_recipes(activity_id,material_id,coefficient,technical_basis,status)
SELECT a.id,m.id,v.coefficient,
  CASE WHEN v.activity_code IN ('PCC_SITE','RCC_SITE') THEN 'Illustrative only: approved mix design required'
       WHEN v.activity_code='E_POINT' THEN 'Avoid double counting with cable length activities'
       ELSE 'Unverified workbook reference; technical sign-off required' END,
  'Draft'
FROM (VALUES
('BACKFILL','FILL_SOIL',1),
('SUBBASE','CRUSHED_STONE',1.05),
('PCC_SITE','CEM',250),
('PCC_SITE','SAND',.5),
('PCC_SITE','AGG',.85),
('PCC_SITE','WATER',170),
('RCC_SITE','CEM',350),
('RCC_SITE','SAND',.45),
('RCC_SITE','AGG',.88),
('RCC_SITE','WATER',185),
('RCC_READY','READY_CONC',1),
('REBAR','REBAR',1),
('FORMWORK','FORM_PLY',.2),
('FORMWORK','FORM_OIL',.05),
('BLOCK12','BLOCK12',12.5),
('BLOCK12','CEM',6),
('BLOCK12','SAND',.017),
('BLOCK20','BLOCK20',12.5),
('BLOCK20','CEM',8),
('BLOCK20','SAND',.022),
('BRICK12','RED_BRICK',55),
('BRICK12','CEM',7),
('BRICK12','SAND',.018),
('BRICK25','RED_BRICK',110),
('BRICK25','CEM',12),
('BRICK25','SAND',.032),
('LINTEL','READY_CONC',1),
('PLASTER_IN','CEM',7.5),
('PLASTER_IN','SAND',.022),
('PLASTER_IN','WATER',4),
('PLASTER_EXT','CEM',9),
('PLASTER_EXT','SAND',.025),
('PLASTER_EXT','WATER',5),
('FACADE_RENDER','CEM',10),
('FACADE_RENDER','SAND',.028),
('SCREED4','CEM',14),
('SCREED4','SAND',.044),
('SCREED6','CEM',20),
('SCREED6','SAND',.066),
('PUTTY','PUTTY',2),
('PRIMER','PRIMER',.14),
('PAINT_IN','PAINT_IN',.28),
('PAINT_EXT','PAINT_EXT',.32),
('CERAMIC_FL','CERAMIC_FL',1),
('CERAMIC_FL','ADHESIVE',4.5),
('CERAMIC_FL','GROUT',.22),
('CERAMIC_WL','CERAMIC_WL',1),
('CERAMIC_WL','ADHESIVE',5),
('CERAMIC_WL','GROUT',.25),
('PORCELAIN','PORCELAIN',1),
('PORCELAIN','ADHESIVE',6),
('PORCELAIN','GROUT',.25),
('MARBLE_FL','MARBLE',1),
('MARBLE_FL','CEM',9),
('MARBLE_FL','SAND',.027),
('TILE_SKIRT','CERAMIC_FL',.1),
('TILE_SKIRT','ADHESIVE',.45),
('TILE_SKIRT','GROUT',.025),
('WP_ROOF','BIT_MEM',1.12),
('WP_ROOF','BIT_PRIMER',.25),
('WP_WET','WP_CEMENT',2.2),
('ROOF_INS','ROOF_INS',1),
('GYP_CEIL','GYPSUM',1),
('GYP_CEIL','METAL_PROF',2.2),
('GYP_CEIL','SCREW',15),
('GYP_PART','GYPSUM',2),
('GYP_PART','METAL_PROF',2.6),
('GYP_PART','SCREW',25),
('DOOR_W','DOOR_W',1),
('DOOR_M','DOOR_M',1),
('WIN_AL','WIN_AL',1),
('GLAZING','GLASS',1),
('PPR20','PPR20',1),
('PPR25','PPR25',1),
('UPVC50','UPVC50',1),
('UPVC110','UPVC110',1),
('WC_SET','WC',1),
('BASIN','BASIN',1),
('MIXER','MIXER',1),
('FLOOR_DRAIN','FLOOR_DRAIN',1),
('CONDUIT20','CONDUIT20',1),
('CABLE25','WIRE25',1),
('CABLE4','WIRE4',1),
('E_POINT','ELEC_BOX',1),
('E_POINT','WIRE_MIX',8),
('SOCKET','SOCKET',1),
('SWITCH','SWITCH',1),
('LIGHT','LIGHT',1),
('DB','DB',1),
('HVAC_DUCT','GALV_DUCT',1),
('HVAC_COPPER','COPPER_PAIR',1),
('AC_UNIT','AC_UNIT',1),
('FIRE_PIPE','FIRE_PIPE',1),
('SPRINKLER','SPRINKLER',1),
('PAVING','PAVING',1),
('PAVING','SAND',.05),
('CURB','CURB',1),
('TOPSOIL','TOPSOIL',1),
('TURF','TURF',1),
('IRR_PIPE','IRR_PIPE',1)
) AS v(activity_code,material_code,coefficient)
JOIN qs_activities a ON a.code=v.activity_code
JOIN qs_materials m ON m.code=v.material_code
ON CONFLICT(activity_id,material_id) DO NOTHING;
