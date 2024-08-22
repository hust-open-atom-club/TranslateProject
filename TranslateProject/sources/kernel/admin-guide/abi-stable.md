---
status: published
title: "ABI stable symbols"
author: Linux Kernel Community
collector: tttturtle-russ
collected_date: 20240718
translator: Athanlaich
translated_date: 20240728
proofreader: JasonC10
proofread_date: 20240820
publisher: JasonC10
published_date: 20240822
link: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/admin-guide/abi-stable.rst
---

# ABI 稳定符号

本文档记录了开发者定义为稳定的接口。

用户空间程序可以没有限制地自由使用这些接口，并且这些接口将在未来至少2年内保证向后兼容。

大多数接口（如系统调用）预期将永远不会改变，并始终可用。

