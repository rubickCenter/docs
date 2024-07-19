import { defineConfig } from 'vitepress'

const base = typeof process.env?.GITHUB_SERVER_URL === 'string' ? '/docs/' : '/'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base,
  title: "rubick 文档",
  description: "rubick 官方文档",
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: 'https://picx.zhimg.com/80/v2-96ec85fa4127686cffc525cf3d14d914_720w.png' }],
    ['link', { rel: 'icon', type: 'image/png', href: 'https://picx.zhimg.com/80/v2-96ec85fa4127686cffc525cf3d14d914_720w.png' }],
  ],
  themeConfig: {
    logo: { src: 'https://picx.zhimg.com/80/v2-96ec85fa4127686cffc525cf3d14d914_720w.png', width: 24, height: 24 },

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '官网', link: 'https://rubick.vip' },
      { text: 'rubick 源码教程', link: 'https://juejin.cn/book/7302990019642261567' },
      { text: '使用说明', link: '/guide/index.md' }
    ],

    sidebar: [
      {
        text: '指南',
        items: [
          { text: '介绍', link: '/guide/index.md' },
          { text: '操作指南', link: '/guide/usage.md' },
          { text: '赞助', link: '/sponsor/index.md' },
        ]
      },
      {
        text: '开发者文档',
        items: [
          { text: '插件开发', link: '/dev/index.md' },
          { text: '插件 API', link: '/dev/api.md' },
          { text: '主程序开发', link: '/dev/dev.md' }
        ]
      },
      {
        text: 'rubick 源码介绍篇',
        items: [
          { text: 'rubick 插件化实现原理', link: '/core/index.md' },
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/rubickCenter/rubick' }
    ],

    search: {
      provider: 'local'
    }
  }
})
