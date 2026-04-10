const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL);
async function run() {
  try {
    await client.connect();
    const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log(JSON.stringify(res.rows.map(r => r.table_name), null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
