#!/usr/bin/env node
/* eslint-disable */

/**
 * 생성된 API 파일에 ESLint disable 추가하는 스크립트
 * moduleResolution: "Bundler" 사용으로 .js 확장자 불필요
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const GENERATED_DIR = 'packages/api/src/generated';

/**
 * 디렉토리 내 모든 .ts 파일을 재귀적으로 찾기
 */
async function findTsFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findTsFiles(fullPath)));
    } else if (entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * 파일 맨 위에 eslint-disable 추가
 */
function addEslintDisable(content) {
  // 이미 eslint-disable이 있으면 추가하지 않음
  if (content.includes('/* eslint-disable */')) {
    return content;
  }

  // 파일 맨 위에 추가
  return `/* eslint-disable */\n${content}`;
}

/**
 * 메인 실행
 */
async function main() {
  console.log('🔧 Adding ESLint disable to generated files...');

  const files = await findTsFiles(GENERATED_DIR);
  console.log(`📁 Found ${files.length} TypeScript files`);

  let fixedCount = 0;

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const fixed = addEslintDisable(content);

    if (content !== fixed) {
      await writeFile(file, fixed, 'utf-8');
      fixedCount++;
      console.log(`  ✅ Fixed: ${file}`);
    }
  }

  console.log(`\n✨ Fixed ${fixedCount} files`);
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
