/** Read-only diagnostics: no credentials, records or raw exceptions are printed. */
const { PrismaClient } = require('@prisma/client');
async function main() {
  const s = process.env.CLERK_SECRET_KEY || '';
  const p = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
  console.log('RENTFLOW_AUTH_DIAGNOSTIC ' + JSON.stringify({ secretPresent: Boolean(s), secretPrefixValid: /^sk_(test|live)_/.test(s), secretAsciiOnly: /^[\x20-\x7e]*$/.test(s), secretContainsMask: /[\u2022\u25CF\u25E6]/.test(s), secretHasWhitespace: /\s/.test(s), publishablePrefixValid: /^pk_(test|live)_/.test(p) }));
  const db = new PrismaClient({ log: [], errorFormat: 'minimal' });
  const timer = setTimeout(() => { console.log('RENTFLOW_DB_DIAGNOSTIC timeout'); process.exit(0); }, 10000);
  try {
    const rows = await db.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`;
    const expected = ['Tenant', 'User', 'Customer', 'Inventory', 'Contract', 'Payment', 'IotDevice', 'ActivityLog'];
    const names = new Set(rows.map(row => row.table_name));
    console.log('RENTFLOW_DB_DIAGNOSTIC ' + JSON.stringify({ connected: true, totalPublicTables: rows.length, expectedTablesPresent: expected.filter(name => names.has(name)).length, missingTables: expected.filter(name => !names.has(name)) }));
  } catch (error) { console.log('RENTFLOW_DB_DIAGNOSTIC ' + JSON.stringify({ connected: false, errorCode: /^P\d{4}$/.test(error.code || '') ? error.code : 'unavailable' })); }
  finally { await db.$disconnect(); clearTimeout(timer); }
}
main().catch(() => { console.log('RENTFLOW_DIAGNOSTIC unavailable'); process.exit(0); });
