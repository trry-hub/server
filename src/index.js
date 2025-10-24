import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
// import { arr } from '../public/mock/simple.js'
// import { arr } from '../public/mock/I4ULQL7gGWnAEj_n9QogF.js'
import { arr } from '../public/mock/0bUvp2pD8iATNId3YNgVR.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// 允许跨域
app.use(cors());
app.use(express.json());

// 静态文件服务
app.use('/public', express.static(join(__dirname, '../public')));

// 动态延时配置
const DELAY_CONFIG = {
  // 基础延时配置
  baseDelay: 50,           // 基础延时 (ms)
  minDelay: 10,            // 最小延时 (ms)
  maxDelay: 500,           // 最大延时 (ms)
  
  // 内容类型延时倍数
  contentMultipliers: {
    'message_chunk': 1.0,      // 普通消息块
    'tool_calls': 2.0,         // 工具调用 (需要更多思考时间)
    'tool_call_chunks': 1.5,   // 工具调用块
    'tool_call_result': 3.0,   // 工具调用结果 (需要处理时间)
    'error': 0.5               // 错误信息 (快速显示)
  },
  
  // 内容长度延时调整
  lengthMultipliers: {
    short: 0.8,    // 短内容 (< 50 字符)
    medium: 1.0,   // 中等内容 (50-200 字符)
    long: 1.5     // 长内容 (> 200 字符)
  }
};

// 直接从数组内容流式返回数据给前端
function pasteContent(content) {
  // 直接返回数组内容，用于流式传输
  console.log(`使用内存数组数据进行流式传输，共 ${content.length} 条消息`);
  return content;
}

// 计算动态延时的函数
function calculateDynamicDelay(line, eventType = 'message_chunk', customConfig = null) {
  const config = customConfig || DELAY_CONFIG;
  let delay = config.baseDelay;
  
  // 根据事件类型调整延时
  const eventMultiplier = DELAY_CONFIG.contentMultipliers[eventType] || 1.0;
  delay *= eventMultiplier;
  
  // 根据内容长度调整延时
  const contentLength = line.length;
  let lengthMultiplier = DELAY_CONFIG.lengthMultipliers.medium;
  
  if (contentLength < 50) {
    lengthMultiplier = DELAY_CONFIG.lengthMultipliers.short;
  } else if (contentLength > 200) {
    lengthMultiplier = DELAY_CONFIG.lengthMultipliers.long;
  }
  
  delay *= lengthMultiplier;
  
  // 添加随机变化 (±20%) 使输出更自然
  const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 到 1.2
  delay *= randomFactor;
  
  // 确保在最小和最大延时范围内
  delay = Math.max(config.minDelay, Math.min(config.maxDelay, delay));
  
  return Math.round(delay);
}

// 从行内容中提取事件类型
function extractEventType(line) {
  const eventMatch = line.match(/^event:\s*(\w+)/);
  return eventMatch ? eventMatch[1] : 'message_chunk';
}

// SSE 流式返回接口 - 真正的流式实现
app.post('/api/fast/chat/stream', async (req, res) => {
  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Accel-Buffering', 'no'); // 禁用 Nginx 缓冲

  // 从查询参数获取延时配置
  const customConfig = {
    baseDelay: parseInt(req.query.baseDelay) || DELAY_CONFIG.baseDelay,
    minDelay: parseInt(req.query.minDelay) || DELAY_CONFIG.minDelay,
    maxDelay: parseInt(req.query.maxDelay) || DELAY_CONFIG.maxDelay,
    speed: req.query.speed || 'normal' // fast, normal, slow
  };

  // 根据速度模式调整基础延时
  const speedMultipliers = {
    fast: 0.3,
    normal: 1.0,
    slow: 2.0
  };
  
  const speedMultiplier = speedMultipliers[customConfig.speed] || 1.0;
  customConfig.baseDelay *= speedMultiplier;

  console.log(`SSE 流启动 - 延时配置:`, customConfig);

  // 使用数组数据进行流式传输
  const streamData = pasteContent(arr);
  console.log(`🚀 ~ streamData:`, streamData)
  // 如果需要从文件读取，可以使用以下方式：
  // const finalAnswerPath = join(__dirname, '../public/mock/simple.txt');

  try {
    // 直接从数组遍历并发送
    let messageCount = 0;
    for (const line of streamData) {
      if (line.trim()) {
        // 检查客户端是否断开连接
        if (res.writableEnded) {
          break;
        }

        // 解析SSE消息：提取event和data部分
        // 处理换行符分隔的多行内容
        const lines = line.split('\n').filter(l => l.trim());
        
        let currentEvent = 'message_chunk';
        
        for (let i = 0; i < lines.length; i++) {
          const singleLine = lines[i];
          
          if (singleLine.startsWith('event:')) {
            // 记录event类型
            currentEvent = singleLine.replace('event:', '').trim();
          } else if (singleLine.startsWith('data:')) {
            // 提取并发送data内容
            const dataContent = singleLine.replace('data:', '').trim();
            
            // 输出标准SSE格式
            res.write(`event: ${currentEvent}\n`);
            res.write(`data: ${dataContent}\n\n`);
            
            messageCount++;
            console.log(`发送消息 #${messageCount}: ${currentEvent}`);
            
            // 动态计算延时 (使用自定义配置)
            const delay = calculateDynamicDelay(dataContent, currentEvent, customConfig);
            
            // 应用动态延时
            await new Promise(resolve => setTimeout(resolve, delay));
            
            // 重置为默认event类型
            currentEvent = 'message_chunk';
          }
        }
      }
    }
    
    console.log(`✅ 流式传输完成，共发送 ${messageCount} 条消息`);

    res.end();
  } catch (error) {
    console.error('Error streaming data:', error);
    if (!res.writableEnded) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'Failed to stream data' })}\n\n`);
      res.end();
    }
  }

  // 处理客户端断开连接
  req.on('close', () => {
    console.log('Client disconnected from SSE stream');
  });
});

// 直接返回组装好的数据接口
app.get('/api/config', async (req, res) => {
  try {
    // 读取 report-data.json
    // const reportDataPath = join(__dirname, '../public/mock/report-data.json');
    // const reportData = await fs.readFile(reportDataPath, 'utf-8');
    // const data = JSON.parse(reportData);
    const data = {
      "rag": {
          "provider": null
      },
      "models": {
          "basic": [
              "deepseek-chat"
          ],
          "reasoning": [
              "qwen3-235b-a22b-thinking-2507"
          ]
      }
  }
    
    // 返回 JSON 数据
    res.json(data);
  } catch (error) {
    console.error('Error reading report data:', error);
    res.status(500).json({ error: 'Failed to load report data' });
  }
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`SSE Stream endpoint: http://localhost:${PORT}/api/chat/stream`);
  console.log(`Report Detail endpoint: http://localhost:${PORT}/api/config`);
});

