# DESIGN.md — OpenHub 设计系统

本文档是一期设计决策的校准源，摘自 `docs/superpowers/specs/2026-07-20-product-positioning-design.md` §4 与 §11。后续所有页面/组件改动以此为准。

## 1. 明度分层 token

层级**只允许用明度差 + 极轻投影**表达。四档，明暗两套同构（spec §11.1）：

| 档位 | 暗色 | 亮色 | 用途 |
|---|---|---|---|
| canvas | `#141414` | `#ffffff` | 主画布 |
| surface | `#1c1c1e` | `#f5f5f6` | 侧栏、卡片、队列行 |
| elevated | `#262628` | `#ececee` | composer、浮起卡片、选中态底 |
| popover | `#2e2e30` + blur | `rgba(255,255,255,0.85)` + blur | 浮层（玻璃仅此处） |

落地 token：`--el-canvas` / `--el-surface` / `--el-elevated` / `--el-popover`，定义于 `ui/src/renderer/styles/themes/default-color-scheme.css`。亮色模式与暗色模式同一套语言，仅取值不同。

## 2. 品牌紫使用规则

**品牌紫只做交互强调**，不做装饰性铺色（spec §4）：

- 允许：主按钮、选中态、待验收角标（badge）、焦点环。
- 禁止：大面积背景、标题文字着色、装饰性渐变。

取值沿 `--primary-6` ramp：亮色 `#5968de`（白字对比度 4.5:1 达标），暗色 `#7c8bea`（提亮版）。实现见 `default-color-scheme.css` 的 `--primary-6` 与 `--primary`。

## 3. 无边框规则 + 圆角 + 焦点环

**无边框规则**（spec §4 / §11.1）：

- 禁止 1px 边框、禁止分割线、禁止渐变底。
- **唯一例外**：浮层（弹窗/下拉/抽屉）允许 8% 透明度边缘定义 + backdrop blur——叠在内容上需要轮廓。主界面不做大面积 blur。
- 图标：扁平 outline 小图标（icon-park），允许克制的彩色点缀（如建议卡的蓝/紫/绿/橙）。

**圆角三档**（spec §4）：控件 8px / 卡片 12px / 容器 16–20px。

**焦点环**（spec §11.2）：键盘 `:focus-visible` 用品牌紫 2px outline（offset 2px），所有可交互元素必须保留——无边框风格下这是唯一的键盘导航信号，不可省略。实现见 `ui/src/renderer/styles/themes/base.css`。

**可访问性底线**：正文对比度 ≥4.5:1；次要文字在其背景档上 ≥3:1；桌面端可点区域 ≥28px。

## 4. 自觉决定记录

**保持系统字体栈**（spec §11.2）：品类惯例如此，自觉偏离"必须自定义字体"的通用规则。理由：系统字体栈在中英混排、等宽数字、渲染性能上零成本达标，且与"桌面工具"品类一致。不引入 WebFont。
