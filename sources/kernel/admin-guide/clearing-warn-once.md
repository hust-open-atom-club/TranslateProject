---
status: collected
title: "Clearing WARN_ONCE"
author: Linux Kernel Community
collector: tttturtle-russ
collected_date: 20240718
link: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/admin-guide/clearing-warn-once.rst
---

# Clearing WARN_ONCE

WARN_ONCE / WARN_ON_ONCE / printk_once only emit a message once.

echo 1 \> /sys/kernel/debug/clear_warn_once

clears the state and allows the warnings to print once again. This can
be useful after test suite runs to reproduce problems.
