const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL);
async function run() {
  try {
    await client.connect();
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'inventory'");
    console.log(JSON.stringify(res.rows.map(r => r.column_name)));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
