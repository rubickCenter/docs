# 操作指南
`rubick` 核心架构设计图:

![](https://picx.zhimg.com/80/v2-c966ebf0dbcf90bebf9f3f827faa7547_720w.png)
## 主程序介绍（Alt+R 呼起）
`rubick` 是一款插件化的工具箱，可以把 `rubick` 类比成微信；插件就是微信小程序。`rubick` 就是一个运行插件的容器，插件由三方开发者开发维护，不属于 `rubick` 主程序部分。

* 左侧是输入框，输入内容后可以自动匹配对应插件或者系统应用 app，点击图片可以打开功能菜单-插件市场
* 右侧 ... 是菜单项，有2个功能项
  1. 固定/取消固定主窗口
  2. 切换语言

![](https://pic1.zhimg.com/80/v2-359c03a47d128e72a01a51e1d824741e_720w.png)

## 插件市场	
`插件市场` 是用于存放所有插件的一个入口页面，用户可以在插件市场中挑选和安装对应的插件，可以通过点击主程序左侧 `logo` 进入插件市场。

![](https://picx.zhimg.com/80/v2-46ba5fdbd0f8abfc945526548f27399d_720w.png)

寻找自己需要的插件，点击安装的 `icon` 即可下载安装插件。安装完插件后，搜索插件关键词即可使用插件。

![](https://pic1.zhimg.com/80/v2-5906bba20fe0a67f9e7a5a8c11341305_720w.gif)

## 超级面板
在介绍超级面板之前，先来了解一下系统插件的安装方式：系统插件安装方式和普通插件安装方式一样，在插件市场选择 `系统` 分类，寻找适合自己的系统插件安装即可。

::: warning
系统插件安装完成后，需要重启 rubick 后才能生效
:::

超级面板是 `rubick` 的系统插件。安装完成后，重启一下 `rubick` 后，可以通过 `Ctrl + W` 的方式呼起插件：
### 选中文本

<img width=300 src="https://pic1.zhimg.com/80/v2-1fc0edf621598602f14e395d3225b543_720w.png">

### 选中文件


<img width=300 src="https://pica.zhimg.com/80/v2-f74d818ae399db55d18ca8c170019a26_720w.png">

## 多端数据同步
在使用插件的过程中，可能会产生各种各样的数据。这些数据如果需要多个设备间进行同步，则可以使用该功能。

在 `rubick` 内搜索`偏好设置` 进入 `账户和设置` -> `多端数据同步`；即可对 `rubick` 插件使用数据进行 `导出` 和 `导入`。

![](https://pic1.zhimg.com/80/v2-ff85793741e4dff82a729d3eb3d41551_720w.png)


## 内网部署
::: tip
如果把插件发布到公网 `npm` 如果不符合您的公司安全要求，`rubick` 支持内网私有源和私有插件库，如果您需要内网部署使用，可以自行配置以下规则。
:::

`rubick` 依赖 `npm` 仓库做插件管理，依赖 `gitcode` 做插件数据存储，所以如果要进行内网部署，主要需要替换这2个设置。详细设置：
`插件市场 -> 设置 -> 内网部署设置`

![image.png](https://picx.zhimg.com/80/v2-ac74e3391646dd983746e3d4596a7b5e_720w.png)

#### 1. 替换 npm 源
插件发布到私有 `npm` 源即可。

#### 2. 替换 `gitcode` 源为内网 `gitlab`: database url

* clone 下载 rubick 插件库：[https://gitcode.net/rubickcenter/rubick-database](https://gitcode.net/rubickcenter/rubick-database)
* 提交仓库到私有 `gitlab` 库。

替换格式：`https://gitlab.xxx.com/api/v4/projects/{projectId}/repository/files/` 。因为接口为 `gitlab openAPI`，所以需要填写仓库 `access_token`

## 更多功能
如果您还需要更多功能，欢迎来这里给我们提建议：[issues](https://github.com/rubickCenter/rubick/issues) 。
有价值的想法我们会加入到后期的开发当中。同时也欢迎一起加入共建。

