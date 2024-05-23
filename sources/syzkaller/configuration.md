---
status: translating
title: "Configuration"
author: Syzkaller Community
collector: jxlpzqc
collected_date: 20240314
translator: gitveg
link: https://github.com/google/syzkaller/blob/master/docs/configuration.md
---

# 配置

syzkaller `syz-manager` 进程的操作由一个配置文件控制，该文件在调用时通过 `-config` 选项传递。
这个配置可以基于[示例](https://github.com/google/syzkaller/blob/master/pkg/mgrconfig/testdata/qemu.cfg)；
文件为JSON格式，包含[参数](https://github.com/google/syzkaller/blob/master/pkg/mgrconfig/config.go)。
