const path = require("path");
const { calcPkgSize, calcPackageJson } = require("../lib.js");

// Just a simple test
async function test() {
  const sizeInfo = await calcPkgSize("@unmonorepo/pkg", "1.4.0");
  if (sizeInfo && sizeInfo.size === 6397952 && sizeInfo.pretty === "6.4 MB") {
    console.log("✅ Test passed");
  } else {
    console.log("❌ Test failed", JSON.stringify(sizeInfo));
  }

  const sizesInfo = await calcPackageJson({
    packageJsonPath: path.resolve(__dirname, "./test.json"),
    command: "npm install --omit=dev --prefer-offline --no-audit --no-fund",
  });
  if (
    sizesInfo &&
    sizesInfo.length === 2 &&
    sizesInfo[0].size === 2727936 &&
    sizesInfo[0].pretty === "2.73 MB" &&
    sizesInfo[1].size === 6397952 &&
    sizesInfo[1].pretty === "6.4 MB"
  ) {
    console.log("✅ Test passed");
  } else {
    console.log("❌ Test failed", JSON.stringify(sizesInfo));
  }
}
test();
