const test=require("node:test");const assert=require("node:assert/strict");const fs=require("node:fs/promises");const path=require("node:path");const {randomUUID}=require("node:crypto");const {Pool}=require("pg");
test("QS migration + draft workbook seed on an isolated PostgreSQL schema",async(t)=>{
 if(!process.env.QS_TEST_DATABASE_URL){t.skip("Set QS_TEST_DATABASE_URL for PostgreSQL migration integration test");return;}
 const pool=new Pool({connectionString:process.env.QS_TEST_DATABASE_URL,ssl:false,max:1});
 const client=await pool.connect();
 const name="qs_test_"+randomUUID().replaceAll("-","");
 const ident='"'+name+'"';
 try{
  await client.query("BEGIN");
  await client.query("CREATE SCHEMA "+ident);
  await client.query("SET LOCAL search_path TO "+ident+",public");
  await client.query("CREATE TABLE users(id text PRIMARY KEY)");
  await client.query("CREATE TABLE projects(id text PRIMARY KEY)");
  const migration=await fs.readFile(path.resolve("db/migrations/20261109-enterprise-quantity-cost-control.sql"),"utf8");
  const seed=await fs.readFile(path.resolve("db/seeds/20261109-estimator-catalog.sql"),"utf8");
  await client.query(migration);
  await client.query(seed);
  // Repeat migration and seed: no duplicate rows or destructive schema changes.
  await client.query(migration);
  await client.query(seed);
  for(const [table,want] of [["qs_materials",61],["qs_activities",64],["qs_consumption_recipes",100]]){
    const result=await client.query("SELECT count(*)::int AS n FROM "+table);
    assert.equal(result.rows[0].n,want,table);
  }
  const materials=await client.query("SELECT DISTINCT status FROM qs_materials");assert.deepEqual(materials.rows.map(r=>r.status),["Draft"]);
  const recipes=await client.query("SELECT DISTINCT status FROM qs_consumption_recipes");assert.deepEqual(recipes.rows.map(r=>r.status),["Draft"]);
  const zeroQuotes=await client.query("SELECT count(*)::int AS n FROM qs_supplier_quotes");assert.equal(zeroQuotes.rows[0].n,0);
  const pair=await client.query("SELECT r.coefficient,m.default_waste,r.waste_percent FROM qs_consumption_recipes r JOIN qs_materials m ON m.id=r.material_id LIMIT 1");
  assert.equal(Number(pair.rows[0].waste_percent),Number(pair.rows[0].default_waste));
  await client.query("SAVEPOINT check_invalid_approval");
  const invalidApproval=await client.query("INSERT INTO qs_supplier_quotes(material_id,supplier_name,governorate,unit_price_egp,quoted_at,source_reference,status) SELECT id,'test','Giza',10,CURRENT_DATE,'fake','Approved' FROM qs_materials LIMIT 1").then(()=>null,e=>e);
  assert.equal(invalidApproval?.code,"23514");
  await client.query("ROLLBACK TO SAVEPOINT check_invalid_approval");
  await client.query("ROLLBACK");
 }finally{client.release();await pool.end();}
});
