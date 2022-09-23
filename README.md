# Calc Pkg Size

```bash
> calc-pkg-size
[
  {
    name: 'koa-router',
    version: '^7.0.1',
    command: 'npm install --omit=dev --prefer-offline --no-audit --no-fund',
    size: 802816,
    pretty: '803 kB',
    date: '2022-09-23T11:02:44.062Z'
  },
  {
    name: 'jsonwebtoken',
    version: '^8.5.1',
    command: 'npm install --omit=dev --prefer-offline --no-audit --no-fund',
    size: 536576,
    pretty: '537 kB',
    date: '2022-09-23T11:02:44.061Z'
  },
  {
    name: 'js-sha512',
    version: '^0.8.0',
    command: 'npm install --omit=dev --prefer-offline --no-audit --no-fund',
    size: 86016,
    pretty: '86 kB',
    date: '2022-09-23T11:04:05.235Z'
  }
]
```

English? Use Google translate

计算指定 package.json 中的所有 package 大小

原理是通过在缓存目录单独安装这些 package，然后计算 node_modules 的大小，得到绝对准确的单包体积

因为 package.json 在整体安装的时候，会有大量 包复用的情况，所以这里得到的单个包体积累加起来是会大于实际整体安装的大小的。

## 用法

### 通过引入包使用

```bash
yarn add -D calc-pkg-size
```

```js
const { calcPkgSize, calcPackageJson } = require("calc-pkg-size");

// 计算单个包的大小
const sizeInfo = await calcPkgSize("@unmonorepo/pkg", "1.4.0");
console.log(sizeInfo)

// 计算指定 package.json 中 dependencie 字段中的所有包的单个体积
const sizeInfo = await calcPackageJson({
  packageJsonPath: path.resolve(__dirname, './package.json'),
  command: "npm install --omit=dev --prefer-offline --no-audit --no-fund",
});
// 或者直接提供 package.json 的 [json 对象]
const sizeInfo = await calcPackageJson({
  packageJson: {
    dependencies: {
      "@unmonorepo/pkg": "1.4.0"
    }
  },
  command: "npm install --omit=dev --prefer-offline --no-audit --no-fund",
});
console.log(sizeInfo)
```

### 或者使用 cli

安装
```bash
npm i -g calc-pkg-size
# or
yarn global add calc-pkg-size
```

使用

```bash
calc-pkg-size
```

## 更多

欢迎意见或建议

issues are welcome