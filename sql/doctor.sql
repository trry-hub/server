-- 语法文档
-- https://help.aliyun.com/zh/sls/query-syntax/?spm=5176.2020520112.console-base_help.dexternal.29123efdcqhfwu 
-- https://help.aliyun.com/zh/sls/query-and-analyze-logs-in-index-mode/?spm=5176.2020520112.console-base_help.dexternal.29123efdcqhfwu 
-- https://help.aliyun.com/zh/sls/spl-overview/?spm=5176.2020520112.console-base_help.dexternal.29123efdcqhfwu 

-- 要查询近两周相同错误数据对比，希望使用折线图，y 轴显示两条线，一条是当前周，一条是上周，x 轴显示错误类型，错误类型按照错误次数降序排列，只显示前 40 条数据
code:* and not code:200 and api:* and not api:events.im.qcloud.com*
| SELECT
  concat(url_decode(msg), ',', code) AS "错误类型",
  sum(case when date_format(date_trunc('week', __time__), '%Y-%m-%d') = date_format(date_trunc('week', now()), '%Y-%m-%d') then 1 else 0 end) AS "本周错误次数",
  sum(case when date_format(date_trunc('week', __time__), '%Y-%m-%d') = date_format(date_trunc('week', now() - interval '7' day), '%Y-%m-%d') then 1 else 0 end) AS "上周错误次数"
GROUP BY "错误类型"
ORDER BY "本周错误次数" DESC
LIMIT 10


-- 排名前 10 的错误消息数量趋势
code:* and not code:200 and api:* and not api:events.im.qcloud.com*
| SELECT
  url_decode(msg) AS "错误消息",  -- 解码后的错误消息
  -- 核心：将秒级时间戳转为"月日"格式（MM-dd，如10-17）
  substr(cast(from_unixtime(cast(begin / 1000 as bigint)) as varchar), 6, 5) AS error_month_day,  -- 截取月日部分
  COUNT(*) AS "错误总次数"  -- 该错误消息在当月当日的总错误数（按月日聚合）
GROUP BY
  "错误消息", error_month_day  -- 按"错误消息+月日"分组（核心：按月日聚合）
ORDER BY
  error_month_day ASC,  -- 按月日升序（如09-30 → 10-01）
  "错误总次数" DESC  -- 同月同日按错误数降序（突出错误多的消息）


-- 错误影响用户占比散点图
code:* and not code:200 and api:* and not api:events.im.qcloud.com*
| SELECT
  url_decode(msg) AS "错误消息",     -- URL解码后的错误消息
  code,                             -- 状态码
  -- 核心：截取"月日"格式（如10-17）
  substr(cast(from_unixtime(cast(begin / 1000 as bigint)) as varchar), 6, 5) AS error_month_day,  -- 截取第6-10位：MM-dd
  COUNT(*) AS "错误总次数",         -- 当月当日该错误的总次数
  COUNT(DISTINCT uid) AS "影响用户数"  -- 当月当日受影响的用户数
GROUP BY
  "错误消息", code, error_month_day  -- 按"错误消息+状态码+月日"分组
ORDER BY
  error_month_day ASC,  -- 按月日升序（如09-30 → 10-01 → 10-02）
  "错误总次数" DESC  -- 同月同日按错误数降序

-- 状态码对应错误占比
code:* and not code:200 and api:* and not api:events.im.qcloud.com*
| SELECT
  url_decode(msg) AS error_msg,     -- URL 解码后的错误消息
  code,                                       -- 状态码
  COUNT(*) AS total_errors,                   -- 错误总次数
  COUNT(DISTINCT uid) AS affected_users       -- 影响用户数
GROUP BY error_msg, code
ORDER BY total_errors DESC
LIMIT 10

-- 查询相关错误信息
code:* and not code:200 and api:* and not api:events.im.qcloud.com*
| SELECT
  url_decode(msg) AS decoded_msg,  -- 解码后的错误消息（与msg一一对应）
  msg,                            -- 原始错误消息
  code,                           -- 状态码（加入分组，确保每个分组的code唯一）
  COUNT(*) AS cnt,                -- 该分组的错误次数
  COUNT(DISTINCT uid) AS uv       -- 该分组的独立用户数
GROUP BY
  msg, decoded_msg, code  -- 补充decoded_msg和code到分组（与SELECT字段对应）
ORDER BY
  cnt DESC