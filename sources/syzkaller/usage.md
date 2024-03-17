---
status: translated
title: "如何使用 syzkaller"
author: Syzkaller Community
collector: chengziqiu
collected_date: 20240314
translator: moyi_hust
translated_date: 20240317
link: https://github.com/google/syzkaller/blob/master/docs/usage.md
---

# 如何使用 syzkaller

## 运行方式

启动 `syz-manager` 命令如下：
```
./bin/syz-manager -config my.cfg
```

`syz-manager` 进程将进入 VMs 并开始在其中进行模糊测试。
`-config`  命令行选项给出了配置文件的位置 [此处](configuration.md)对其进行了描述。
syzkaller发现的崩溃、统计信息和其他信息都暴露在管理器配置中指定的 HTTP 地址上。

## 崩溃

一旦 syzkaller 在某个 VM 中检测到内核崩溃，它将自动开始重现这个崩溃的过程（除非你在配置中指定 `"reproduce": false`）。
默认情况下，它将使用 4 个 VM 来重现崩溃，然后缩小引起崩溃的程序。
这可能会停止模糊测试，因为所有的 VM 可能都在忙于重现检测到的崩溃。

重现一个崩溃的过程可能需要从几分钟到一个小时不等，这取决于崩溃是否容易重现或根本不可重现。
由于这个过程并不完美，有一种尝试手动重现崩溃的方法，如[此处](reproducing_crashes.md)所描述。

如果成功找到复现器，它可以生成两种形式之一：syzkaller 程序或 C 程序。
Syzkaller 总是尝试生成更用户友好的 C 语言复现器，但有时因为各种原因失败（例如轻微不同的时间间隔）。
如果 syzkaller 仅生成 syzkaller 程序，在这种情况下，有[一种方式](reproducing_crashes.md)可以执行这些程序来手动重现和调试崩溃

## Hub

如果你正在运行多个 `syz-manager` 实例，有一种方法可以将它们连接起来并允许交换程序和复现器，详细信息见[这里](hub.md)。

## 报告错误

查看[这里](linux/reporting_kernel_bugs.md)的说明，了解如何报告 Linux 内核错误。
