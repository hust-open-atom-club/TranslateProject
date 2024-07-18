---
status: collected
title: "ABI testing symbols"
author: Linux Kernel Community
collector: tttturtle-russ
collected_date: 20240718
link: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/admin-guide/abi-testing.rst
---

# ABI testing symbols

Documents interfaces that are felt to be stable, as the main development
of this interface has been completed.

The interface can be changed to add new features, but the current
interface will not break by doing this, unless grave errors or security
problems are found in them.

Userspace programs can start to rely on these interfaces, but they must
be aware of changes that can occur before these interfaces move to be
marked stable.

Programs that use these interfaces are strongly encouraged to add their
name to the description of these interfaces, so that the kernel
developers can easily notify them if any changes occur.

::: {.kernel-abi rst=""}
ABI/testing
:::
