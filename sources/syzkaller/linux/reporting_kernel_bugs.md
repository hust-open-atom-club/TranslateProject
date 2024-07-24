---
status: translated
title: "Reporting Linux kernel bugs"
author: Syzkaller Community
collector: jxlpzqc
collected_date: 20240314
translator: Ecila01
translated_date: 20240724
link: https://github.com/google/syzkaller/blob/master/docs/linux/reporting_kernel_bugs.md
---

# 报告 Linux 内核错误

在报告错误之前，请确保没有其他人已经重复报告过它. 最简单的方法是在 [syzkaller 邮件列表](https://groups.google.com/forum/#!forum/syzkaller), [syzkaller-bugs 邮件列表](https://groups.google.com/forum/#!forum/syzkaller-bugs) 和 [syzbot dashboard](https://syzkaller.appspot.com/upstream)中搜索内核堆栈跟踪中存在的关键帧。

请将发现的错误报告给 Linux 内核维护人员。
要找出负责特定内核子系统的维护者列表，请使用 [get_maintainer.pl](https://github.com/torvalds/linux/blob/master/scripts/get_maintainer.pl) 脚本：`./scripts/get_maintainer.pl -f guilty_file.c`。 请将 `syzkaller@googlegroups.com` 添加到抄送列表。
确保在报告中明确指出发生错误的确切内核分支和版本号。
因为许多内核邮件列表不支持 HTML 格式的邮件，所以在发送报告时请使用纯文本模式。

在提交报告前需要字斟句酌。
如今，Linux 维护者被日益增加的bug报告淹没了，因此仅仅增加报告的提交量无助于解决bug本身。
您的报告越详细越具有可操作性，解决它的可能性就越大。
请注意，人们更关心内核崩溃 (例如 use-after-frees 或者 panics) 而非仅仅是 INFO：错误信息或者类似的信息，除非从报告中清楚地指出了到底在哪里出现了什么具体问题。
如果有停顿或挂起异常(stalls 或者 hangs)，只有在它们发生得足够频繁或能够定位错误原因时才报告它们。

总体而言，没有复制器(reproducers)的错误不太可能被分类和修复。
如果 bug 是可复现的，请提交包括复制器（如果可能的话，使用 C 源代码，否则是 syzkaller 程序）和用于内核的`.config`文件。
如果复制器仅以 syzkaller 程序的形式提供，请在您的报告中给出[有关如何执行它们的说明](/docs/executing_syzkaller_programs.md)的链接。
如果手动运行，请检查复制器是否正常工作。
Syzkaller 试图简化复制器，但结果可能并不理想。
您可以尝试手动简化或注释复制器，这极大地帮助内核开发人员找出错误发生的原因。


如果您想进一步做出贡献，您可以尝试了解错误并自己尝试修复程序。 如果您无法找到正确的修复方法，但对错误有一定的了解，请在报告中添加您的想法和结论，这将为内核开发人员节省时间。

## 报告安全漏洞

如果您确信发现的 Bug 会带来潜在的安全威胁，请考虑按照以下说明进行操作。 
请注意，这些说明是基于我正在进行的工作和对当前过程的理解。 现在 [这里](http://seclists.org/oss-sec/2017/q3/242).正在讨论这个说明。

如果您不想陷入这个复杂的披露过程，您可以：

1. 私下将错误报告给 `security@kernel.org`. 在这种情况下，它应该在上游内核中修复，但不能保证修复程序会传播到稳定版或发行版内核。此清单上的最长禁止公开披露期限为7天。
2. 私下向例如 Red Hat (`secalert@redhat.com`) 或者 SUSE (`security@suse.com`) 等供应商报告错误. 他们应该修复错误，分配 CVE，并通知其他供应商。
3. 这些名单上的最长禁运期限 embargo 为5周。
4. 将该错误公开报告给 `oss-security@lists.openwall.com`.

如果您想自己处理披露，请阅读下文。

用于报告和披露 Linux 内核安全问题的三个主要邮件列表是 `security@kernel.org`, `linux-distros@vs.openwall.org` 和 `oss-security@lists.openwall.com`.
这些列表的指南链接如下，在向这些列表发送任何内容之前，请仔细阅读它们。

1. `security@kernel.org` - https://www.kernel.org/doc/html/latest/admin-guide/security-bugs.html
2. `linux-distros@vs.openwall.org` - http://oss-security.openwall.org/wiki/mailing-lists/distros
3. `oss-security@lists.openwall.com` - http://oss-security.openwall.org/wiki/mailing-lists/oss-security

### 报告次要安全漏洞

要报告次要安全漏洞（例如本地 DOS 或本地信息泄漏），您应当：

1. 如上所述，向内核开发人员公开报告错误，并等待提交修复程序。或者，您可以自己开发并发送修复程序。
2. 通过 [Web 表单](https://cveform.mitre.org/)向 MITRE 请求 CVE。. 描述 bug 详细信息，并在请求中添加指向修复的链接 (`patchwork.kernel.org`, `git.kernel.org` 或者 `github.com`).
3. 分配 CVE 后，将 bug 详细信息、CVE 编号和修复链接发送到 `oss-security@lists.openwall.com`.

### 报告主要安全漏洞

要报告主要安全漏洞（例如 LPE、远程 DOS、远程信息泄漏或 RCE），您应当：

1. 理解错误原因，如果可能，请开发带有修复程序的补丁。（可选）开发概念验证漏洞。
2. 通知 `security@kernel.org`：
    * 描述漏洞详细信息，包括建议的补丁和漏洞利用（可选）。
    * 要求 7 天的 embargo 。
    * 与 `security@kernel.org` 的成员一起处理补丁.
3. 通知 `linux-distros@vs.openwall.org`：
    * 描述漏洞详细信息，包括建议的补丁和漏洞利用（可选）。
    * 要求他们分配一个 CVE 编号。
    * 要求 7 天的 embargo 。
4. 等待 7 天，让 linux 发行版应用补丁。
5. 要求 `linux-distros@vs.openwall.org` 公开 CVE 描述并推出更新的内核.
6. 将修复程序发送到上游：
    * 在提交消息中提及 CVE 编号。
    * 在提交消息中提及 syzkaller 。

7. 通知 `oss-security@lists.openwall.com`：
    * 描述漏洞详细信息，包括指向已提交补丁的链接。
8. 等待 1-3 天，让大众更新他们的内核。
9. （可选）在 `oss-security@lists.openwall.com` 上发布漏洞利用的方法。

几点说明：

* 理想情况下，应当同时向 `security@kernel.org` 和 `linux-distros@vs.openwall.org` 报告。
* 在与 `security@kernel.org` 成员和上游维护者一起开发补丁时，请让 linux-distros 了解进度。
* 理想情况下，CVE 描述发布、发行版更新、上游提交和向 `oss-security@lists.openwall.com` 通知应该同时完成。在任何情况下，这些操作都最迟应该在同一天完成。
* T一旦问题被公开（例如，向上游提交补丁、发布 CVE 描述等），必须立即向 `oss-security@lists.openwall.com` 报告。

[点击此处](http://seclists.org/oss-sec/2016/q4/607)查看 LPE 公告的一个示例，但是时间线看起来并不正确。公开公告应该在补丁提交给 netdev `oss-security@lists.openwall.com`后立即发生。
