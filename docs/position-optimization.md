# 释义窗口视口边界优化方案

## 问题描述

当选中文本靠近屏幕最右侧时，释义窗口（TranslationCard、TranslationButton 或 MeaningPopup）会部分显示到屏幕外部，导致用户无法完整查看内容。

### 影响范围

- **TranslationCard**: 翻译结果卡片（固定宽度 320px）
- **TranslationButton**: 翻译触发按钮
- **MeaningPopup**: 词义释义弹窗（最小宽度 300px，最大宽度 400px）

## 问题分析

### 当前实现逻辑

**位置计算位置**: `apps/extension/src/entrypoints/content/SelectTranslation.tsx:54-58`

```typescript
const position = {
    x: rect.right + window.scrollX,
    y: rect.bottom + window.scrollY + 5,
}
```

**渲染定位**: `apps/extension/src/entrypoints/content/SelectTranslation.tsx:88-116`

```typescript
<div
    className="absolute z-[2147483647] flex"
    style={{
        left: `${translationPosition?.x}px`,
        top: `${translationPosition?.y}px`,
    }}
>
    <TranslationCard />
</div>
```

### 根本原因

1. **直接定位**: UI 元素直接使用选区右下角坐标作为定位点
2. **缺乏边界检测**: 未检查视口边界和元素宽度
3. **固定方向**: 总是从选区右侧展开，没有根据空间情况调整方向
4. **忽略元素尺寸**: 没有考虑 UI 组件自身的宽度和高度

### 视口计算示例

```
视口宽度: 1920px
选区右边界: 1800px
TranslationCard 宽度: 320px
定位 x: 1800px
实际右边界: 1800 + 320 = 2120px > 1920px ❌ 超出视口
```

---

## 优化方案

### 方案一：智能边界检测（推荐 ⭐⭐⭐⭐⭐）

#### 核心思路
在渲染 UI 元素前，计算视口边界，自动调整位置以确保元素完全在视口内。

#### 实现逻辑

1. **获取视口尺寸**
   ```typescript
   const viewportWidth = window.innerWidth
   const viewportHeight = window.innerHeight
   ```

2. **计算元素尺寸**
   ```typescript
   const elementWidth = 320 // TranslationCard 固定宽度
   const elementHeight = elementRef.current?.offsetHeight || 100
   ```

3. **边界检测与位置调整**
   ```typescript
   function calculateSafePosition(
       anchorX: number,
       anchorY: number,
       elementWidth: number,
       elementHeight: number
   ): { x: number; y: number } {
       const viewportWidth = window.innerWidth
       const viewportHeight = window.innerHeight

       // 水平方向调整
       let x = anchorX
       if (x + elementWidth > viewportWidth - 20) { // 20px 边距
           x = anchorX - elementWidth - 10 // 向左展开
       }

       // 垂直方向调整
       let y = anchorY
       if (y + elementHeight > viewportHeight - 20) {
           y = anchorY - elementHeight - 10 // 向上展开
       }

       return { x, y }
   }
   ```

4. **应用位置**
   ```typescript
   const safePosition = calculateSafePosition(
       rect.right + window.scrollX,
       rect.bottom + window.scrollY + 5,
       elementWidth,
       elementHeight
   )
   ```

#### 优点

- ✅ 自动适配所有视口情况
- ✅ 保持良好的用户体验
- ✅ 代码清晰可维护
- ✅ 适用于所有浮动 UI 组件

#### 缺点

- ⚠️ 需要元素尺寸测量（可能需要延迟一帧）
- ⚠️ 需要处理动态高度的情况

#### 适用场景

- 通用方案，适用于所有浮动 UI 组件
- 对用户体验要求较高的场景

---
### 方案二和三被否定

### 方案四：Portal + Popover（React 标准方案）

#### 核心思路
使用 React Portal 和成熟的 Popover 组件库（如 Radix UI），它们内置了定位和边界检测功能。

#### 实现逻辑

1. **使用 Radix UI Popover**
   ```typescript
   import * as Popover from '@radix-ui/react-popover'

   <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
       <Popover.Trigger asChild>
           <div ref={anchorRef} style={{
               position: 'fixed',
               left: translationPosition?.x,
               top: translationPosition?.y,
           }} />
       </Popover.Trigger>
       <Popover.Portal>
           <Popover.Content
               side="right"
               align="start"
               sideOffset={5}
               avoidCollisions={true}  // 自动避免碰撞
               collisionPadding={20}
           >
               <TranslationCard />
           </Popover.Content>
       </Popover.Portal>
   </Popover.Root>
   ```

