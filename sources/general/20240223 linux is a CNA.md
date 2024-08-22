---
status: published
title: "Linux is a CNA"
author: Greg Kroah-Hartman
collector: mudongliang
collected_date: 20240223
translator: AAtomical
translated_date: 20240223
proofreader: mudongliang
proofread_date: 20240310
publisher: gitveg
published_date: 20240423
link: http://www.kroah.com/log/blog/2024/02/13/linux-is-a-cna/
---

# Linux Kernel 成为 CVE 编号机构

CVE 组织[最近宣布](https://www.cve.org/Media/News/item/news/2024/02/13/kernel-org-Added-as-CNA)，Linux 内核已然正式成为 CVE 编号机构（CNA）。作为 CNA，Linux 具有在其软件产品中发现的漏洞分配 CVE 编号的权限，并向 CVE 数据库做出贡献。

这是一个趋势，越来越多的开源项目开始成为 CNA，以便自己管理对其项目的 CVE 分配，而不允许其他组织在未经他们参与的情况下分配 CVE。[curl 项目](https://daniel.haxx.se/blog/2024/01/16/curl-is-a-cna/)出于相同的原因也成为了 CNA。我想要指出[Python 项目](https://www.cve.org/Media/News/item/news/2023/08/29/Python-Software-Foundation-Added-as-CNA)在支持这一努力方面所做的出色工作，[OpenSSF 项目](https://openssf.org/)也鼓励并为开源项目提供文档和帮助。我还想感谢 [cve.org](https://www.cve.org/) 组织和董事会，因为他们在申请过程中给予了我们很大的帮助，并使这一切成为可能。

众所周知，我之前曾[经常谈论 CVE](https://kernel-recipes.org/en/2019/talks/cves-are-dead-long-live-the-cve/)，并且，我认为整个系统在许多方面都存在问题，但成为 CNA 这一变化也是我们承担更多责任的一种契机，并希望随着时间的推移系统能够改进。根据世界各地最近颁布的法律法规，所有的开源项目似乎都必须被要求进行这项工作，因此，有了内核的支持将使我们在未来有需要时能够通知各种不同的类似 CNA 的组织。

有关内核将如何运作的更多细节，请参阅此[文档补充](https://lore.kernel.org/lkml/2024021314-unwelcome-shrill-690e@gregkh/)。这一流程可能会与其他CNA 的工作有些不同，但在很大程度上，这是因为内核存在于与大多数其他软件项目不同的层面，而且我们的用户群与几乎所有其他软件项目相比都是最广泛和最多样化的（当然，curl 项目是个例外，该项目[无处不在](https://daniel.haxx.se/blog/2023/11/14/curl-on-100-operating-systems/)！）

您可以在此[邮件列表](https://lore.kernel.org/linux-cve-announce/)上找到我们分配的所有 CVE，并且如果您希望自动收到所有 CVE 的通知，请订阅该列表。可以在[此处](https://git.kernel.org/pub/scm/linux/security/vulns.git/)找到它们的 git 存储库，但请注意，随着时间的推移，存储库的结构会发生变化，因为我们在学习和管理流程方面会变得更加完善，所以暂时不要认为 git 树中的任何内容会固定不变。

一旦流程正常运转并且能够顺利分配 CVE，我会在未来写更多内容。这一公告只是第一步，它使我们成为了 Linux CVE 分配流程的管理者。
