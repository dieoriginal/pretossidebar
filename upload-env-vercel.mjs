#!/usr/bin/env node
// Bulk upload env vars to Vercel agora project via REST API
// Uses /v1/projects/{id}/env individually (most reliable)

import { readFileSync } from 'fs';
import { resolve } from 'path';

const PROJECT_ID = 'prj_XQ8psKsBsU7CqjuhmEu6T6JbKHum';
const TEAM_ID = 'team_Hr9lWZlNEQ3VhTF090BI8SF1';
const ENV_FILE = resolve('/Users/pretosmediagroupllc/Documents/GitHub/agora/apps/web/.env.local');

const authFile = JSON.parse(readFileSync(
    '/Users/pretosmediagroupllc/Library/Application Support/com.vercel.cli/auth.json',
    'utf8'
));
const TOKEN = authFile.token;
console.log(`\n🔑 Token: ${TOKEN.slice(0, 12)}...\n`);

const SKIP = new Set(['VERCEL_OIDC_TOKEN']);

function parseEnvFile(content) {
    const vars = [];
    for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx < 0) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let value = trimmed.slice(eqIdx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        if (key && value) vars.push({ key, value });
    }
    return vars;
}

const content = readFileSync(ENV_FILE, 'utf8');
const vars = parseEnvFile(content).filter(v => !SKIP.has(v.key));

console.log(`📦 Uploading ${vars.length} env vars...\n`);

let ok = 0;
let errors = 0;

for (const { key, value } of vars) {
    // POST one env var targeting all environments at once using the array format
    const url = `https://api.vercel.com/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}&upsert=true`;
    const body = {
        key,
        value,
        target: ['production', 'preview', 'development'],
        type: 'encrypted',
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (res.ok) {
        ok++;
        process.stdout.write(`  ✅ ${key}\n`);
    } else {
        errors++;
        const err = await res.json();
        process.stdout.write(`  ❌ ${key} (${res.status}): ${err?.error?.message || JSON.stringify(err).slice(0, 80)}\n`);
    }
}

console.log(`\n📊 Results: ${ok} uploaded, ${errors} errors\n`);

if (errors === 0) {
    console.log('🎉 All env vars uploaded! Now triggering redeploy...\n');

    // Get latest git commit to redeploy
    const repoRes = await fetch(`https://api.vercel.com/v1/projects/${PROJECT_ID}?teamId=${TEAM_ID}`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
    });
    const project = await repoRes.json();
    const gitRepo = project?.link;

    if (gitRepo) {
        console.log(`Git repo: ${gitRepo.org}/${gitRepo.repo} (${gitRepo.type})`);
    }

    console.log('\n✅ Run this to redeploy:\n  cd /Users/pretosmediagroupllc/Documents/GitHub/agora && vercel deploy --prod --yes\n');
} else {
    console.log('⚠️  Some vars had errors. Check above.\n');
}
