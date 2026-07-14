<div align="center">

# Knowledge Atlas · 知识星图

**把 Obsidian Vault 变成一座可探索、会运转的知识星系。**

[![Version](https://img.shields.io/badge/version-1.10.0-8b5cf6?style=flat-square)](releases/knowledge-atlas-1.10.0.zip)
[![Obsidian](https://img.shields.io/badge/Obsidian-1.5.0%2B-7c3aed?style=flat-square&logo=obsidian)](https://obsidian.md/)
[![License](https://img.shields.io/badge/license-MIT-22c55e?style=flat-square)](LICENSE)
[![Local only](https://img.shields.io/badge/data-local%20only-06b6d4?style=flat-square)](#隐私)

[English](README.md) · **简体中文**

</div>

Knowledge Atlas 是一款面向 [Obsidian](https://obsidian.md/) 的可视化导航与知识回顾插件。它通过 Obsidian 原生 API 读取 Markdown 笔记，将 Vault 展示为动态星系、层级树以及一组活跃度和知识健康面板。不依赖 Dataview，不生成机械索引笔记，也不需要网络服务。

> **当前状态：** 插件目前采用手动安装，尚未进入 Obsidian Community Plugins 官方目录。

## 功能截图

### 星系总览

![Knowledge Atlas 星系总览，包含 Vault 恒星、目录行星、目录卫星、日历和活跃度面板](docs/images/overview.png)

### 树状视图

![Knowledge Atlas 树状视图，展示 Vault、一级目录和二级目录](docs/images/tree-view.png)

截图中的二级目录和根目录笔记名称已经脱敏。Knowledge Atlas 在实际使用时不会修改任何笔记名称。

## 核心功能

| 模块 | 功能 |
|---|---|
| 星系导航 | Vault 是恒星，一级目录是行星，二级目录是卫星；节点体积会反映其下方的知识数量。 |
| 天体动画 | 流畅公转和自转、速率调节、悬停暂停、透视轨道、球面明暗、大气层、星环和自然日冕。 |
| 根目录彗星 | 每天稳定随机选择一篇根目录 Markdown 笔记作为彗星，不依赖任何固定文件名。 |
| 树状与下钻 | 切换为清晰的层级树，进入目录、查看笔记节点，并展示 Obsidian 解析出的真实双链。 |
| 搜索与最近更新 | 全 Vault 搜索、直接打开笔记，以及浏览最近修改的笔记。 |
| 活跃度洞察 | 53 周热力图、12 个月增长轨迹、星期节奏、本地时钟和带活跃标记的日历。 |
| 知识健康 | 发现孤立笔记、未解析链接和超过指定时间未更新的笔记。 |
| 每日回顾 | 点击热力格查看当天新增笔记；每天稳定随机回顾 3 篇旧笔记。 |
| 自由工作区 | 自由移动和调整画布及面板大小，保存或重置布局，并支持缩放、平移和视图适配。 |
| 国际化 | 在插件设置中选择中文、英文或跟随系统语言。 |

## 星系结构

```text
Vault                         → 恒星
├── 一级目录                  → 行星
│   ├── 二级目录              → 卫星
│   └── 笔记和更深层目录      → 影响天体大小
└── 根目录 Markdown 笔记      → 每日稳定随机彗星
```

为了让大型 Vault 仍然可读，总览默认最多展示到二级目录。进入目录或使用搜索后，可以继续访问更深层目录和具体笔记。

## 安装

### 安装打包版本

1. 下载 [`knowledge-atlas-1.10.0.zip`](releases/knowledge-atlas-1.10.0.zip)。
2. 解压后会得到 `knowledge-atlas` 文件夹。
3. 将该文件夹复制到 Vault：

   ```text
   <你的-vault>/.obsidian/plugins/knowledge-atlas/
   ```

4. 在 Obsidian 中打开 **设置 → 第三方插件**。
5. 如果列表中尚未出现 Knowledge Atlas，点击 **刷新已安装插件**，然后启用 **Knowledge Atlas**。

### 从源码文件安装

创建 `<你的-vault>/.obsidian/plugins/knowledge-atlas/`，然后从仓库根目录复制以下文件：

```text
main.js
manifest.json
styles.css
```

`versions.json`、`README.md` 和 `LICENSE` 用于发布与说明，插件运行时不强制需要。

## 打开与使用

- 点击 Obsidian 左侧 Ribbon 中的 Knowledge Atlas 图标。
- 或在命令面板运行 **Knowledge Atlas: Open Knowledge Atlas**。
- 点击行星或卫星进入对应目录。
- 点击笔记节点、搜索结果、热力图日期、健康检查结果或回顾卡片打开笔记。

### 画布控制

| 操作 | 作用 |
|---|---|
| 鼠标滚轮 | 放大或缩小 |
| 拖动画布空白处 | 平移星图 |
| `−` / `+` | 调节缩放比例 |
| 适配 | 将当前图谱适配到画布 |
| 播放 / 暂停 | 启动或停止天体运动 |
| 速率滑块 | 在 `0.25×` 到 `3×` 之间调节运动速度 |
| 悬停天体 | 暂停整个系统，便于查看节点 |
| 星系 / 树状 | 切换轨道视图与层级视图 |
| 调整布局 | 移动和改变画布及各面板大小 |

## 设置项

- **排除目录**：使用英文逗号分隔，不在星图中出现的 Vault 路径或前缀。
- **目录节点上限**：单个视图最多绘制的目录节点数量。
- **笔记节点上限**：单个视图最多绘制的笔记节点数量。
- **最近笔记数量**：最近更新面板显示的笔记数量。
- **在新标签页打开笔记**：打开笔记时保留知识星图。
- **界面语言**：跟随系统，或固定使用中文、英文。
- **启动时打开知识星图**：Obsidian 工作区加载后自动打开 Atlas。
- **长期未更新阈值**：超过多少天未修改的笔记会被视为长期未更新。

自定义面板位置、大小、层级和转动速率会保存在插件设置中。较窄窗口会自动切换为响应式布局。

## 日期与活跃度数据

Knowledge Atlas 会优先读取笔记 frontmatter 中的 `created`、`created_at` 或 `date-created`。如果这些属性不存在，则使用 Obsidian 提供的文件创建时间，因此用户不需要为旧笔记机械补充 frontmatter。

热力图和增长轨迹遵循常见的时间方向：左侧较旧，右侧最新。

## 性能与无障碍

- 天体位置通过 `requestAnimationFrame` 更新，连接线几何和表面细节采用更轻量的更新节奏。
- 星系运动时会降低高成本模糊和阴影效果，暂停或悬停后恢复完整光效。
- 切换到树状模式会自动暂停轨道动画。
- 系统开启“减少动态效果”后，插件会停止自动动画。
- Manifest 支持桌面端和移动端；自由布局在大屏幕上体验最佳。

## 隐私

Knowledge Atlas 完全在 Obsidian 本地运行。它不会上传 Vault 内容、调用外部 API、生成索引笔记，也不依赖第三方数据库。搜索、双链、活跃度和健康检查均来自本地 Vault 与 Obsidian metadata cache。

## 开发与发布

仓库直接发布编译后的插件文件，目前没有额外构建步骤。

发布 GitHub Release 或提交 Obsidian Community Plugins 前：

1. 更新 `manifest.json` 中的 `version`。
2. 在 `versions.json` 中添加版本映射。
3. 使用 `node --check main.js` 检查 JavaScript 语法。
4. 在 Obsidian 中实际测试，并检查开发者错误。
5. 创建与 Manifest 版本完全一致的 GitHub Release tag。
6. 将 `main.js`、`manifest.json` 和 `styles.css` 添加到 Release 附件。

## 参与贡献

欢迎提交 Issue 和范围清晰的 Pull Request。报告视觉或性能问题时，请提供 Obsidian 版本、操作系统、Vault 大致规模、当前布局模式，以及已经移除私人笔记名称的截图。

## 许可证

[MIT](LICENSE) © 2026 Eason38467
