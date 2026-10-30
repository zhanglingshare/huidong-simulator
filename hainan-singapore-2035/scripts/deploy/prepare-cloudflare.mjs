import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';

function findConfig() {
  if (process.argv[2]) return resolve(process.argv[2]);
  const root = resolve('dist');
  if (!existsSync(root)) throw new Error('Build output missing. Run npm run build first.');
  const candidates = [join(root, 'server', 'wrangler.json'), ...readdirSync(root, { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => join(root, d.name, 'wrangler.json'))]
    .filter((p, i, a) => a.indexOf(p) === i && existsSync(p));
  if (candidates.length !== 1) throw new Error(`Expected one compiled Wrangler config; found ${candidates.length}`);
  return candidates[0];
}
const input = findConfig();
if (!existsSync(input)) throw new Error(`Build output missing: ${input}. Run npm run build first.`);
const databaseId = process.env.TWO_ISLANDS_D1_DATABASE_ID || '';
if (!/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(databaseId) || /^0{8}-0{4}-/.test(databaseId)) {
  throw new Error('A real, non-placeholder TWO_ISLANDS_D1_DATABASE_ID is required.');
}
const config = JSON.parse(readFileSync(input, 'utf8'));
if (!config.main || !existsSync(resolve(dirname(input), config.main))) {
  throw new Error('Built Worker entrypoint is missing or invalid.');
}
if (!Array.isArray(config.d1_databases) || !config.d1_databases.some(d => d.binding === 'DB')) {
  throw new Error('Required D1 binding DB was not found in the compiled config.');
}
config.name = 'two-islands-2035';
config.workers_dev = false;
config.preview_urls = false;
delete config.routes;
delete config.route;
config.vars = {
  ...config.vars,
  DATA_REPOSITORY: 'zhanglingshare/huidong-simulator',
  DATA_BRANCH: 'main',
  DATA_MANIFEST: 'hainan-singapore-2035/data/latest.json',
};
config.d1_databases = config.d1_databases.map(d => d.binding === 'DB'
  ? { ...d, database_name: 'two-islands-2035', database_id: databaseId, remote: true }
  : d);
if (config.services?.some(s => s.binding === 'CONNECTORS')) {
  throw new Error('Preview-only connector service present in production config.');
}
writeFileSync(input, JSON.stringify(config, null, 2) + '\n');
console.log('Cloudflare configuration prepared for two-islands-2035 (no public routes).');
