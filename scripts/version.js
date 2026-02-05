#!/usr/bin/env node

/**
 * AIrena 版本管理脚本
 * 用法:
 *   node scripts/version.js patch  - 更新补丁版本 (1.0.0 -> 1.0.1)
 *   node scripts/version.js minor  - 更新次要版本 (1.0.0 -> 1.1.0)
 *   node scripts/version.js major  - 更新主要版本 (1.0.0 -> 2.0.0)
 *   node scripts/version.js 1.2.3  - 设置指定版本
 */

const fs = require('fs');
const path = require('path');

const versionFile = path.join(__dirname, '..', 'version.json');
const packageFile = path.join(__dirname, '..', 'package.json');

function readVersion() {
  const data = fs.readFileSync(versionFile, 'utf8');
  return JSON.parse(data);
}

function writeVersion(versionData) {
  fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2) + '\n');
  
  // 同步更新 package.json
  if (fs.existsSync(packageFile)) {
    const packageData = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    packageData.version = versionData.version;
    fs.writeFileSync(packageFile, JSON.stringify(packageData, null, 2) + '\n');
  }
}

function bumpVersion(currentVersion, type) {
  const parts = currentVersion.split('.').map(Number);
  
  switch (type) {
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    case 'patch':
      parts[2]++;
      break;
    default:
      throw new Error(`Unknown version type: ${type}`);
  }
  
  return parts.join('.');
}

function validateVersion(version) {
  const regex = /^\d+\.\d+\.\d+$/;
  return regex.test(version);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // 显示当前版本
    const versionData = readVersion();
    console.log(`\n🎮 AIrena 当前版本: v${versionData.version}\n`);
    console.log('用法:');
    console.log('  node scripts/version.js patch  - 更新补丁版本');
    console.log('  node scripts/version.js minor  - 更新次要版本');
    console.log('  node scripts/version.js major  - 更新主要版本');
    console.log('  node scripts/version.js 1.2.3  - 设置指定版本\n');
    return;
  }
  
  const versionData = readVersion();
  const oldVersion = versionData.version;
  let newVersion;
  
  const arg = args[0];
  
  if (['patch', 'minor', 'major'].includes(arg)) {
    newVersion = bumpVersion(oldVersion, arg);
  } else if (validateVersion(arg)) {
    newVersion = arg;
  } else {
    console.error(`❌ 无效的版本号: ${arg}`);
    console.error('版本号格式应为: x.y.z (例如: 1.0.0)');
    process.exit(1);
  }
  
  // 更新版本数据
  versionData.version = newVersion;
  versionData.releaseDate = new Date().toISOString().split('T')[0];
  
  // 添加变更日志条目
  const changelogEntry = {
    version: newVersion,
    date: versionData.releaseDate,
    changes: args[1] ? [args[1]] : ['版本更新']
  };
  
  versionData.changelog.unshift(changelogEntry);
  
  // 写入文件
  writeVersion(versionData);
  
  console.log(`\n✅ 版本已更新: v${oldVersion} -> v${newVersion}\n`);
  console.log('下一步操作:');
  console.log('  1. git add .');
  console.log(`  2. git commit -m "Release v${newVersion}"`);
  console.log(`  3. git tag v${newVersion}`);
  console.log('  4. git push origin main --tags\n');
}

main();
