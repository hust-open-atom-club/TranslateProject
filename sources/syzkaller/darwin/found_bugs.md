---
status: translated
title: "Found bugs"
author: Syzkaller Community
collector: jxlpzqc
collected_date: 20240314
translator: Eliza
translated_date: 20240331
link: https://github.com/google/syzkaller/blob/master/docs/darwin/found_bugs.md
---

# 已经找到的 BUG

[panicall](https://twitter.com/panicaII) 已经将 syzkaller 
([[1]](https://i.blackhat.com/eu-18/Wed-Dec-5/eu-18-Juwei_Lin-Drill-The-Apple-Core.pdf)
([video](https://www.youtube.com/watch?v=zDXyH8HxTwg)),
[[2]](https://conference.hitb.org/hitbsecconf2019ams/materials/D2T2%20-%20PanicXNU%203.0%20-%20Juwei%20Lin%20&%20Junzhi%20Lu.pdf))
移植到 `Darwin/XNU`，并发现了 50 多个漏洞
([50 bugs](https://twitter.com/panicaII/status/1070696972326133760))，包括在
[苹果安全更新](https://support.apple.com/en-us/HT209341) 中提到的 `CVE-2018-4447` 和 `CVE-2018-4435`。 然而，他并没有将他的工作提交到上游。

自 2021 年以来，Syzkaller 已经能够对 macOS 进行模糊测试，但由于许可原因，它尚未集成到 syzbot 中。