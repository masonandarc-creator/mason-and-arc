import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import pg from "pg";
import bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required.");
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL === "false"
      ? false
      : process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
});

const departments = [
  ["DEP-001", "ARC", "Architecture"],
  ["DEP-002", "INT", "Interior Design"],
  ["DEP-003", "ENG", "Engineering"],
  ["DEP-004", "EXE", "Execution"],
  ["DEP-005", "OPS", "Operations"],
  ["DEP-006", "FIN", "Finance"],
  ["DEP-007", "BD", "Business Development"],
  ["DEP-008", "PRC", "Procurement"],
  ["DEP-009", "QA", "Quality & Safety"],
];

const positions = [
  ["POS-001", "DEP-001", "SARCH", "Senior Architect"],
  ["POS-002", "DEP-001", "ARCH", "Architect"],
  ["POS-003", "DEP-001", "JARCH", "Junior Architect"],
  ["POS-004", "DEP-001", "AINTERN", "Architectural Intern"],

  ["POS-005", "DEP-002", "SINT", "Senior Interior Designer"],
  ["POS-006", "DEP-002", "INTDES", "Interior Designer"],
  ["POS-007", "DEP-002", "3DV", "3D Visualizer"],

  ["POS-008", "DEP-003", "STR", "Structural Engineer"],
  ["POS-009", "DEP-003", "MEP", "MEP Engineer"],
  ["POS-010", "DEP-003", "SITEENG", "Site Engineer"],

  ["POS-011", "DEP-004", "PM", "Project Manager"],
  ["POS-012", "DEP-004", "SM", "Site Manager"],
  ["POS-013", "DEP-004", "FOREMAN", "Foreman"],
  ["POS-014", "DEP-004", "QS", "Quantity Surveyor"],

  ["POS-015", "DEP-005", "OM", "Operations Manager"],
  ["POS-016", "DEP-005", "COORD", "Operations Coordinator"],
  ["POS-017", "DEP-005", "ADMIN", "Administrator"],

  ["POS-018", "DEP-006", "ACC", "Accountant"],
  ["POS-019", "DEP-006", "FC", "Financial Controller"],

  ["POS-020", "DEP-007", "BDM", "BD Manager"],
  ["POS-021", "DEP-007", "CR", "Client Relations"],

  ["POS-022", "DEP-008", "PROC", "Procurement Specialist"],

  ["POS-023", "DEP-009", "QAQC", "QA/QC Engineer"],
  ["POS-024", "DEP-009", "HSE", "HSE Engineer"],
];

try {
  const schema = await fs.readFile(
    path.join(process.cwd(), "db/schema.sql"),
    "utf8"
  );

  await pool.query(schema);

  for (const [id, code, name] of departments) {
    await pool.query(
      `
      INSERT INTO departments (id, code, name, active)
      VALUES ($1, $2, $3, true)
      ON CONFLICT (id) DO UPDATE SET
        code = EXCLUDED.code,
        name = EXCLUDED.name,
        active = true,
        updated_at = NOW()
      `,
      [id, code, name]
    );
  }

  for (const [id, departmentId, code, name] of positions) {
    await pool.query(
      `
      INSERT INTO positions (id, department_id, code, name, active)
      VALUES ($1, $2, $3, $4, true)
      ON CONFLICT (id) DO UPDATE SET
        department_id = EXCLUDED.department_id,
        code = EXCLUDED.code,
        name = EXCLUDED.name,
        active = true,
        updated_at = NOW()
      `,
      [id, departmentId, code, name]
    );
  }

  const ownerPassword = process.env.OWNER_PASSWORD;

  if (ownerPassword) {
    const hash = await bcrypt.hash(ownerPassword, 12);

    await pool.query(
      `
      INSERT INTO users (
        id,
        name,
        email,
        password_hash,
        role,
        active
      )
      VALUES ($1,$2,$3,$4,$5,true)
      ON CONFLICT(email)
      DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        password_hash = EXCLUDED.password_hash,
        active = true,
        updated_at = NOW()
      `,
      [
        "USR-001",
        "Mason & Arc Owner",
        "Masonandarc@gmail.com",
        hash,
        "Owner",
      ]
    );
  }

  console.log("Mason & Arc database is ready.");
  console.log(`Departments ready: ${departments.length}`);
  console.log(`Positions ready: ${positions.length}`);
  console.log("Only the Owner account is seeded.");
  console.log("Team members must be created from the app.");
} finally {
  await pool.end();
}
