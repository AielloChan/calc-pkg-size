/// <reference types="./lib.t" />
// @ts-check
const os = require("os");
const path = require("path");
const fs = require("fs-extra");
const crypto = require("crypto");
const { exec } = require("child_process");
const prettyBytes = require("pretty-bytes");
const fastFolderSize = require("fast-folder-size");

/**
 * Calculate the size of a package
 * @param {string} name package name, e.g. lodash
 * @param {string} version package version, e.g. "4.17.21" or "^4.0.0", recommend use specific version
 * @param {string} [command] command to install this package, default is "npm install"
 * @returns
 */
async function calcPkgSize(name, version, command = "npm install") {
  const json = {
    name: `calc-pkg-size-${name}`.replace("@", "").replace("/", "-"),
    private: true,
    description: `install ${name} ${version} through ${String(command)}`,
    dependencies: {
      [name]: version,
    },
  };
  const contentHash = crypto
    .createHash("md5")
    .update(JSON.stringify(json))
    .digest("hex");

  const tmpDir = path.resolve(os.tmpdir(), `calc-pkg-size/${contentHash}`);
  const sizeCachePath = path.resolve(tmpDir, "size.json");

  try {
    const cached = await fs.readFile(sizeCachePath);
    return JSON.parse(cached.toString());
  } catch {
    // no cache
  }
  await fs.ensureDir(tmpDir);
  await fs.writeFile(
    path.resolve(tmpDir, "package.json"),
    JSON.stringify(json)
  );

  await new Promise((resolve, reject) => {
    exec(
      command,
      {
        cwd: tmpDir,
        env: process.env,
        encoding: "utf-8",
      },
      (error, stdout, stderr) => {
        // stdout && process.stdout.write(stdout);
        stderr && process.stderr.write(stderr);

        if (error) {
          reject(error);
        } else {
          resolve(true);
        }
      }
    );
  });

  const bytes = await new Promise((resolve, reject) => {
    fastFolderSize(path.resolve(tmpDir, "node_modules"), (err, bytes) => {
      if (err) {
        reject(err);
      } else {
        resolve(bytes);
      }
    });
  });

  const pretty = prettyBytes(bytes);

  const result = {
    name,
    version,
    command,
    size: bytes,
    pretty,
    date: new Date().toISOString(),
  };

  // write cache
  await fs.writeFile(sizeCachePath, JSON.stringify(result));

  return result;
}

/**
 * Calculate each package's size in a package.json
 * @param {Object} param
 * @param {string} [param.packageJsonPath] package.json absolute path
 * @param {Record<string,any>} [param.packageJson] package.json content, if not provided, will read from packageJsonPath
 * @param {string} param.command command to install package, default is "npm install", you can use "npm install --omit=dev --prefer-offline --no-audit --no-fund"
 */
async function calcPackageJson({ packageJsonPath, packageJson, command }) {
  let pkgJson = {};
  if (packageJson) {
    pkgJson = packageJson;
  } else if (packageJsonPath) {
    const pkgJsonRaw = await fs.readFile(packageJsonPath, "utf-8");
    pkgJson = JSON.parse(pkgJsonRaw);
  }
  if (!pkgJson) {
    throw new Error("packageJson or packageJsonPath is required");
  }

  const deps = pkgJson.dependencies;
  if (!deps) {
    throw new Error("'dependencies' is required in package.json");
  }

  const asyncJobs = Object.keys(deps).map(function (name) {
    return calcPkgSize(name, deps[name], command);
  });

  const result = await Promise.all(asyncJobs);

  const sorted = result.sort((a, b) => (b.size - a.size > 0 ? -1 : 1));

  return sorted;
}

module.exports = {
  calcPkgSize,
  calcPackageJson,
};
