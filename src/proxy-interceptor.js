import { createProxyMiddleware } from 'http-proxy-middleware';
import axios from 'axios';

/**
 * 代理拦截器模块
 * 用于拦截外部请求并延时后转发到目标服务器
 */

/**
 * 创建延时代理中间件
 * @param {Object} options - 配置选项
 * @param {string} options.target - 目标服务器URL
 * @param {number} options.delayTime - 延时时间（毫秒）
 * @param {string} options.path - 要拦截的路径
 * @param {Function} options.condition - 自定义条件函数
 * @param {boolean} options.logEnabled - 是否启用日志
 * @returns {Function} Express中间件函数
 */
export function createDelayProxy(options = {}) {
  const {
    target = 'https://frp-log.yaomaitong.cn',
    delayTime = 10000,
    path = '/up',
    condition = null,
    logEnabled = true
  } = options;

  return async (req, res, next) => {
    // 检查是否匹配拦截条件
    const pathMatch = req.path === path;
    const conditionMatch = condition ? condition(req) : true;
    
    if (pathMatch && conditionMatch) {
      if (logEnabled) {
        console.log(`🔍 代理拦截器触发: ${req.method} ${req.originalUrl}`);
        console.log(`🎯 目标服务器: ${target}`);
        console.log(`⏰ 开始${delayTime/1000}秒延时...`);
        
        // 记录请求信息
        console.log('请求参数:', req.query);
        console.log('请求体:', req.body);
        console.log('请求头:', req.headers);
        console.log('客户端IP:', req.ip || req.connection.remoteAddress);
      }
      
      // 延时指定时间
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, delayTime));
      const endTime = Date.now();
      
      if (logEnabled) {
        console.log(`✅ ${delayTime/1000}秒延时完成，实际延时: ${(endTime - startTime)/1000}秒`);
        console.log(`📤 转发请求到目标服务器: ${req.method} ${target}${req.originalUrl}`);
      }
      
      try {
        // 构建目标URL
        const targetUrl = `${target}${req.originalUrl}`;
        
        // 准备请求配置
        const config = {
          method: req.method.toLowerCase(),
          url: targetUrl,
          headers: { ...req.headers },
          params: req.query,
          timeout: 30000, // 30秒超时
          maxRedirects: 5
        };
        
        // 移除可能导致问题的headers
        delete config.headers.host;
        delete config.headers['content-length'];
        
        // 如果有请求体，添加到配置中
        if (req.body && Object.keys(req.body).length > 0) {
          config.data = req.body;
        }
        
        if (logEnabled) {
          console.log('🔄 发送代理请求:', config.method.toUpperCase(), config.url);
        }
        
        // 发送代理请求
        const response = await axios(config);
        
        if (logEnabled) {
          console.log(`✅ 代理请求成功: ${response.status} ${response.statusText}`);
          console.log('📥 响应数据:', response.data);
        }
        
        // 返回响应
        res.status(response.status);
        
        // 复制响应头
        Object.keys(response.headers).forEach(key => {
          if (key.toLowerCase() !== 'content-encoding') {
            res.set(key, response.headers[key]);
          }
        });
        
        // 发送响应数据
        res.send(response.data);
        
      } catch (error) {
        console.error('❌ 代理请求失败:', error.message);
        
        if (error.response) {
          console.error('目标服务器响应错误:', error.response.status, error.response.statusText);
          console.error('错误数据:', error.response.data);
          
          res.status(error.response.status);
          res.send(error.response.data);
        } else if (error.request) {
          console.error('网络错误:', error.message);
          res.status(502).json({
            error: 'Bad Gateway',
            message: '无法连接到目标服务器',
            details: error.message
          });
        } else {
          console.error('请求配置错误:', error.message);
          res.status(500).json({
            error: 'Internal Server Error',
            message: '代理服务器内部错误',
            details: error.message
          });
        }
      }
    } else {
      // 不匹配拦截条件，继续执行后续中间件
      next();
    }
  };
}

/**
 * 创建基于http-proxy-middleware的延时代理
 * @param {Object} options - 配置选项
 * @returns {Function} Express中间件函数
 */
export function createProxyMiddlewareWithDelay(options = {}) {
  const {
    target = 'https://frp-log.yaomaitong.cn',
    delayTime = 10000,
    path = '/up',
    logEnabled = true
  } = options;

  // 创建基础代理中间件
  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    logLevel: logEnabled ? 'info' : 'silent',
    onError: (err, req, res) => {
      console.error('代理错误:', err.message);
      res.status(502).json({
        error: 'Bad Gateway',
        message: '代理服务器错误',
        details: err.message
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      if (logEnabled) {
        console.log(`🔄 代理请求: ${req.method} ${target}${req.originalUrl}`);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      if (logEnabled) {
        console.log(`📥 代理响应: ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
      }
    }
  });

  // 返回带延时的中间件
  return async (req, res, next) => {
    if (req.path === path) {
      if (logEnabled) {
        console.log(`🔍 代理中间件拦截: ${req.method} ${req.originalUrl}`);
        console.log(`⏰ 开始${delayTime/1000}秒延时...`);
      }
      
      // 延时
      await new Promise(resolve => setTimeout(resolve, delayTime));
      
      if (logEnabled) {
        console.log(`✅ ${delayTime/1000}秒延时完成，开始代理`);
      }
      
      // 执行代理
      proxy(req, res, next);
    } else {
      next();
    }
  };
}

/**
 * 预定义的10秒延时代理拦截器
 * 拦截 /up 路径并转发到 https://frp-log.yaomaitong.cn
 */
export const tenSecondDelayProxy = createDelayProxy({
  target: 'https://frp-log.yaomaitong.cn',
  delayTime: 10000,
  path: '/up'
});

/**
 * 预定义的代理中间件（基于http-proxy-middleware）
 */
export const tenSecondProxyMiddleware = createProxyMiddlewareWithDelay({
  target: 'https://frp-log.yaomaitong.cn',
  delayTime: 10000,
  path: '/up'
});

export default {
  createDelayProxy,
  createProxyMiddlewareWithDelay,
  tenSecondDelayProxy,
  tenSecondProxyMiddleware
};