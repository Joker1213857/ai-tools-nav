# AI工具导航

一个简洁优雅的AI工具导航网站，帮助用户发现和探索最优质的AI工具。

🔗 **在线访问**: [https://ai-tools-nav-pi.vercel.app](https://ai-tools-nav-pi.vercel.app)

## ✨ 功能特点

- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🎨 **现代UI** - 简洁优雅的界面设计
- 🔍 **智能分类** - 按功能分类浏览AI工具
- 📄 **详情页面** - 每个工具都有独立介绍页面
- 🔗 **直达链接** - 一键访问工具官网
- 📊 **SEO优化** - 完善的SEO和社交媒体分享支持

## 🛠️ 收录工具分类

| 分类 | 描述 | 数量 |
|------|------|------|
| 📝 写作助手 | AI写作和文本生成工具 | 5+ |
| 🎨 图像生成 | AI绘画和图像处理工具 | 6+ |
| 🎬 视频创作 | AI视频生成和编辑工具 | 5+ |
| 🎵 音频处理 | AI语音合成和音乐创作 | 5+ |
| 💻 编程开发 | AI编程辅助和代码生成 | 5+ |
| 🤖 聊天机器人 | AI对话和智能助手 | 6+ |
| 📊 效率工具 | AI提升工作效率的工具 | 4+ |

## 🚀 快速开始

### 本地开发

```bash
# 克隆项目
git clone https://github.com/yourusername/ai-tools-nav.git
cd ai-tools-nav

# 启动本地服务器（例如使用Python）
python -m http.server 8000

# 或使用Node.js
npx serve .
```

然后访问 `http://localhost:8000`

### 构建部署

```bash
# 运行构建脚本
npm run build

# 或直接
node build.js
```

## 📁 项目结构

```
ai-tools-nav/
├── index.html          # 首页
├── category/           # 分类页面
│   ├── all.html
│   ├── chat.html
│   ├── image.html
│   └── ...
├── tool/               # 工具详情页
│   ├── chatgpt.html
│   ├── midjourney.html
│   └── ...
├── data/
│   └── tools.js        # 工具数据配置
├── assets/             # 图片资源
├── build.js            # 构建脚本
├── package.json
└── README.md
```

## 📝 添加新工具

编辑 `data/tools.js` 文件，在对应分类数组中添加工具对象：

```javascript
{
  id: "工具ID",
  name: "工具名称",
  description: "工具描述",
  url: "https://工具官网链接",
  icon: "🎨",
  features: ["功能1", "功能2", "功能3"],
  pricing: {
    free: true,      // 是否有免费版
    paid: true       // 是否有付费版
  }
}
```

然后运行 `npm run build` 生成新的页面。

## 🌐 部署

本项目已配置支持以下平台：

- **Vercel** - 推荐，已包含 `vercel.json` 配置
- **GitHub Pages** - 静态网站托管
- **Netlify** - 支持自动部署

## 🔧 技术栈

- **前端**: 原生 HTML5 + CSS3 + JavaScript
- **样式**: CSS Variables + Flexbox/Grid
- **构建**: Node.js 脚本
- **部署**: Vercel

## 📈 数据分析

集成了 Google Analytics 和 Google AdSense，可在 `data/tools.js` 中配置你的追踪ID：

```javascript
const SITE_CONFIG = {
  gaId: "G-XXXXXXXXXX",        // Google Analytics ID
  adsenseId: "ca-pub-XXXXXXXX" // Google AdSense ID
};
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证开源。

## 🙏 致谢

感谢所有收录的AI工具开发者为AI生态做出的贡献！

---

如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！