import { env } from 'cloudflare:workers';
import local from '../../../data/latest.json';

type EvidenceEnv = {
  DATA_REPOSITORY?: string;
  DATA_BRANCH?: string;
  DATA_MANIFEST?: string;
};

export async function GET() {
  const config = env as unknown as EvidenceEnv;
  const repository = config.DATA_REPOSITORY;
  const branch = config.DATA_BRANCH || 'main';
  const manifest = config.DATA_MANIFEST || 'data/latest.json';
  let data = local;
  let connection = 'not_configured';

  const validRepository = !!repository && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository);
  const validBranch = /^[A-Za-z0-9._/-]+$/.test(branch) && !branch.split('/').includes('..');
  const validManifest = /^[A-Za-z0-9._/-]+$/.test(manifest) && !manifest.split('/').includes('..');

  if (validRepository && validBranch && validManifest) {
    try {
      const url = `https://raw.githubusercontent.com/${repository}/${branch}/${manifest}`;
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw Error('来源暂不可用');
      const text = await response.text();
      if (text.length > 500_000) throw Error('资料文件过大');
      const candidate = JSON.parse(text);
      if (
        candidate.project_key !== 'two-islands-2035-20261030' ||
        candidate.schema_version !== '1.0' ||
        !Array.isArray(candidate.documents) ||
        !Array.isArray(candidate.indicators) ||
        !Array.isArray(candidate.events)
      ) throw Error('资料协议不匹配');
      for (const group of ['documents', 'indicators', 'events']) {
        if (candidate[group].length > 500) throw Error('记录数量超限');
        for (const row of candidate[group]) {
          if (!row || typeof row.source_url !== 'string' || new URL(row.source_url).protocol !== 'https:') {
            throw Error('来源地址无效');
          }
        }
      }
      data = candidate;
      connection = 'connected';
    } catch {
      connection = 'fetch_failed';
    }
  }

  return Response.json(
    { data, connection, repository: repository || null, manifest, modelLinked: false },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
