# Rubick 插件化实现原理

Rubick 所有实现原理已经做成了一个课程，这里目前只有其中一个章节，有需要了解全部的可以去购买：https://juejin.cn/book/7302990019642261567

![](https://pic1.zhimg.com/80/v2-206b0cb3321b00a93a5f5d5ce8b7daab_720w.png)

## 前言
我们知道了要实现的工具箱的一个非常重要的能力就是支持插件化能力，有了插件化能力后，我们所有的效率工具都可以通过类似 `vscode` 插件的方式进行安装、发布、卸载。

其实，插件化的核心原理可以类比 `Hybrid App (混合应用)`。 `Hybrid App` 是一种混合了 `Native` 和 `H5` 的移动端开发技术方案，核心目的是想集齐 `H5` 应用的快速迭代和 `Native` 原生操作交互能力优势。大多数 `Hybrid App` 都是采用 `Webview UI` + `JSBridge` 来实现的。其实，说到这里，你也可以认为那些集成到 `Webview` 中的 `H5` 页面就是一个个插件，这些插件可以独立于 `APP` 进行部署、迭代，而 `Webview` 容器可以动态加载不同的**插件**。

以上，就是我们要实现插件化技术的核心原理概要。不过，在 Electron 中，稍微有点不同，我们希望实现的插件化体系大致是这样：

<p align=center><img src="https://picx.zhimg.com/80/v2-cb899c4b41f88648b67ce45f37cb6cd4_720w.png" alt="image.png"  /></p>

主程序提供一些操作原生能力以及内置功能的 `Open API`，插件寄生在 Electron 主程序上通过调用主程序的 `Open API` 来独立实现自己的 UI、业务功能。

接下来，我们将详细介绍 Electron 中如何实现所谓的插件化体系。

## 实现插件加载
插件需要加载，那么一定需要一个容器来支持插件的渲染，目前，Electron 提供了 `<webview>`、`iframe`、`BrowserView` 三种方式来加载第三方资源，接下来我们主要分析这三种方式中哪种最符合我们的需求。

### 1. Electron 的 Webview
和一些原生 APP 类似，Electron 也提供了一个 `Webview` 标签，用于在 Electron 应用程序中嵌入和展示 web 内容的 HTML 标签。它允许开发者将外部的网页或 Web 应用程序嵌入到 Electron 应用的窗口中，从而创建更丰富的用户体验和功能。

```html
<webview id="foo" src="https://juejin.cn"></webview>
```

默认情况下，Electron 是不启用 webview 标签的，需要在创建 `BrowserWindow` 的时候在 `webPreferences` 里面设置 `webviewTag` 为 `true` 才行：

```js
win = new BrowserWindow({
  width: 800,
  height: 600,
  webPreferences: {
    // 开启 webviewTag
    webviewTag: true, 
  },
})
````

<p align=center><img src="https://pic1.zhimg.com/80/v2-65de48046eb4674c019d7a90aa1bd53d_720w.png" alt="image.png"  /></p>

因为要加载三方页面，所以为了确保安全，相对于 BrowserWindow 而言，`webview` 标签具有非常严格的安全性设置，在默认情况下，Electron 是没有为 `webview` 内的页面开启 Node.js 的能力。

如果通过 `webview` 标签实现插件化也是可行的，首先通过 `preload.js` 定义一些全局 open API，然后使用 `webview` 标签加载插件的入口文件：

```html
<!--plugin.vue-->
<webview id="webview" :src="path" :preload="preload"></webview>
<script setup>
const path = `File://${route.query.sourceFile}`
const preload = `File://${path.join(__static, './preload.js')}`
</script>
```

```js
// static/preload.js
window.rubick = { 
  // 所有的 api 实现
}
```

这里，我们通过一个单独的路由页面 `plugin.vue` 来承载插件的加载渲染，通过 `url` 上的 `path` 参数来获取需要加载页面的路径，然后通过 `preload` 参数为页面注入 `openAPI`。这样后续插件页面中就可以通过 `window.rubick.xxx` 使用一些内置的函数功能。

但是，因为`webview` 标签是一个 `HTML` 元素，它的加载和运行必须在渲染进程中，无法脱离渲染进程而单独存在，所以插件的整体运行时机是滞后的。其次，`Webview` 标签也有不少 `bug`，比如：

- [App freeze when iframe is deleted from a webview](https://github.com/electron/electron/issues/17890)

- [Reload nested iframe in webview causes memory leak in electron](https://github.com/electron/electron/issues/18019)

- [\<webview\> not rendering content after reload or redirect](https://github.com/electron/electron/issues/18177)

官方给的解释是：

> Electron的 `webview` 标签基于 [Chromium `webview` ](https://developer.chrome.com/docs/extensions/reference/webviewTag/)，后者正在经历巨大的架构变化。 这将影响 `webview` 的稳定性，包括呈现、导航和事件路由。 我们目前建议不使用 `webview` 标签，并考虑其他替代方案，如 `iframe` ，Electron 的 [BrowserView](https://www.electronjs.org/zh/docs/latest/api/browser-view) 或完全避免嵌入内容的架构。

总而言之，官方还是建议使用 `iframe` 或者 `BrowserView` 来替代 `Webview`。

### 2. Electron 中的 iframe
`iframe` 是每个前端开发人员都熟悉的概念，它并非 Electron 框架特有，而是浏览器 DOM 标准中的一种内嵌标签，也是最基础的内嵌方案之一。如果要使用 `iframe` 加载插件页面，首先需要去掉 `Electron` 中 `index.html` 里面的 `Meta` 标签：

```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Electron</title>
<!--    <meta-->
<!--      http-equiv="Content-Security-Policy"-->
<!--      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"-->
<!--    />-->
  </head>

  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```
这样便允许我们使用 `iframe` 的方式加载三方页面。

```html
<iframe id="foo" src="https://juejin.cn"></iframe>
```

在 Electron 中，与普通浏览器有所不同，`iframe` 不具备自己的 webContents，而是以宿主页面的 contents 下方的一种 `frame` 形式存在。因此，它也无法脱离渲染进程而单独存在。

另外注意的是，`iframe` 内的网页无法直接调用 `node` 的能力，也无法直接加载 `preload.js` 文件，这就不得不需要我们使用 `iframe` 的 `postMessage` 的方式来和渲染进程进行通信达到调用和执行 `openAPI` 的目的，这大大降低了插件的功能天花板。

### 3. Electron 的 BrowserView
前面我们说了，由于 `<webview>` 有一些无法解决和处理的 bug，所以 Electron 绕过了 `<webview>` 构建了一个替代品：`BrowserView`。

>`BrowserView` 被用来让 [`BrowserWindow`](https://www.electronjs.org/zh/docs/latest/api/browser-window) 嵌入更多的 web 内容。 它就像一个子窗口，除了它的位置是相对于父窗口。这意味着可以替代`webview`标签。


那么，`BrowserView` 与 `webview` 有何不同呢？首先，`webview` 是 DOM 层次结构的一部分，而 `BrowserView` 存在于操作系统的窗口层次结构中。这种方式与 Chrome 管理其标签页的方式非常相似，在 BrowserView 中运行的 Web 应用程序的速度也和在 Chrome 中一样快。

<p align=center><img src="https://pic1.zhimg.com/80/v2-99cc8c5a907a8cf9f6363a1a493c6a49_720w.png" alt="image.png"  /></p>

但是，就像 Electron 官网中说的一样，它的位置是相对于父窗口的，所以你必须手动控制 `BrowserView` 的位置：

```js
// main/index.js
import { app, BrowserView, BrowserWindow } from 'electron';

app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 800, height: 600 });
  //创建子窗口
  const view = new BrowserView();
  //自窗口设置嵌入式子窗口
  win.setBrowserView(view);
  // 设置 x，y 坐标，窗口宽度和高度
  view.setBounds({ x: 0, y: 0, width: 300, height: 300 });
  //加载页面
  view.webContents.loadURL('https://juejin.cn');
})
```
综合来看，如果要实现 `Electron` 的插件化功能，那么就需要加载第三方资源，所以我们建议使用 `BrowserView` 来加载外部资源，因为 `BrowserView` 对新版本的 Electron 支持性更好，而且拥有窗口化最大控制权限。



## 基于 BrowserView 实现插件化能力

假定我们有个外部插件资源包，包的结构大致如下：

```bash
plugin
|-- index.html
|-- preload.js
|-- index.js
└── package.json
```
其中，`index.html` 是插件的主入口文件，控制着页面的 `UI` 展示逻辑，`preload.js` 是插件调用 `node` 能力的预加载脚本和自定义的一些插件全局函数，`index.js` 是页面的脚本代码。那么，对于 `BrowserWindow` 而言，只要知道这个插件的路径，就可以通过 `BrowserView` 来动态加载这个插件：

```js
import { BrowserView, BrowserWindow, session } from 'electron';
import path from 'path';
import {
  WINDOW_HEIGHT,
  WINDOW_PLUGIN_HEIGHT,
  WINDOW_WIDTH,
} from '@/common/constans/common';

