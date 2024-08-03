---
status: published
title: "Continuous integration fuzzing"
author: Syzkaller Community
collector: jxlpzqc
collected_date: 20240314
translator: mudongliang
translated_date: 20240727
proofreader: gitveg
proofread_date: 20240731
publisher: gitveg
published_date: 20240731
link: https://github.com/google/syzkaller/blob/master/docs/ci.md
---

# 持续集成模糊测试

[syz-ci](../syz-ci/) 命令为基于 syzakller 的持续模糊测试提供支持。
它运行一些 syzkaller 管理器，并为这些管理器轮询并重建内核镜像，同时轮询并重建 syzkaller 二进制文件。
