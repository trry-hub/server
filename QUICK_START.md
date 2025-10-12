# 🚀 快速启动指南

## 一分钟快速开始

### 1️⃣ 安装依赖
```bash
npm install
```

### 2️⃣ 启动服务器
```bash
npm start
```

### 3️⃣ 打开测试页面
在浏览器中访问: **http://localhost:8080/public/test.html**

---

## 🎯 核心功能

### 📡 SSE 流式接口
**接口地址:** `GET /api/chat/stream`

**功能:** 以 SSE 格式流式返回研究报告数据

**测试方法:**
```bash
curl -N http://localhost:8080/api/chat/stream
```

---

### 📄 报告详情接口
**接口地址:** `GET /api/report/detail`

**功能:** 返回完整的研究报告 JSON 数据

**测试方法:**
```bash
curl http://localhost:8080/api/report/detail
```

---

### ❤️ 健康检查接口
**接口地址:** `GET /health`

**功能:** 检查服务器运行状态

**测试方法:**
```bash
curl http://localhost:8080/health
```

---

## 🌐 在浏览器中使用

### 方式一: 使用测试页面 (推荐)
直接访问: http://localhost:8080/public/test.html

### 方式二: 使用 JavaScript

#### SSE 流式接口
```javascript
const eventSource = new EventSource('http://localhost:8080/api/chat/stream');

eventSource.onmessage = (event) => {
    console.log('收到数据:', event.data);
};
```

#### 报告详情接口
```javascript
fetch('http://localhost:8080/api/report/detail')
    .then(res => res.json())
    .then(data => console.log(data));
```

---

## 📁 项目结构

```
node/
├── src/
│   └── index.js              # 主服务器文件
├── public/
│   ├── test.html             # 测试页面
│   └── mock/                 # Mock 数据
│       ├── final-answer.txt      # SSE 流式数据
│       └── report-data.json      # 报告详情数据
├── examples/
│   └── client-example.html   # 客户端使用示例
├── package.json
├── README.md                 # 完整文档
├── PROJECT_SUMMARY.md        # 项目总结
├── CHECKLIST.md              # 功能清单
└── QUICK_START.md            # 本文件
```

---

## 🔧 配置

### 修改端口
编辑 `src/index.js` 文件:
```javascript
const PORT = process.env.PORT || 8080; // 修改这里
```

或者使用环境变量:
```bash
PORT=3000 npm start
```

### 修改流式延迟
编辑 `src/index.js` 文件中的延迟时间:
```javascript
await new Promise(resolve => setTimeout(resolve, 10)); // 修改这里 (毫秒)
```

---

## 📚 更多文档

- **完整文档:** [README.md](./README.md)
- **项目总结:** [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
- **功能清单:** [CHECKLIST.md](./CHECKLIST.md)
- **使用示例:** [examples/client-example.html](./examples/client-example.html)

---

## ❓ 常见问题

### Q: 端口被占用怎么办?
A: 修改 `src/index.js` 中的 `PORT` 变量,或使用环境变量指定其他端口

### Q: 如何添加新的 mock 数据?
A: 在 `public/mock/` 目录下添加新文件,然后在 `src/index.js` 中添加对应的接口

### Q: 支持哪些浏览器?
A: 支持所有现代浏览器 (Chrome, Firefox, Safari, Edge)

### Q: 可以在生产环境使用吗?
A: 这是一个开发测试服务器,生产环境建议添加更多的安全和性能优化

---

## 🎉 开始使用

现在你已经准备好了!打开浏览器访问测试页面开始体验吧:

👉 **http://localhost:8080/public/test.html**

---

## 📞 需要帮助?

查看完整文档: [README.md](./README.md)

