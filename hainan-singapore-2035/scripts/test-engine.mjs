import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
const out=mkdtempSync(join(tmpdir(),'two-islands-test-'));
try{
 execFileSync(process.execPath,[resolve('node_modules/typescript/bin/tsc'),'lib/engine.ts','lib/contracts.ts','--target','ES2022','--module','commonjs','--moduleResolution','node','--skipLibCheck','--outDir',out],{stdio:'inherit'});
 execFileSync(process.execPath,['--test','tests/engine.test.cjs'],{stdio:'inherit',env:{...process.env,WT_ENGINE_BUILD:out}});
}finally{rmSync(out,{recursive:true,force:true});}
