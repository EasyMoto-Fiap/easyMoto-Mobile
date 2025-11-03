import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface BuildInfo {
    commitHash: string;
    buildDate: string;
}

function getHash(): string {
  try {
    const envHash =
      process.env.EAS_BUILD_GIT_COMMIT_HASH ||
      process.env.GIT_COMMIT ||
      process.env.VERCEL_GIT_COMMIT_SHA;
    if (envHash) return envHash.substring(0, 7);
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'dev';
  }
}

function main() {
  const payload: BuildInfo = {
    commitHash: getHash(),
    buildDate: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, '..', 'src', 'buildInfo.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log('🔧 buildInfo criado:', payload);
}

main();