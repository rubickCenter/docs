# 主程序开发
rubick 主程序的部分功能依赖一些原生 `C++` 扩展。如果你需要开发 `rubick` 主程序，那么你需要确认以下环境：

1. 本地已经有 node 环境：`node版本 > v14`
2. 本地已安装 node-gyp 环境

关于如何安装 node 环境和 node-gy 环境，可以参考这篇文章：[安装NodeJS环境及node-gyp环境](https://www.psvmc.cn/article/2021-01-17-node-gyp.html)
### rubick 目录介绍
```shell
.
├── feature # 插件市场插件
│   ├── README.md
│   ├── babel.config.js
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   ├── src
│   ├── tsconfig.json
│   └── vue.config.js
├── public # rubick __static 目录
│   ├── favicon.ico
│   ├── feature
│   ├── icons
│   ├── index.html
│   ├── preload.js
│   └── tpl
├── src # rubick 核心源码
│   ├── common # 一些通用的函数
│   ├── core # 一些核心的能力，比如 app search
│   ├── main # 主进程
│   └── renderer # 渲染进程
├── tpl # rubick 模板插件
│   ├── README.md
│   ├── babel.config.js
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   ├── src
│   ├── tsconfig.json
│   └── vue.config.js
├── LICENSE # MIT 协议
├── README.md # 英文文档
├── README.zh-CN.md # 中文文档
├── babel.config.js
├── deploy-doc.sh # rubick doc 发布脚本
├── tsconfig.json
├── package-lock.json
├── package.json
└── vue.config.js
```

### 启动
#### 1. 安装依赖
`rubick` 启动主要涉及到3个目录：
1. 根目录：`rubick` 核心进程
2. feature：`rubick` 内置的插件市场插件
3. tpl: `rubick` 内置的模板插件
```shell
$ npm i
$ cd feature && npm i
$ cd tpl && npm i
```

#### 2. 启动核心进程

```shell
$ npm run electron:serve
```

#### 3. 启动插件中心 <Badge type="warning" text="非必须" vertical="top" />

```shell
$ cd feature && npm run serve
```

#### 4. 启动模板插件 <Badge type="warning" text="非必须" vertical="top" />

```shell
$ cd tpl && npm run serve
```

### 编译
```shell
$ cd feature && npm run build
$ cd tpl && npm run build
$ npm run electron:build
```

### PR

1. Create an issue about the features, such as new components.
2. Fork the repo to your own account.
3. Clone your fork.
4. Create a new branch base on dev, if you want to add new component, the branch name should be formatted as component-[Component Name]. (e.g. component-steps) And the commit info should be formatted as [Component Name]: Info about commit.
5. Make sure that running npm run prepublish outputs the correct files.
6. Rebase before creating a PR to keep commit history clear. (Merge request to branch dev)
7. Provide some description about your PR.
