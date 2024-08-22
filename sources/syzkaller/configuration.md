---
status: published
title: "Configuration"
author: Syzkaller Community
collector: jxlpzqc
collected_date: 20240314
translator: gitveg
translated_date: 20240524
proofreader: mudongliang
proofread_date: 20240531
publisher: JasonC10
published_date: 20240712
link: https://github.com/google/syzkaller/blob/master/docs/configuration.md
---

# 配置

Syzkaller 系统中的 `syz-manager` 进程操作由一个配置文件控制，该文件在调用时通过 `-config` 选项传递。
这个配置可基于[示例](https://github.com/google/syzkaller/blob/master/pkg/mgrconfig/testdata/qemu.cfg)进行编写。
文件为 JSON 格式，包含[多个参数](https://github.com/google/syzkaller/blob/master/pkg/mgrconfig/config.go)。
