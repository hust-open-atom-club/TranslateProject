---
status: collected
title: "Linux Security Module Development"
author: Linux Kernel Community
collector: tttturtle-russ
collected_date: 20240718
link: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/security/lsm-development.rst
---

# Linux Security Module Development

Based on
<https://lore.kernel.org/r/20071026073721.618b4778@laptopd505.fenrus.org>,
a new LSM is accepted into the kernel when its intent (a description of
what it tries to protect against and in what cases one would expect to
use it) has been appropriately documented in
`Documentation/admin-guide/LSM/`. This allows an LSM\'s code to be
easily compared to its goals, and so that end users and distros can make
a more informed decision about which LSMs suit their requirements.

For extensive documentation on the available LSM hook interfaces, please
see `security/security.c` and associated structures:

::: {.kernel-doc export=""}
security/security.c
:::
