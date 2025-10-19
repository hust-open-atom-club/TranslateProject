---
status: translated
title: "Linux Security Module Development"
author: Linux Kernel Community
collector: tttturtle-russ
collected_date: 20240718
translator: yinchunyuan
translated_date: 20251012
link: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/security/lsm-development.rst
---

# Linux 安全模块开发

基于 <https://lore.kernel.org/r/20071026073721.618b4778@laptopd505.fenrus.org>，
当一个新的 LSM 的用途（即对其试图防范的内容以及人们期望在何种情况下使用它的描述）已在 `Documentation/admin-guide/LSM/` 中
有适当记录时，它就会被接纳到内核中。这使 LSM 的代码可以轻松与其目标进行比较，从而使最终用户和发行版能够更加明智地决定哪些 LSM 符合他们的需求。

对于可用的 LSM 钩子接口的详细文档，请查看 `security/security.c` 以及相关结构：

::: {.kernel-doc export=""}
security/security.c
:::
