# Feature Spec: AI 释义卡片“幽灵模式” (Smart Ghost Mode)

## 1. 背景与目标 (Background & Objective)

* **现状**：目前 AI 释义卡片生成后背景为不透明，虽然内容清晰，但会遮挡卡片下方的原文上下文。
* **痛点**：用户在阅读释义时，常需对照原文。为了看清原文，用户被迫关闭卡片，导致阅读体验中断。
* **目标**：实现一种**智能透明交互**。当用户不需要聚焦卡片时（鼠标移开），卡片自动变淡并模糊背景，露出下方原文；当用户聚焦卡片时（鼠标移入），卡片瞬间恢复清晰。

## 2. 功能需求 (Functional Requirements)

### 2.1 状态定义 (State Definitions)

系统需定义两种视觉状态：

* **活跃态 (Active State)**：
* **触发条件**：鼠标悬停在卡片区域内，或卡片刚刚生成后的“初始保护期”。
* **表现**：背景完全不透明（Solid），文字清晰，阴影明显。用户聚焦于释义内容。


* **闲置态 (Idle State / Ghost Mode)**：
* **触发条件**：鼠标移出卡片区域。
* **表现**：背景半透明（Translucent）+ 毛玻璃效果（Frosted Glass），文字透明度降低。用户聚焦于卡片背后的原文。



### 2.2 交互逻辑 (Interaction Logic)

1. **初始化 (Initialization)**：
* 卡片生成时，默认为 **[活跃态]**。
* 设置 **3秒**（可配置）的“初始保护期”。在此期间，即使鼠标未在卡片上，卡片也不进入闲置态（防止用户刚划词还没来得及移动鼠标，卡片就变透明了）。


2. **移出 (Mouse Leave)**：
* 当鼠标移出卡片区域时，立即（或极短延迟后）切换至 **[闲置态]**。


3. **移入 (Mouse Enter)**：
* 当鼠标再次进入卡片区域时，立即切换回 **[活跃态]**。


4. **点击 (Click)**：
* 维持原有的点击逻辑（如点击关闭按钮或卡片外区域关闭），本功能不影响点击行为。**不**启用点击穿透（Pointer Events 保持默认）。



## 3. 高层技术方案 (High Level Solution)

### 3.1 CSS 架构 (Styling Strategy)

利用 CSS Class 切换来实现状态变更，确保性能和动画流畅度。

* **基准类 (`.ai-card`)**：包含尺寸、定位、过渡动画属性 (`transition: all 0.3s ease`)。
* **闲置类 (`.is-ghost`)**：
* `background-color`: 使用 `rgba(255, 255, 255, 0.2)` 实现高透。
* `backdrop-filter`: 使用 `blur(4px)` 实现毛玻璃，模糊其覆盖的文字，保证视觉层级分离。
* `opacity` (可选): 整体透明度降至 0.6，让卡片上的文字变淡，减少干扰。
* `box-shadow`: 减弱或移除阴影，使其看起来像“贴”在页面上。



### 3.2 JavaScript 逻辑 (Logic Flow)

在组件挂载（Mount）或生成时绑定事件监听器。

```javascript
// 伪代码逻辑示意

const GHOST_CLASS = 'is-ghost';
const cardElement = document.getElementById('ai-card');

// 1. 核心事件监听
cardElement.addEventListener('mouseenter', () => {
  cardElement.classList.remove(GHOST_CLASS);
});

cardElement.addEventListener('mouseleave', () => {
  cardElement.classList.add(GHOST_CLASS);
});

// 2. 初始化保护逻辑
// 卡片生成时确保它是清晰的
cardElement.classList.remove(GHOST_CLASS);

// 可选：如果用户划词后鼠标一直没动，3秒后自动变透明
// 这一步需要判断当前鼠标是否真的在元素上，避免误触
// 简单做法：只依赖用户的第一次主动 mouseleave

```

## 4. UI/UX 细节规范 (Design Specs)

| 属性 | 活跃态 (Active) | 闲置态 (Idle / Ghost) | 说明 |
| --- | --- | --- | --- |
| **背景色** | `#FFFFFF` (不透明) | `rgba(255, 255, 255, 0.4)` | 闲置态需透出背景色 |
| **毛玻璃** | 无 | `backdrop-filter: blur(3px)` | 关键点：让底层文字模糊，避免与卡片文字混淆 |
| **文字透明度** | `1.0` | `0.4` | 卡片变透明时，上面的字也要变淡，否则像浮水印 |
| **阴影** | `0 4px 12px rgba(...)` | `None` 或极淡 | 闲置时减少立体感 |
| **过渡时间** | N/A | `0.3s ease-in-out` | 拒绝突变，要呼吸感 |

---

## 5. 潜在边缘情况 (Edge Cases)

1. **深色模式 (Dark Mode)**：
* 如果原网页是深色背景，白色的半透明背景会显得很突兀（发灰）。
* *Solution*：检测 `prefers-color-scheme` 或背景色，如果是深色模式，闲置态背景应调整为 `rgba(0, 0, 0, 0.4)`。


2. **浏览器兼容性**：
* `backdrop-filter` 在极老版本的浏览器可能不支持。
* *Solution*：作为渐进式增强，不支持时仅回退到 `opacity` 变化，不影响功能使用。



---

### 下一步 (Next Step)

这份 Spec 清晰了吗？如果没问题，**我可以为你生成直接可用的 CSS 和 JavaScript 代码片段**，你只需要粘贴到项目中即可。
