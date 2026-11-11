const pool = require("./db");

async function testDatabase() {
  try {
    const result = await pool.query(
      "SELECT NOW() AS current_time"
    );

    console.log("PostgreSQL connected successfully!");
    console.log("Database time:", result.rows[0].current_time);

    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log("Tables:", tables.rows.map(row => row.table_name));
  } catch (error) {
    console.error("Database connection failed:", error.message);
  } finally {
    await pool.end();
  }
}

testDatabase();