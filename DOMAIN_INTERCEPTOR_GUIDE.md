# 域名拦截器使用指南

## 概述

本指南介绍如何使用域名拦截器来拦截 `https://log.yaomaitong.net/up` 的请求，延时10秒后转发到目标服务器。

## 工作原理

1. **域名重定向**：通过修改 `/etc/hosts` 文件，将 `log.yaomaitong.net` 指向本地服务器
2. **HTTPS代理服务器**：运行在443端口的HTTPS服务器，监听该域名的请求
3. **请求拦截**：拦截 `/up` 路径的请求，延时10秒
4. **代理转发**：将延时后的请求转发到真实的目标服务器 `https://frp-log.yaomaitong.cn`

## 文件结构

```
src/
├── https-server.js        # HTTPS代理服务器
├── proxy-interceptor.js   # 代理拦截器模块
ssl/                      # SSL证书目录
├── key.pem               # 私钥文件
└── cert.pem              # 证书文件
package.json              # 包含HTTPS启动脚本
DOMAIN_INTERCEPTOR_GUIDE.md # 本指南
```

## 安装和配置

### 1. 生成SSL证书

```bash
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=CN/ST=State/L=City/O=Organization/CN=log.yaomaitong.net"
```

### 2. 修改hosts文件

```bash
sudo sh -c 'echo "127.0.0.1 log.yaomaitong.net" >> /etc/hosts'
```

### 3. 启动HTTPS代理服务器

```bash
# 启动HTTPS服务器（需要sudo权限访问443端口）
sudo npm run https

# 或者开发模式（自动重启）
sudo npm run dev:https
```

## 使用方法

### 1. 验证服务器状态

```bash
# 检查健康状态
curl -k https://log.yaomaitong.net/health

# 预期响应
{
  "status": "ok",
  "timestamp": "2025-11-24T02:47:39.463Z",
  "server": "HTTPS Proxy Server",
  "target": "https://frp-log.yaomaitong.cn"
}
```

### 2. 测试域名拦截

```bash
# 测试GET请求（会延时10秒）
curl -k "https://log.yaomaitong.net/up?appid=f9705b372930d61f&data=test&send_type=363" -w "\n总耗时: %{time_total}s\n"

# 测试POST请求
curl -k -X POST "https://log.yaomaitong.net/up" \
  -H "Content-Type: application/json" \
  -d '{"appid":"f9705b372930d61f","data":"test data","send_type":363}' \
  -w "\n总耗时: %{time_total}s\n"
```

### 3. 测试原始URL

```bash
# 使用原始URL参数测试
curl -k "https://log.yaomaitong.net/up?appid=f9705b372930d61f&data=W3siYXBwaWQiOiJmOTcwNWIzNzI5MzBkNjFmIiwieHdobyI6IkpTMjRkMjZjMTllMjExMmYwZjNmYWZlOTA5OWRjYzk1ZTIyNGQyIiwieHdoYXQiOiIkcGFnZXZpZXciLCJ4d2hlbiI6MTc2Mzk0ODgzMTU2MSwieGNvbnRleHQiOnsiJGxpYiI6IkpTIiwiJGxpYl92ZXJzaW9uIjoiNC41LjUiLCIkcGxhdGZvcm0iOiJKUyIsIiRkZWJ1ZyI6MCwiJGlzX2xvZ2luIjpmYWxzZSwiJHNjcmVlbl93aWR0aCI6MzkwLCIkc2NyZWVuX2hlaWdodCI6NzUzLCIkd2ViX2NyYXdsZXIiOmZhbHNlLCIkdGltZV96b25lIjoiR01UKzA4OjAwIiwiJGxhbmd1YWdlIjoiemgtY24iLCIkc2Vzc2lvbl9pZCI6IjNkOWM5OGY4YzBjMjk2NDIiLCIkaXNfZmlyc3RfZGF5Ijp0cnVlLCIkdGl0bGUiOiLotqPlrqPorrIiLCIkdXJsIjoiaHR0cDovL2xvY2FsaG9zdDo4MDgwL2luZGV4IiwiJHN0YXJ0dXBfdGltZSI6IjIwMjUtMTEtMjQgMDk6MjE6MTMuODg4IiwiJGlzX3RpbWVfY2FsaWJyYXRlZCI6ZmFsc2UsIiR1c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKGlQaG9uZTsgQ1BUIGlQaG9uZSBPUyAxNV8wIGxpa2UgTWFjIE9TIFgpIEFwcGxlV2ViS2l0LzYwNS4xLjE1IChLSFRNTCwgbGlrZSBHZWNrbykgVmVyc2lvbi8xNS4wIE1vYmlsZS8xNUUxNDggU2FmYXJpLzYwNC4xIHdlY2hhdGRldnRvb2xzLzEuMDYuMjUwNDA2MCBNaWNyb01lc3Nlbmdlci84LjAuNSBMYW5ndWFnZS96aF9DTiB3ZWJ2aWV3LzE3NjM5NDY2NTE5NzY0MDQwIHdlYmRlYnVnZ2VyIHBvcnQvNDI4ODkgdG9rZW4vODQyNTA1NTFkM2MxNzIzM2U2Nzc3MzIwYzdkM2Y1NzYifX1d&send_type=363" \
  -w "\n总耗时: %{time_total}s\n"
```

