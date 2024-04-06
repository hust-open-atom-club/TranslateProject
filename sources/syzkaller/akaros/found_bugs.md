---
status: proofread
title: "Found bugs"
author: Syzkaller Community
collector: jxlpzqc
collected_date: 20240314
translator: shandianchengzi
translated_date: 20240317
proofreader: mudongliang
proofread_date: 20240406
link: https://github.com/google/syzkaller/blob/master/docs/akaros/found_bugs.md
---

# 已经找到的 BUG

绝大多数的最新 BUG 会被 [syzbot](/sources/syzkaller/syzbot.md) 报告到 [akaros](https://groups.google.com/forum/#!searchin/akaros/syzbot) 邮件列表中，同时会在 [dashboard（仪表盘）](https://syzkaller.appspot.com/akaros)上列出。 

_新的 BUG 会被放在列表前面_

示例如下：

* [管道写入时的页错误](https://github.com/brho/akaros/issues/46)
* [generic_file_write 函数中的 kernel panic](https://github.com/brho/akaros/issues/44)
* [断言错误：page && pm_slot_check_refcnt(*page->pg_tree_slot)](https://github.com/brho/akaros/issues/42)