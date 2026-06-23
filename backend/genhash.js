const bcrypt = require('bcryptjs');
async function main() {
  const a = await bcrypt.hash('admin123', 10);
  const c = await bcrypt.hash('coord123', 10);
  const e = await bcrypt.hash('est123', 10);
  console.log('admin123:', a);
  console.log('coord123:', c);
  console.log('est123:', e);
}
main();
