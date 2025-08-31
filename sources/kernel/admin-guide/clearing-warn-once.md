---
status: translated
title: "Clearing WARN_ONCE"
author: Linux Kernel Community
collector: tttturtle-russ
collected_date: 20240718
translator: yinchunyuan
translated_date: 20250831
link: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/admin-guide/clearing-warn-once.rst
---

# 清除 WARN_ONCE

WARN_ONCE / WARN_ON_ONCE / printk_once 只发送一条信息

echo 1 \> /sys/kernel/debug/clear_warn_once

清除状态并允许警告再次打印。这在测试套件运行后重现问题时可能会有用。