const createView = (plugin, window) => {
  const {
    // plugin 的 入口 html 路径
    indexPath,
    // plugin 的预加载脚本路径
    preload,
  } = plugin;
  // 构造 browserView 对象
  view = new BrowserView({
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
      // 加载 preload.js
      preload, 
    },
  });
  // 挂载 browserView 到 browserWindow 对象上
  window.setBrowserView(view);
  // browserView 中加载插件入口 html
  view.webContents.loadURL(indexPath);
  // 监听 dom-ready 事件
  view.webContents.once('dom-ready', () => {
    // 设置 browserView 窗口的尺寸和位置
    view.setBounds({
      x: 0,
      y: WINDOW_HEIGHT,
      width: WINDOW_WIDTH,
      height: WINDOW_PLUGIN_HEIGHT - WINDOW_HEIGHT,
    });
  });
}
```
至此，我们便实现了一个主程序窗口挂载插件的功能。详细源码可以见 [rubick runner.ts](https://github.com/rubickCenter/rubick/blob/master/src/main/browsers/runner.ts)。


<p align=center><img src="https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3436f560409e4e55be011d8ec366429a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=800&h=600&s=36188&e=png&b=f7f6f6" alt="image.png"  /></p>

> 一点说明：源码中的 runner.ts 的实现比上面的代码要稍微复杂一点，复杂的地方主要在需要处理 plugin 路径的问题以及处理一些插件加载的生命周期函数。关于路径处理部分，我们将会在[《插件的安装、发布、卸载》](https://juejin.cn/book/7302990019642261567/section/7304842330723319818)中详细介绍。


## 实现 openAPI

前面我们提到了，插件可以通过 `openAPI` 的能力调用主窗口提供的封装好的功能来加强原生能力的支持。就像微信小程序提供的 JS SDK 一样，可以轻松使用小程序提供的原生、扩展能力的支持。

其实要实现这一点，也很简单，就是需要利用 `preload.js` 这一特性，我们可以在主窗口中加载 `preload.js` 这里面包含了我们事先写好的一些通用全局函数，然后就可以在 `BrowserView` 中来调用定义好的全局函数。

比如，我们需要实现一个 `showNotification` 的系统通知功能函数，那么我们可以先实现一个 `openAPI` 的 `preload.js` 文件（[源码](https://github.com/rubickCenter/rubick/blob/master/public/preload.js)）：

```js
// public/preload.js
import { contextBridge } from 'electron'