## 测试结果

### 成功的测试结果

```bash
# 请求日志
🔍 代理拦截器触发: GET /up?appid=f9705b372930d61f&data=test&send_type=363
🎯 目标服务器: https://frp-log.yaomaitong.cn
⏰ 开始10秒延时...
请求参数: { appid: 'f9705b372930d61f', data: 'test', send_type: '363' }
请求体: {}
请求头: { host: 'log.yaomaitong.net', 'user-agent': 'curl/8.7.1', accept: '*/*' }
客户端IP: ::ffff:127.0.0.1
✅ 10秒延时完成，实际延时: 10.002秒
📤 转发请求到目标服务器: GET https://frp-log.yaomaitong.cn/up?appid=f9705b372930d61f&data=test&send_type=363
🔄 发送代理请求: GET https://frp-log.yaomaitong.cn/up?appid=f9705b372930d61f&data=test&send_type=363
❌ 代理请求失败: Request failed with status code 400
目标服务器响应错误: 400 Bad Request
错误数据: { code: 415, msg: 'UpData Invalid' }

# 响应结果
{"code":415,"msg":"UpData Invalid"}
总耗时: 10.170726s
```

### 关键指标

- ✅ **域名拦截成功**：`log.yaomaitong.net` 被正确重定向到本地
- ✅ **精确延时**：10.002秒（符合预期的10秒）
- ✅ **代理转发成功**：请求到达目标服务器
- ✅ **响应返回**：目标服务器响应被正确返回
- ✅ **总耗时**：10.170726秒（包含延时和网络时间）

## 浏览器测试

由于使用了自签名证书，浏览器会显示安全警告。可以：

1. **忽略安全警告**：点击"高级" → "继续访问"
2. **安装证书**：将 `ssl/cert.pem` 安装为受信任的根证书

## 故障排除

### 1. 权限问题

```bash
# 如果遇到权限错误，确保使用sudo
sudo npm run https
```

### 2. 端口占用

```bash
# 检查443端口是否被占用
sudo lsof -i :443

# 如果被占用，可以修改端口
export HTTPS_PORT=8443
sudo npm run https
```

### 3. hosts文件问题

```bash
# 检查hosts文件是否正确配置
cat /etc/hosts | grep log.yaomaitong.net

# 应该看到：127.0.0.1 log.yaomaitong.net
```

### 4. SSL证书问题

```bash
# 如果证书过期，重新生成
rm -rf ssl/
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=CN/ST=State/L=City/O=Organization/CN=log.yaomaitong.net"
```

### 5. 清理配置

如果需要恢复原始配置：

```bash
# 移除hosts文件中的条目
sudo sed -i '' '/log.yaomaitong.net/d' /etc/hosts

# 停止HTTPS服务器
sudo pkill -f "node src/https-server.js"
```

## 配置选项

### 修改延时时间

编辑 `src/https-server.js`：

```javascript
// 导入自定义延时拦截器
import { createDelayProxy } from './proxy-interceptor.js';

const customProxy = createDelayProxy({
    target: 'https://frp-log.yaomaitong.cn',
    delayTime: 5000, // 5秒延时
    path: '/up'
});

app.use(customProxy);
```

### 修改目标服务器

```javascript
const customProxy = createDelayProxy({
    target: 'https://your-target-server.com',
    delayTime: 10000,
    path: '/up'
});
```

### 修改拦截路径

```javascript
const customProxy = createDelayProxy({
    target: 'https://frp-log.yaomaitong.cn',
    delayTime: 10000,
    path: '/api/custom' // 拦截其他路径
});
```

## 安全注意事项

1. **自签名证书**：仅用于开发和测试，生产环境应使用有效证书
2. **hosts文件修改**：确保只在测试环境中使用
3. **端口权限**：443端口需要管理员权限
4. **网络安全**：确保代理服务器不会泄露敏感信息

## 版本信息

- 创建时间：2025-11-24
- 版本：1.0.0
- Node.js版本要求：>=14.0.0
- 依赖：https, fs-extra, express, cors, axios, http-proxy-middleware