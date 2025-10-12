# SSE Research Report Server

一个用于提供 SSE 流式研究报告数据的 Node.js 服务器。

## 功能特性

- ✅ 支持跨域 (CORS)
- ✅ SSE 流式数据传输
- ✅ 返回组装好的报告数据
- ✅ 与 deerflow 格式保持一致

## 接口说明

### 1. SSE 流式接口

**接口地址:** `GET /api/chat/stream`

**功能:** 以 SSE (Server-Sent Events) 格式流式返回 `public/mock/final-answer.txt` 中的数据

**响应格式:** 
```
event: message_chunk
data: {"thread_id": "...", "agent": "...", ...}

event: tool_calls
data: {"thread_id": "...", ...}
```

### 2. 报告详情接口

**接口地址:** `GET /api/report/detail`

**功能:** 直接返回 `public/mock/report-data.json` 中的完整报告数据

**响应格式:**
```json
{
  "title": "人工智能在医疗诊断中的应用研究",
  "researchProcess": "...",
  "content": "...",
  "subType": "academic",
  "metadata": { ... },
  "references": [ ... ],
  "planData": { ... },
  "reasoningContent": "...",
  "flowData": { ... }
}
```

### 3. 健康检查接口

**接口地址:** `GET /health`

**功能:** 检查服务器运行状态

## 安装和运行

### 安装依赖

```bash
npm install
```

### 启动服务器

```bash
# 生产模式
npm start

# 开发模式 (支持热重载)
npm run dev
```

服务器默认运行在 `http://localhost:8080`

## 项目结构

```
.
├── src/
│   └── index.js          # 主服务器文件
├── public/
│   └── mock/             # Mock 数据目录
│       ├── final-answer.txt      # SSE 流式数据
│       ├── report-data.json      # 报告详情数据
│       ├── first-plan.txt        # 其他 mock 数据
│       ├── re-plan.txt
│       └── reasoning-example.txt
├── package.json
├── .gitignore
└── README.md
```

## 技术栈

- **Node.js** - 运行时环境
- **Express** - Web 框架
- **CORS** - 跨域支持

## 测试接口

### 使用 curl 测试 SSE 流式接口

```bash
curl -N http://localhost:8080/api/chat/stream
```

### 使用 curl 测试报告详情接口

```bash
curl http://localhost:8080/api/report/detail
```

### 使用浏览器测试

**推荐使用测试页面:**
- 测试页面: http://localhost:8080/public/test.html

**直接访问接口:**
- SSE 流: http://localhost:8080/api/chat/stream
- 报告详情: http://localhost:8080/api/report/detail

## 注意事项

1. SSE 流式传输会逐行发送 `public/mock/final-answer.txt` 中的数据
2. 每行数据之间有 10ms 的延迟，模拟真实的流式传输效果
3. 所有接口都支持跨域访问
4. 确保 `public/mock/` 目录下的数据文件存在

## License

MIT

