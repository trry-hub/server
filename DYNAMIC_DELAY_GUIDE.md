# 🚀 动态延时功能使用指南

## 📋 功能概述

为流式输出添加了智能的动态延时功能，可以根据内容类型、长度和用户配置自动调整输出速度，提供更自然的阅读体验。

## ⚙️ 核心特性

### 1. 智能延时算法
- **事件类型识别**：根据 `message_chunk`、`tool_calls`、`tool_call_result` 等事件类型调整延时
- **内容长度适配**：短内容快速显示，长内容适当延时
- **随机变化**：±20% 随机变化使输出更自然
- **边界控制**：确保延时在最小和最大范围内

### 2. 可配置参数
- **基础延时**：所有内容的起始延时时间
- **最小延时**：防止过快，保持可读性
- **最大延时**：防止过慢，保持流畅性
- **速度模式**：快速(0.3x)、正常(1.0x)、慢速(2.0x)

## 🎯 使用方法

### 1. 通过查询参数配置

```bash
# 快速模式
curl -N "http://localhost:8000/api/chat/stream/lmpI42ID_JQ9V5MLppjk1?speed=fast&baseDelay=20"

# 正常模式
curl -N "http://localhost:8000/api/chat/stream/lmpI42ID_JQ9V5MLppjk1?speed=normal&baseDelay=50"

# 慢速模式
curl -N "http://localhost:8000/api/chat/stream/lmpI42ID_JQ9V5MLppjk1?speed=slow&baseDelay=100"
```

### 2. 通过测试页面配置

访问 `http://localhost:8000/public/test.html`，在延时配置区域调整参数：

- **速度模式**：选择快速/正常/慢速
- **基础延时**：设置基础延时时间(ms)
- **最小延时**：设置最小延时时间(ms)
- **最大延时**：设置最大延时时间(ms)

## 📊 延时算法详解

### 事件类型延时倍数
```javascript
contentMultipliers: {
  'message_chunk': 1.0,      // 普通消息块
  'tool_calls': 2.0,       // 工具调用 (需要更多思考时间)
  'tool_call_chunks': 1.5, // 工具调用块
  'tool_call_result': 3.0,  // 工具调用结果 (需要处理时间)
  'error': 0.5             // 错误信息 (快速显示)
}
```

### 内容长度延时调整
```javascript
lengthMultipliers: {
  short: 0.8,    // 短内容 (< 50 字符)
  medium: 1.0,   // 中等内容 (50-200 字符)
  long: 1.5      // 长内容 (> 200 字符)
}
```

### 计算公式
```
最终延时 = 基础延时 × 事件类型倍数 × 内容长度倍数 × 随机因子(0.8-1.2)
```

## 🎨 推荐配置

### 快速预览模式
```bash
speed=fast&baseDelay=30&minDelay=5&maxDelay=200
```
- 适合快速浏览内容
- 基础延时 30ms，实际延时 9-60ms

### 正常阅读模式
```bash
speed=normal&baseDelay=50&minDelay=10&maxDelay=500
```
- 平衡的阅读体验
- 基础延时 50ms，实际延时 10-500ms

### 仔细阅读模式
```bash
speed=slow&baseDelay=100&minDelay=20&maxDelay=1000
```
- 适合仔细阅读和思考
- 基础延时 100ms，实际延时 20-1000ms

## 🔧 技术实现

### 服务器端配置
```javascript
const DELAY_CONFIG = {
  baseDelay: 50,           // 基础延时 (ms)
  minDelay: 10,            // 最小延时 (ms)
  maxDelay: 500,           // 最大延时 (ms)
  
  contentMultipliers: {
    'message_chunk': 1.0,
    'tool_calls': 2.0,
    'tool_call_chunks': 1.5,
    'tool_call_result': 3.0,
    'error': 0.5
  },
  
  lengthMultipliers: {
    short: 0.8,
    medium: 1.0,
    long: 1.5
  }
};
```

### 客户端使用
```javascript
// 获取延时配置
function getDelayConfig() {
  return {
    baseDelay: document.getElementById('baseDelay').value,
    minDelay: document.getElementById('minDelay').value,
    maxDelay: document.getElementById('maxDelay').value,
    speed: document.getElementById('speedMode').value
  };
}

// 构建带参数的URL
const delayConfig = getDelayConfig();
const queryParams = new URLSearchParams(delayConfig);
const streamUrl = `http://localhost:8000/api/chat/stream/lmpI42ID_JQ9V5MLppjk1?${queryParams.toString()}`;
```

## 🎯 使用场景

1. **开发调试**：使用快速模式快速查看输出
2. **演示展示**：使用慢速模式让观众跟上节奏
3. **用户阅读**：使用正常模式提供最佳体验
4. **内容分析**：使用慢速模式仔细分析每个输出块

## 📈 性能优化

- 延时计算在服务器端进行，减少客户端负担
- 支持客户端断开连接检测，避免无效计算
- 随机因子使输出更自然，避免机械感
- 边界控制确保延时在合理范围内

## 🚀 快速开始

1. 启动服务器：`npm start`
2. 访问测试页面：`http://localhost:8000/public/test.html`
3. 调整延时配置参数
4. 点击"开始 SSE 流"测试效果
5. 观察不同配置下的输出速度差异

---

**注意**：动态延时功能完全向后兼容，不传参数时使用默认配置。
