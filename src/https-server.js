import https from 'https';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';
import { tenSecondDelayProxy } from './proxy-interceptor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// 允许跨域
app.use(cors());
app.use(express.json());

// 使用代理拦截器模块 - 拦截 /up 接口并延时10秒后转发到目标服务器
app.use(tenSecondDelayProxy);

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    server: 'HTTPS Proxy Server',
    target: 'https://frp-log.yaomaitong.cn'
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: 'HTTPS Proxy Server is running',
    status: 'ok',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      proxy: '/up (proxied to https://frp-log.yaomaitong.cn)'
    }
  });
});

// HTTPS服务器配置
const httpsOptions = {
  key: fs.readFileSync(join(__dirname, '../ssl/key.pem')),
  cert: fs.readFileSync(join(__dirname, '../ssl/cert.pem'))
};

const HTTPS_PORT = process.env.HTTPS_PORT || 443;

// 启动HTTPS服务器
https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
  console.log(`🔒 HTTPS Proxy Server is running on https://log.yaomaitong.net:${HTTPS_PORT}`);
  console.log(`📊 Health check: https://log.yaomaitong.net:${HTTPS_PORT}/health`);
  console.log(`🎯 Proxy endpoint: https://log.yaomaitong.net:${HTTPS_PORT}/up`);
  console.log(`⏰ All /up requests will be delayed by 10 seconds`);
  console.log(`🌐 Target server: https://frp-log.yaomaitong.cn`);
});

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});