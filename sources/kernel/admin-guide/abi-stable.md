---
status: translated
title: "ABI stable symbols"
author: Linux Kernel Community
collector: tttturtle-russ
collected_date: 20240718
translator: Athanlaich
translated_date: 20240728
link: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/admin-guide/abi-stable.rst
---

# ABI 稳定符号

记录了开发者定义为稳定的接口。

用户空间程序可以没有限制地自由使用这些接口，并且这些接口将在未来至少2年内保证向后兼容。

大多数接口（如系统调用）预期将永远不会改变，并始终可用。

::: {.kernel-abi rst=""}
ABI/stable
:::
