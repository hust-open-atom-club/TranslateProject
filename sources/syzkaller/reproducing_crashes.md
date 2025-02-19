---
status: translated
title: "How to reproduce crashes"
author: Syzkaller Community
collector: jxlpzqc
translator: CAICAIIs
collected_date: 20240314
translated_date: 20250218
priority: 10
link: https://github.com/google/syzkaller/blob/master/docs/reproducing_crashes.md
---

# 如何复现崩溃

syzkaller 创建复现用例的过程是自动化的，但并非完美无缺，因此 syzkaller 提供了若干用于手动执行和复现程序的工具。

管理器 `workdir/crashes` 目录中创建的崩溃日志包含崩溃前执行的程序。 
在并行执行模式下（管理器配置中的 `procs` 参数值大于 1），导致崩溃的程序不一定会立即触发崩溃；
真正的故障程序可能出现在更早的位置。
有两个工具可以帮助您识别并最小化导致崩溃的程序：`tools/syz-execprog` 和 `tools/syz-prog2c`。


`tools/syz-execprog` 能以多种模式执行单个 syzkaller 程序或程序集
（单次执行或无限循环；线程模式/冲突模式（见下文）；是否收集覆盖率）。 
您可以通过循环执行崩溃日志中的所有程序来确认至少有一个程序确实会导致内核崩溃：
`./syz-execprog -executor=./syz-executor -repeat=0 -procs=16 -cover=0 crash-log`。
然后尝试识别导致崩溃的单个程序，您可以通过以下命令测试程序：
`./syz-execprog -executor=./syz-executor -repeat=0 -procs=16 -cover=0 file-with-a-single-program`。

注意：`syz-execprog` 会在本地执行程序。
因此您需要将 `syz-execprog` 和 `syz-executor` 复制到包含测试内核的虚拟机中运行。


当您获得导致崩溃的单个程序后，请尝试通过以下方式最小化它：
1. 从程序中移除单个系统调用（可以通过在行首添加 `#` 注释单行）
2. 移除不必要的数据（例如将 `&(0x7f0000001000)="73656c6600"` 参数替换为 `&(0x7f0000001000)=nil`）
您还可以尝试将所有 mmap 调用合并为单个映射整个所需区域的 mmap 调用。请继续使用 `syz-execprog` 工具测试最小化结果。

在获得最小化程序后，请使用 `./syz-execprog -threaded=0 -collide=0` 参数确认崩溃是否仍可复现。
若不可复现，则后续需要执行额外步骤。


现在，对程序运行 `syz-prog2c` 工具。该工具将生成可执行的 C 程序。
若使用 `-threaded/collide=0` 参数时崩溃可复现，则此 C 程序也应能引发崩溃。

若使用 `-threaded/collide=0` 参数时崩溃不可复现，则需要执行最后一步操作。
您可以将线程模式理解为每个系统调用都在独立线程中执行。要模拟这种执行模式，请将各个系统调用移至独立线程中。示例可参考：
https://groups.google.com/d/msg/syzkaller/fHZ42YrQM-Y/Z4Xf-BbUDgAJ

该过程在 `syz-repro` 实用程序中已实现部分自动化。
您需要为其提供管理器配置和崩溃报告文件，并可参考[示例配置文件](/pkg/mgrconfig/testdata/qemu.cfg)。
```
./syz-repro -config my.cfg crash-qemu-1-1455745459265726910
```
该工具将尝试定位问题程序并进行最小化。但由于影响复现性的因素众多，其效果并不总是理想。
