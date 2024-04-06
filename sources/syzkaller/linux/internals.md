---
status: proofread
title: "Linux-specific syzkaller internals"
author: Syzkaller Community
collector: jxlpzqc
collected_date: 20240314
translator: Earlystarry
translated_date: 20240317
proofreader: mudongliang
proofread_date: 20240405
link: https://github.com/google/syzkaller/blob/master/docs/linux/internals.md
---

# Linux 所特有的 syzkaller 内部机制

可以使用 syzkaller 对一些 Linux 内核系统调用接口进行模糊测试：

* 有关网络堆栈的详细信息，请参阅[这里](external_fuzzing_network.md)。
* 有关 USB 堆栈的详细信息，请参阅[这里](external_fuzzing_usb.md)。
