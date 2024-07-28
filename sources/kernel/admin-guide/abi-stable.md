---
status: translating
title: "ABI stable symbols"
author: Linux Kernel Community
collector: tttturtle-russ
collected_date: 20240718
translator: Athanlaich
translating_date: 20240728
link: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/admin-guide/abi-stable.rst
---

# ABI stable symbols

Documents the interfaces that the developer has defined to be stable.

Userspace programs are free to use these interfaces with no
restrictions, and backward compatibility for them will be guaranteed for
at least 2 years.

Most interfaces (like syscalls) are expected to never change and always
be available.

::: {.kernel-abi rst=""}
ABI/stable
:::
