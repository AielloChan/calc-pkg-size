#!/usr/bin/env node
// @ts-check
const fs = require("fs");
const os = require("os");
const path = require("path");
const rimraf = require("rimraf");
const minimist = require("minimist");
const { calcPackageJson } = require("./lib");

/**
 * 清空计算缓存
 */
function cleanCache() {
  const cacheDir = path.resolve(os.tmpdir(), "calc-pkg-size");
  rimraf(cacheDir, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("clean cache success");
    }
  });
}

/**
 * 计算包大小
 * @param {Record<string, any>} packageJson
 * @param {string} [command]
 * @param {string} [output]
 */
async function calcSize(
  packageJson,
  command = 'yarn --prod --prefer-offline', // or "npm install --omit=dev --no-audit --no-fund"
  output
) {
  const result = await calcPackageJson({
    packageJson,
    command,
  });

  if (output) {
    fs.writeFileSync(output, JSON.stringify(result, null, 2));
  } else {
    console.log(result);
  }
}

async function main() {
  const argv = minimist(process.argv.slice(2));

  if (argv._ && argv._[0] === "clean") {
    cleanCache();
  } else {
    const pkgJsonPath = argv.pkg || argv.p || "./package.json";
    const command = argv.command || argv.c;
    const outputPath = argv.output || argv.o;

    const packageJson = require(path.resolve(process.cwd(), pkgJsonPath));
    const output = outputPath && path.resolve(process.cwd(), outputPath);

    await calcSize(packageJson, command, output);
  }
}

main();