// 发布消息到主进程
const ipcSend = (type, data) => {
  ipcRenderer.send('msg-trigger', {
    type,
    data,
  });
};

// 定义 rubick 的 openAPI
const rubick = {
  showNotification(body, clickFeatureCode) {
    ipcSend('showNotification', { body, clickFeatureCode });
  },
}
// 在上下文隔离启用的情况下使用预加载
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('rubick', rubick)
  } catch (error) {
    console.error(error)
  }
} else {
  window.rubick = rubick
}
```
接着，主进程的 `mainWindow` 就可以加载这个 `preload.js`：
```js
// main/index.js
const mainWindow = new BrowserWindow({
  // ...
  webPreferences: {
    preload: path.join(__static, 'preload.js'),
    // ...
  }
})
```
因为 `showNotification` 用到了 Electron 主进程中的 [Notification](https://www.electronjs.org/zh/docs/latest/api/notification) 模块，所以，我们通过 `ipcRenderer.send` 的方式和主进程进行通信，来告诉主进程调用 `Notification` 来实现消息通知：

```js
// main/common/api.js
class API extends DBInstance {
  init(mainWindow) {
    // 响应 preload.js 事件
    ipcMain.on('msg-trigger', async (event, arg) => {
      // 执行具体逻辑
      const data = await this[arg.type](arg);
      // 返回数据
      event.returnValue = data;
    });
  }
  
  public showNotification({ data: { body } }) {
    if (!Notification.isSupported()) return false;
    // 调用主进程展示通知窗口
    const notify = new Notification({
      title: plugin.pluginName,
      body,
      icon: plugin.logo,
    });
    notify.show();
    return true;
  }
}
```
到这里，我们通过 `BrowserView` 加载的插件，就可以通过 `window.rubick.showNotification` 的方式来在界面调用出系统通知模块的功能。

> 完整 API 能力的实现源码：https://github.com/rubickCenter/rubick/blob/master/src/main/common/api.ts

## 总结
本小节，我们首先介绍了 `Electron` 实现插件的几种，经过比较，我们选择了 `BrowserView` 的实现。

至此，我们已经完成了一个支持插件化能力的主程序，但是插件总不能都存储在用户本地吧，那么如何将开发好的插件共享给其他人一起使用呢？所以我们接下来要介绍的就是插件的安装、发布和卸载的知识。

