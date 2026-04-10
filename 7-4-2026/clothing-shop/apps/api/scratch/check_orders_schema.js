const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL);
async function run() {
  try {
    await client.connect();
    const tables = ['orders', 'order_items'];
    for (const table of tables) {
      const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = ", [table]);
      console.log(`Table: ${table}`);
      console.log(JSON.stringify(res.rows, null, 2));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
run();