2. **或使用自定义 Hook + Portal**
   ```typescript
   import { createPortal } from 'react-dom'

   function usePositionedPortal(anchorRect: DOMRect) {
       const [position, setPosition] = useState({ x: 0, y: 0 })

       useEffect(() => {
           const element = document.createElement('div')
           document.body.appendChild(element)

           const rect = element.getBoundingClientRect()
           const safeX = calculateSafeX(anchorRect.right, rect.width)
           const safeY = calculateSafeY(anchorRect.bottom, rect.height)

           setPosition({ x: safeX, y: safeY })

           return () => {
               document.body.removeChild(element)
           }
       }, [anchorRect])

       return { position, render: (children) =>
           createPortal(
               <div style={{ position: 'fixed', left: position.x, top: position.y }}>
                   {children}
               </div>,
               document.body
           )
       }
   }
   ```

#### 优点

- ✅ 使用成熟的、经过测试的组件
- ✅ 内置完整的定位和碰撞检测逻辑
- ✅ 可访问性和键盘导航支持
- ✅ 社区支持和文档完善

#### 缺点

- ⚠️ 引入额外依赖（如果项目未使用 Radix UI）
- ⚠️ 需要调整现有组件结构
- ⚠️ 可能增加打包体积

#### 适用场景

- 已使用或计划使用 Radix UI 的项目
- 对组件质量要求高的项目
- 需要完整可访问性支持的场景

---

## 推荐方案

### 首选推荐：方案一（智能边界检测）

**理由**：

1. **平衡性最佳**：在实现复杂度、维护性和用户体验之间取得最佳平衡
2. **通用性强**：适用于所有浮动 UI 组件，无需引入新依赖
3. **可扩展性**：可以轻松添加动画、过渡效果等增强功能
4. **可控性高**：完全掌握定位逻辑，便于调试和优化

### 备选推荐：方案四（Portal + Popover）

**理由**：

1. **专业级解决方案**：使用行业标准组件，质量有保障
2. **功能完整**：包含可访问性、键盘导航等企业级功能
3. **长期维护**：社区维护，持续更新和 bug 修复
4. **适合复杂场景**：如果项目已使用 Radix UI 或需要高级功能

---

## 实施计划（方案一）

### 阶段一：核心定位逻辑

1. **创建定位工具函数**
   - 位置：`src/utils/position-utils.ts`
   - 功能：边界检测、位置计算、方向判断

2. **修改位置计算**
   - 文件：`apps/extension/src/entrypoints/content/SelectTranslation.tsx`
   - 集成智能边界检测

### 阶段二：元素尺寸测量

1. **实现尺寸获取**
   - 使用 `useRef` + `useEffect` 获取实际尺寸
   - 处理首次渲染和尺寸更新

2. **优化性能**
   - 使用 `requestAnimationFrame` 避免布局抖动
   - 添加防抖处理窗口 resize 事件

### 阶段三：测试与优化

1. **边界测试**
   - 视口边缘场景
   - 小屏幕设备
   - 动态内容高度

2. **性能优化**
   - 减少不必要的重绘
   - 优化事件监听

### 阶段四：通用化

1. **抽取为 Hook**
   - 创建 `usePositionedElement` Hook
   - 支持所有浮动 UI 组件

2. **应用到其他组件**
   - TranslationCard
   - TranslationButton
   - MeaningPopup

---

## 技术细节补充

### 尺寸测量技术

#### 方法 1：useRef + offsetWidth/Height
```typescript
const elementRef = useRef<HTMLDivElement>(null)
const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

useEffect(() => {
    if (elementRef.current) {
        setDimensions({
            width: elementRef.current.offsetWidth,
            height: elementRef.current.offsetHeight,
        })
    }
}, [])
```

#### 方法 2：useMeasure（React-use）
```typescript
import { useMeasure } from 'react-use'

const [ref, { width, height }] = useMeasure()
```

### 性能优化

#### 1. 布局抖动避免
```typescript
function calculatePositionWithRAF(anchorRect: DOMRect) {
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            const elementWidth = elementRef.current?.offsetWidth || 320
            const position = calculateSafePosition(anchorRect, elementWidth)
            resolve(position)
        })
    })
}
```

#### 2. Resize 事件防抖
```typescript
useEffect(() => {
    const handleResize = debounce(() => {
        recalculatePosition()
    }, 100)

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
}, [])
```

### 动画过渡

```typescript
<div
    style={{
        left: `${safePosition.x}px`,
        top: `${safePosition.y}px`,
        transition: 'left 0.2s ease-out, top 0.2s ease-out',
    }}
>
    <TranslationCard />
</div>
```

---


## 参考资料

- [MDN - getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
- [Radix UI Popover](https://www.radix-ui.com/primitives/docs/components/popover)
- [Floating UI](https://floating-ui.com/)
- [React Portals](https://react.dev/reference/react-dom/createPortal)

---

## 总结

释义窗口显示在屏幕外的问题可以通过智能边界检测算法优雅解决。**方案一（智能边界检测）**提供了最佳的平衡性，适合当前项目架构。实施时需要重点关注性能优化和全面测试，确保在各种边界场景下都能提供良好的用户体验。

---

**文档版本**: 1.0
**创建日期**: 2026-01-06
**最后更新**: 2026-01-06
