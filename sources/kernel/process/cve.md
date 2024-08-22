---
status: published
title: "Linux Kernel CVE Assignment"
author: Linux Kernel Community
collector: mudongliang
collected_date: 20240220
translator: gitveg
translated_date: 20240221
proofreader: mudongliang
proofread_date: 20240221
publisher: gitveg
published_date: 20240221
link: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/process/cve.rst
---

# Linux Kernel CVE Assignment

## CVEs

Common Vulnerabilities and Exposure(CVE®)编号是作为一种明确的方式来识别、定义和登记公开披露的安全漏洞。随着时间的推移，它们在内核项目中的实用性已经下降，CVE编号经常以不适当的方式和不适当的原因分配。因此，内核开发社区倾向于避免使用它们。然而，分配CVE和其他形式的安全标识符的持续压力，以及内核社区之外的个人和公司的持续滥用，已经清楚地表明内核社区应该控制这些CVE分配。

Linux内核开发团队确实有能力为潜在的Linux内核安全问题分配CVE。当然，[CVE的分配](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/process/security-bugs.rst)独立于内核安全漏洞报送过程。

所有分配给Linux内核的CVE列表可以在Linux-cve邮件列表的存档中找到，如https://lore.kernel.org/linux-cve-announce/所示。要获得分配的CVE通知，请“订阅”该邮件列表。要获得分配的CVE通知，请订阅该邮件列表：`<https://subspace.kernel.org/subscribing.html>` 。

## 过程

作为正常稳定发布过程的一部分，可能存在安全问题的内核更改由负责CVE编号分配的开发人员识别，并自动为其分配CVE编号。这些分配作为通告经常发布在linux-cve-announce邮件列表上。

注意，由于Linux内核在系统中的特殊地位，几乎任何漏洞都可能被利用来危害内核的安全性，但是当漏洞被修复后，利用的可能性通常不明显。因此，CVE分配团队过于谨慎，并将CVE编号分配给他们识别的任何漏洞修复。这就解释了为什么Linux内核团队会发布大量的CVE。

如果CVE分配团队错过了任何用户认为应该分配CVE的特定修复，请发送电子邮件到<cve@kernel.org>，那里的团队将与您一起工作。请注意，不应将潜在的安全问题发送到此邮箱，它仅用于为已发布的内核树中的漏洞修复分配CVE。如果你觉得你发现了一个未修复的安全问题，请按照[安全漏洞的报送流程](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/process/security-bugs.rst)发送给Linux内核社区。

Linux内核中未修复的安全问题不会自动分配CVE；只有在安全修复可用并应用于稳定内核树后，CVE分配才会自动发生，并且它将通过安全修复的Git提交编号进行跟踪。如果有人希望在提交安全修复之前分配CVE，请联系内核CVE分配团队，从他们的一批保留编号中获得相应的CVE编号。

对于目前没有得到稳定/LTS内核团队积极支持的内核版本中发现的任何问题，都不会分配CVEs。当前支持的内核分支列表可以在 https://kernel.org/releases.html 上找到。

## 被分配CVE的争论

对于为特定内核更改分配的CVE，其争论或修改的权限仅属于受影响的相关子系统的维护者。这一原则确保了漏洞报告的高度准确性和可问责性。只有那些具有深厚专业知识和对子系统深入了解的个人，才能有效评估报告漏洞的有效性和范围，并确定其适当的CVE指定策略。在此指定权限之外，争论或修改CVE的任何企图都可能导致混乱、不准确的报告，并最终危及系统。

## 无效的CVE

如果发现的安全问题存在于仅由Linux发行版支持的Linux内核中，即安全问题是由于Linux发行版所做的更改导致，或者Linux发行版内核版本不再是Linux内核社区支持的内核版本，那么Linux内核CVE团队将不能分配CVE，必须从Linux发行版本身请求。

任何由内核分配CVE团队以外的任何组针对Linux内核为积极支持的内核版本分配的CVE都不应被视为有效的CVE。请在通知内核CVE分配团队，以便他们可以通过CNA修复过程使这些条目失效。

## 特定CVE的适用性

由于Linux内核可以以许多不同的方式使用，外部用户可以通过许多不同的方式访问它，或者根本没有访问，因此任何特定CVE的适用性取决于Linux用户，而不是CVE分配团队。请不要与我们联系来确定任何特定CVE的适用性。

此外，由于源代码树非常大，而任何一个系统都只使用源代码树的一小部分，因此任何Linux用户都应该意识到，大量分配的CVEs与他们的系统无关。

简而言之，我们不知道您的用例，也不知道您使用的是内核的哪个部分，因此我们无法确定特定的CVE是否与您的系统相关。

与往常一样，最好采取所有发布的内核更改，因为它们是由许多社区成员在一个统一的整体中一起进行测试的，而不是作为个别的精选更改。还要注意，对于许多bug来说，整体问题的解决方案并不是在单个更改中找到的，而是在彼此之上的许多修复的总和。理想情况下，CVEs将被分配给所有问题的所有修复，但有时我们将无法注意到一些修复，因此某些修复可能在没有CVE的情况下被采取。
