<div align="center">

# 📚 Bookmarks Manager

![](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![](https://img.shields.io/badge/Typescript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![](https://badges.aleen42.com/src/vitejs.svg)
![](https://img.shields.io/badge/Chrome-4285F4?style=flat-square&logo=googlechrome&logoColor=white)
![](https://img.shields.io/badge/Firefox-FF7139?style=flat-square&logo=firefox&logoColor=white)

一个功能强大的浏览器书签管理扩展，帮助您高效管理、搜索和整理书签。

</div>

## 目录

- [简介](#intro)
- [功能特性](#features)
- [安装使用](#installation)
    - [Chrome 浏览器](#installation-chrome)
    - [Firefox 浏览器](#installation-firefox)
- [开发指南](#development)
- [项目结构](#structure)
- [贡献指南](#contributing)

## 简介 <a name="intro"></a>

Bookmarks Manager 是一个现代化的浏览器书签管理扩展，提供了直观的界面和强大的功能，帮助用户更好地组织和管理浏览器书签。无论是日常浏览还是研究工作，都能让您的书签管理变得简单高效。

## 功能特性 <a name="features"></a>

### 📖 核心功能
- **智能搜索** - 实时搜索书签标题和 URL
- **批量操作** - 支持批量选择、删除书签
- **拖拽排序** - 通过拖拽轻松调整书签位置和层级
- **文件夹管理** - 一键展开/折叠所有文件夹
- **重复检测** - 自动检测并清理重复的书签
- **数据统计** - 实时显示书签总数、文件夹数量等统计信息
- **导入导出** - 支持 JSON 格式的书签数据导入导出

### 🛠 技术栈
- **框架**: React 18 + TypeScript
- **样式**: Tailwind CSS
- **构建**: Vite + Turborepo
- **拖拽**: @dnd-kit
- **图标**: Lucide React
- **扩展**: Chrome Extensions Manifest V3

## 安装使用 <a name="installation"></a>

### 开发环境准备

1. 克隆仓库
```bash
git clone https://github.com/adonis/bookmarks-manager.git
cd bookmarks-manager
```
2. 安装依赖
```bash
# 安装 pnpm（如果还没有安装）
npm install -g pnpm

# 安装项目依赖
pnpm install
```
3. 启动开发服务器
```bash
# Chrome 开发模式
pnpm dev

# Firefox 开发模式
pnpm dev:firefox
```

### Chrome 浏览器 <a name="installation-chrome"></a>

1. 打开 Chrome 浏览器，访问 `chrome://extensions`
2. 打开右上角的 **开发者模式**
3. 点击 **加载已解压的扩展程序**
4. 选择项目目录下的 `dist` 文件夹
5. 扩展安装成功后，点击扩展图标即可使用

### Firefox 浏览器 <a name="installation-firefox"></a>

1. 打开 Firefox 浏览器，访问 `about:debugging#/runtime/this-firefox`
2. 点击 **临时载入附加组件**
3. 选择项目目录下的 `dist/manifest.json` 文件
4. 扩展安装成功后即可使用

> [!NOTE]
> Firefox 中的临时扩展会在浏览器关闭后失效，需要重新加载

## 开发指南 <a name="development"></a>

### 常用命令

```bash
# 开发
pnpm dev              # Chrome 开发模式
pnpm dev:firefox      # Firefox 开发模式

# 构建
pnpm build            # 构建 Chrome 扩展
pnpm build:firefox    # 构建 Firefox 扩展

# 打包
pnpm zip              # 打包 Chrome 扩展
pnpm zip:firefox      # 打包 Firefox 扩展

# 代码质量
pnpm lint             # 运行 ESLint
pnpm lint:fix         # 自动修复 lint 问题
pnpm format           # 格式化代码
pnpm type-check       # TypeScript 类型检查

# 模块管理
pnpm module-manager   # 管理扩展模块
```

### 添加依赖

```bash
# 根目录依赖
pnpm i <package> -w

# 特定模块依赖
pnpm i <package> -F <module-name>
```

## 项目结构 <a name="structure"></a>

```
bookmarks-manager/
├── chrome-extension/       # 扩展核心配置
│   ├── manifest.ts        # Manifest V3 配置
│   └── src/background/    # 后台脚本
├── pages/                 # 扩展页面
│   ├── options/          # 选项页面（书签管理器主界面）
│   │   └── src/
│   │       └── components/
│   │           ├── BookmarkManager.tsx    # 主管理组件
│   │           ├── BookmarkTree.tsx       # 书签树形结构
│   │           ├── BookmarkFolder.tsx     # 文件夹组件
│   │           ├── BookmarkItem.tsx       # 书签项组件
│   │           ├── BookmarkIcon.tsx       # 图标组件
│   │           └── BatchOperationBar.tsx  # 批量操作栏
│   ├── popup/            # 工具栏弹出页面
│   └── side-panel/       # 侧边栏页面
├── packages/             # 共享包
│   ├── storage/         # Chrome 存储 API 封装
│   ├── ui/             # UI 组件库
│   └── shared/         # 共享工具和类型
└── dist/               # 构建输出目录
```

## 贡献指南 <a name="contributing"></a>

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 致谢
https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite
感谢所有贡献者的支持

---

如有问题或建议，欢迎提交 [Issue](https://github.com/adonis/bookmarks-manager/issues) 或 [Pull Request](https://github.com/adonis/bookmarks-manager/pulls)！
