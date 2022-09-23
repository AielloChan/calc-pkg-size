#!/usr/bin/env node

const path = require("path");
const { calcPackageJson } = require("./lib.js");

const source = require(path.resolve(process.cwd(), "./package.json"));

calcPackageJson({
  packageJson: source,
  command: "npm install --omit=dev --prefer-offline --no-audit --no-fund",
}).then((result) => {
  console.log(result);
});
