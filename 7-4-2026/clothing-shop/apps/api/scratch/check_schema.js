const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL);
async function run() {
  try {
    await client.connect();
    const res = await client.query("SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'products'");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
