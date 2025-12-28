---
status: published
title: "Prometheus metrics"
author: Syzkaller Community
collector: jxlpzqc
translator: CAICAIIs
collected_date: 20240314
translated_date: 20250217
proofreader: yinchunyuan
proofread_date: 20250909
publisher: zqmz
published_date: 20251208
priority: 10
link: https://github.com/google/syzkaller/blob/master/docs/prometheus.md
---

# Prometheus metrics

syz-manager 指标暴露在 http 端点的 URI `/metrics` 路径。
目前从管理器导出的 Prometheus 指标包括 `syz_exec_total`、`syz_corpus_cover` 和 `syz_crash_total`。

可通过以下 Prometheus 客户端配置采集这些指标：
```
scrape_configs:
- job_name: syzkaller
  scrape_interval: 10s
  static_configs:
  - targets:
    - localhost:56741
```

指标值在 syz-manager 重启时会归零，且仅反映当前 syz-manager 进程的运行状态。
