---
status: proofread
title: "What is a good Linux Kernel bug?"
author: Ben Hawkes
collector: tttturtle-russ
collected_date: 20240827
translator: QGrain
translated_date: 20241215
proofreader: QGrain
proofread_date: 20251011
publisher: zqmz
published_date: 20260102
priority: 10
link: https://blog.isosceles.com/what-is-a-good-linux-kernel-bug
---
我在 2006 年发现了我的第一个 Linux 内核漏洞，但它并不是一个特别好的漏洞。当时我只是复制我的同事 Ilja van Sprundel 正在做的一切，这足以找到一些东西。如果你看 Ilja 在 CCC 的视频，[不寻常的漏洞（2006）](https://media.ccc.de/v/23C3-1456-en-unusual_bugs?ref=blog.isosceles.com)，你会明白为什么模仿 Ilja 通常是一件好事。

我发现的 bug 存在于 Debian、SuSE 或 Red Hat 在默认情况下未启用的一个功能中，这几乎就是你需要知道的在 2006 年这个漏洞并不好的地方。如果漏洞不能在任何地方使用，那它有什么好处呢？Linux 内核漏洞都是为了一种黑客行为而服务：使用远程漏洞在面向公众的服务器上以 "nobody"、"sshd" 或其他一些无特权帐户弹出一个 shell，使用内核漏洞获取 root 权限，窃取一些 SSH 凭据，在所有这些机器上利用该内核漏洞，等等。如此优雅的黑客行为！

说到这里，我想指出语言上的一个特殊习惯。在漏洞研究领域，我们喜欢把坏的漏洞称为"好"漏洞，而把无聊或完全灾难性的漏洞称为"坏"漏洞。因此，当我说一个漏洞是"好"的时候，它并不意味着对社会有益 -- 通常恰恰相反。一个好的漏洞具有让攻击者感兴趣的本质属性，比如这个漏洞出现在被广泛使用的代码中，或者它看起来很容易被 [可靠地利用](https://blog.isosceles.com/an-introduction-to-exploit-reliability/)。

在 2006 年，很容易判断任何给定的 Linux 内核漏洞是否"好"。通常，这就像在你的机器上运行漏洞并查看它是否有效一样简单。今天的故事并不那么简单。那么，今天什么是"好"的 Linux 内核漏洞呢？

## 一个简单的绕道
我们很快就会回答这个问题。当我们在这里讨论 Linux 内核安全的话题时，我想我会简要地绕过 BlackHat 的一些与 Linux 相关的报告。我今年去了 BlackHat，但显然我正处于只参加会议而不是参加报告的人生阶段，所以我总是试着回去看看我错过了什么。的确有一些好东西。

- ["坏的 io_uring: 安卓提权的新时代"](https://i.blackhat.com/BH-US-23/Presentations/US-23-Lin-bad_io_uring.pdf?ref=blog.isosceles.com) 来自 Zhenpeng Lin, Xinyu Xing, Zhaofeng Chen, and Kang Li。 新的 io_uring 子系统一直是不断提供的礼物（即大量严重漏洞），但大部分关于 io_uring 漏洞利用的工作都是在服务器系统上进行的。该报告显示，您也可以为安卓的 Linux 内核编写漏洞利用程序，尽管可以本地访问解锁的设备（也称为 "rooting"）。在 S22 上绕过三星 KNOX 保护的额外积分。幸运的是，谷歌最近 [禁用了io_uring功能](https://security.googleblog.com/2023/06/learnings-from-kctf-vrps-42-linux.html?ref=blog.isosceles.com) 在某些关键领域，你不能使用 io_uring bug 来突破安卓应用沙盒。
- ["失控: 用面向页面的编程破坏硬件辅助内核控制流的完整性"](https://i.blackhat.com/BH-US-23/Presentations/US-23-Han-Lost-Control-Breaking-Hardware-Assisted-Kernel.pdf?ref=blog.isosceles.com) 来自 Seunghun Han。即使在最好的情况下，也很难保证控制流的完整性，在内核空间中更是如此。该报告显示，当代码页可以被任意读/写漏洞重新排列时，kCFI（即使在硬件辅助的情况下）也不起作用。就影响而言，这有点理论化，因为他们使用的 kCFI 是 "FineIBT"，我认为它还没有被广泛使用。

无论如何，这种事情正是苹果花了很多时间为 iOS 构建 KTRR/CTRR（不是像这篇文章最初包含的 PPL）的原因，这是我所知道的防止这种事情的最稳健的方法。Windows 当前具有内核数据保护（[KDP](https://www.microsoft.com/en-us/security/blog/2020/07/08/introducing-kernel-data-protection-a-new-platform-security-technology-for-preventing-data-corruption/?ref=blog.isosceles.com)），并且他们似乎是英特尔 [HLAT](https://edc.intel.com/content/www/jp/ja/design/ipla/software-development-platforms/client/platforms/alder-lake-desktop/12th-generation-intel-core-processors-datasheet-volume-1-of-2/001/hypervisor-managed-linear-address-translation/?ref=blog.isosceles.com) 的早期采用者，所以一旦它在更多设备上可用，它们应该就可以工作了，并且是默认启用的。安卓系统的情况更令人担忧，但至少三星的 Knox 正在努力。
- ["让 KSMA 再次伟大: 通过 GPU MMU 功能为安卓设备生根的艺术"](https://i.blackhat.com/BH-US-23/Presentations/US-23-WANG-The-Art-of-Rooting-Android-devices-by-GPU-MMU-features.pdf?ref=blog.isosceles.com) 来自 Yong Wang。深入了解 ARM Mali GPU 的 MMU 内部机理，并详细讨论最新 Mali 驱动程序中许多漏洞中的一个（尽管我找不到该问题的 CVE，但它已被修复 [此处](https://android.googlesource.com/kernel/google-modules/gpu/+/422aa1fad7e63f16000ffb9303e816b54ef3d8ca?ref=blog.isosceles.com)）。他们的观察是，如果存在足够强大的漏洞，您可以使用与内核空间镜像攻击（KSMA）/ret2dir 类似的漏洞利用技术，但使用的是 GPU 的 MMU。从本质上讲，你最终会得到一个 GPU 内存映射，该映射被混叠到 CPU，用于任意物理页面。
- 特别值得一提的是 ["核心升级: 释放跨核心攻击对异构系统的威力"](https://i.blackhat.com/BH-US-23/Presentations/US-23-Wen-Core-Escalation.pdf?ref=blog.isosceles.com) 来自盘古队的 Guanxing Wen。本报告遵循了在现代攻击链中使用协处理器的当前趋势，特别是在华为 Mate40 设备上。我不是 100% 确定最终的效果是什么 —— "屏幕密码绕过"是一个 demo 演示，但凭借他们的访问级别，我认为他们基本上可以在安全世界和正常世界的设备上做任何事情，因为他们可以访问物理内存。无论如何，他们能够从 EL0 实现这一点是件好事（例如，理论上不需要 Linux 内核漏洞利用，尽管目前尚不清楚是什么样的 SELinux 上下文访问了他们目标的字符设备）。

不过总结一下，我认为 BlackHat 审查委员会在选择涉及内核安全中一些重要主题的报告方面做得很好。以下是我的看法：

1. io_uring 的时代可能即将结束，但它最近是一个非常受欢迎的研究领域。这让我想起了围绕无特权用户命名空间的淘金热。基本上，这些复杂的新内核特性总是比我们想象的更容易出错，而且这种模式似乎每隔几年就会重复一次。
2. 在一个越来越难以（也可以说是不必要的）发起基于控制流的攻击（如 ROP）的世界里，纯数据攻击变得越来越普遍。在内核中，实现这一点的明显途径是凭证结构和页表。攻击者（寻找创造性的旁路和新的数据结构作为目标）和防御者（安装越来越复杂的完整性措施）之间出现了一场猫捉老鼠的游戏，并且攻击者目前正在获胜，除了在 iOS 上以外。
3. 协处理器（显示协处理器、DSP、NPU、GPU 等）及其相关驱动程序上存在大量有趣的攻击面，攻击者现在在这些领域找到了一些容易的胜利。它们通常比传统的内核内存损坏问题更容易被利用。在安卓上，GPU 是最重要的攻击面之一 —— 应用程序可以广泛访问 GPU，GPU 驱动程序（主要是 Mali、Adreno 和 PowerVR）存在一系列可被高度利用的问题。可能还会有更多这样的问题出现。

## 无处不在还是无处可去？

那么，让我们以 CVE-2022-20409 为例，这是上面第一个 BlackHat 报告中利用的 io_uring 漏洞。这是一个好 bug 吗？我们知道他们在 安卓（Pixel 6 和 S22）上利用了它，但从解锁设备的本地攻击者的角度来看。我们知道谷歌的 [容器优化操作系统](https://cloud.google.com/container-optimized-os/docs?ref=blog.isosceles.com) 受到影响。但默认情况下，安卓 上的应用程序不会启用它，谷歌也在寻求限制其大多数其他平台上的 io_uring —— 这是否意味着这样的 bug 不再好，即使它很容易被利用？

问题是 Linux 内核绝对无处不在，但与此同时，没有"Linux 内核"这样的东西。每个基于 Linux 的平台都提供了略有不同的版本和配置，这使得计算任何特定内核 CVE 的全局暴露非常具有挑战性。

除此之外，仅仅因为特定内核配置中存在 bug 并不意味着它有用。如果 bug 只能由 root 用户访问，或者 bug 只能由最特权的 SELinux 上下文访问，或者如果 bug 只能从 seccomp-bpf 沙箱外部访问。。。所有这些细节都会对 bug 的"好"的程度产生重大影响。

当然，我们有 CVSSv3 来评估每个 bug 的关键性，但 CVSS 在捕捉 Linux 内核生态系统的这些细微差别方面做得不好。很难捕捉到这样一个事实，即一个 bug 在一种类型的部署中可能非常严重，在另一种部署中可能有点重要，或者根本没什么大不了的 —— 而且这个 bug 可能同时存在。漏洞修复很难。

增加的维度是，没有一种客观的方法来比较不同的平台。一个人可能非常关心该漏洞是否会影响 Amazon Linux 2，但根本不关心它是否会影响 Azure Sphere OS。如果一个 bug 影响到 Galaxy S23 Ultra，另一个人可能会非常关心，但如果它影响到 Debian，那就完全不关心了。

## 主观上好的

因此，考虑到这一主要警告，我可以分享一种评估内核 bug 是否好的方法。有几种方法可以看待这个问题。

大多数花时间思考这类事情的人必然会根据他们负责保护的系统来优先考虑漏洞，并过滤掉所有不相关的东西。这很好，但它并不能告诉你全局上哪些 bug 是好的或不好的，即考虑所有可能受影响的系统。同样，如果你是一名安全研究人员，那么你可能会青睐适合现有专业领域的漏洞，或者你可能会专注于具有最佳漏洞赏金的平台 —— 这两种方法都有自己的偏见。

就我个人而言，由于我没有责任保护一组特定的系统，而且我对漏洞赏金也不太感兴趣，我通常会看看现实世界中最容易被利用的地方，然后对影响这些领域的漏洞进行加权。

显然，这是一门不完美的科学，但经过多年跟踪公众对漏洞利用的研究，研究在野外发现的漏洞利用，与攻击性安全专家交谈，并对任何关于漏洞利用的谣言保持"关注"，你可以对漏洞利用最可能发生的地方有一个大致的了解。

因此，如果你假设一个 bug 是可可靠利用的（如果它不可可靠利用，就很难成为一个好的 bug），那么我们只需要看看这个 bug 是否影响了许多经常被利用的平台。

## 具体如何？

第一个启发式方法是查看 bug 的生存期。如果这个 bug 是最近才引入的，甚至还没有进入稳定的内核版本，那么它就不是一个好 bug。不要误解我的意思 —— 从某种意义上说，这可能是一个很酷的 bug，因为它很有趣且可以被利用，但就像 2006 年一样，如果没有人使用它，这并不重要。另一方面，如果这个 bug 出现在 4.4 之后的每一个长期版本中，那么你看到的是一些有前景的东西。现在很多 bug 都介于两者之间 —— 例如，它们可能会影响过去 18 个月内的所有 5.x/6.x 版本，但不会影响更早的版本。

您需要了解的第二件事是，该 bug 是否存在于内核的无处不在的区域，该区域是否会在任何地方启用。如果该漏洞位于核心区域，例如内存管理子系统的核心（CVE-2016-5195）或 futex 系统调用（CVE-2014-3153），那么几乎可以肯定这将是一个很好的漏洞。

然而，由于多种不同的原因，大多数内核 bug 并不普遍。它们可能位于仅在某些内核配置中启用的功能中，或者位于仅在特定平台上使用的特定分支或自定义补丁集中，或者位于需要特定硬件配置的驱动程序代码中。当然，这些可能是好的 bug，但细节很重要。

具体来说，我的思考过程始于评估该漏洞对安卓生态系统的风险：

1. 该漏洞可以在所有安卓设备上的 Chrome 沙箱中使用吗（即，尽管有 [隔离应用](https://cs.android.com/android/platform/superproject/main/+/main:system/sepolicy/private/isolated_app_all.te?ref=blog.isosceles.com) 和 Chrome 用于安卓的 [seccomp-bpf 政策](https://source.chromium.org/chromium/chromium/src/+/main:sandbox/linux/seccomp-bpf-helpers/baseline_policy_android.cc;l=135;drc=f2732aef3e95dca51f5d70c1242f0c7614a0b9aa;bpv=0;bpt=1?ref=blog.isosceles.com)，它是否仍然可以触发）？
2. 该漏洞可以在所有安卓设备上的普通安卓应用程序中使用吗（即，尽管有 [不可信应用](https://cs.android.com/android/platform/superproject/main/+/main:system/sepolicy/private/untrusted_app_all.te?ref=blog.isosceles.com) 的 SELinux 上下文和安卓用于应用的的默认 [seccomp-bpf 策略](https://cs.android.com/android/platform/superproject/main/+/main:bionic/libc/SECCOMP_BLOCKLIST_APP.TXT?ref=blog.isosceles.com)，它是否仍然可以触发）？
3. 还是该漏洞会影响所有安卓设备的大部分子集（例如 ARM Mali GPU 驱动程序或高通公司的 NPU 驱动程序中的漏洞）？
4. 还是会影响主要的安卓 OEM 供应商（例如所有三星设备或所有小米设备）？
5. 还是会影响重要安卓设备的一小部分（例如，专门影响三星 S22 和 S23 的错误，但不影响任何其他三星设备或任何非三星设备）？

如果这些问题的答案都是"是"，那么这个 bug 很重要。事实上，如果你对第 1 点回答"是"，那么你现在基本上已经拥有了 Linux 内核 bug 的圣杯。从那里开始有一个滑动尺度，现在更常见的是看到第 3、4 和 5 点中描述的 bug 类型。

在这种评估中，我倾向于将安卓生态系统放在首位，因为我们对安卓特权升级漏洞的高需求有很好的认识，特别是在它们可以与基于浏览器的漏洞链接的情况下。我们也很清楚，有稳定的相关问题正在被发现、利用和销售，以满足这一需求。我们对安卓漏洞所能带来的社会影响有一定程度的了解。

然而，如果一个 bug 不影响 安卓，它仍然可能是一个非常好的 bug。事情会变得有点模糊，因为关于现实世界攻击的可靠信息变得更加稀疏，但仍然有很多有趣的东西可以攻击。特别是使用内核漏洞来实现横向移动和供应链攻击的想法现在似乎很流行。

基于此，我尝试大致排序的优先级列表可能会是这样的：

1. 该漏洞是否影响常见的服务器发行版，如 Ubuntu server、Debian 和 CentOS，或以企业为中心的发行版，例如 RHEL 或 Oracle Linux？
2. 该漏洞是管理程序逃逸还是以其他方式跨越虚拟机（VM）信任边界，它是否影响广泛使用的云系统？
3. 这个 bug 会影响 Ubuntu、Fedora 和 Arch 等主要桌面发行版吗？这个 bug 会影响 ChromeOS 吗？
4. 该 bug 是否影响主要的云生产环境（即 VM 主机的 prod 内核上的 LPE，或任何托管服务的托管内核上的 LPCE）？
5. 或者这个 bug 会影响容器优化的主机操作系统，如 Bottlerocket、Azure Linux 和容器优化操作系统吗？
6. 该漏洞是否影响大量物联网设备，特别是那些带有音频/视频传感器的设备？
7. 该漏洞是否影响常见的网络或企业安全设备，如路由器或下一代防火墙？
8. 该漏洞是否影响工业控制系统或其他安全关键系统？

我在这里选择的具体顺序肯定存在争议，但希望总体意图是明确的：我试图根据其对重要系统的影响来评估任何给定的 Linux 内核漏洞有多好，我将"重要"定义为"可能对现实世界的攻击者感兴趣"。

再往下看，特别是在 6/7/8，你开始有许多非内核选项来执行权限升级（比如对以 root 身份运行的脚本进行符号链接攻击），内核的更新往往较少，对权限升级的需求也往往减少（例如，你正在利用的东西已经以 root 身份在运行）。

我甚至还没有包括远程内核 bug（比如过去看到的 SCTP 或 IPv6 中的问题），因为它们非常罕见，很难解释 —— 但如果你在某个地方默认启用了一个 bug，这可能是一个很好的 bug。

## 最后的想法

从攻击者的角度来看，一个好的 bug 是一个高度可利用的 bug，它会影响攻击者真正关心的许多平台。但从防御者的角度来看，很难确定攻击者关心哪些平台。他们的工作就是不告诉你！

这么说，即使你有一组特定的系统需要你负责保护，我建议你深入探讨"这个 bug 会影响我的系统吗"。现实世界的风险更为微妙，试图建立一种攻击者可能在哪里使用内核漏洞（以及为什么）的感觉是准确评估风险的重要组成部分。

我试图分享我对此的看法，最终结果倾向于高度优先考虑安卓和通用服务器发行版。不过，我很想听听任何有不同（或互补）方法的人的意见，因为我们都在用不完美的知识工作。

但有一点是清楚的：找出哪些 bug 是好的需要比以前做更多的工作，我认为安全研究人员通常在这方面处于有利地位。

当我们发现一个新的 bug 时，我们最好做一些初步分析，以确定整个行业的影响，分享我们对这一点的理解将有助于更快地修复 bug。明确该问题是否影响 安卓，是否影响常见的服务器发行版，以及它影响基于 Linux 的设备长尾的可能性有多大，可以产生很大的影响。这意味着要快速分析受影响的功能有多常见，触发 bug 的任何先决条件，以及 bug 存在的时间长度。

请继续关注，在经历了 17 年的"好" Linux 内核 bug 之后，我将在 2040 年更新这篇文章。。。或者，也许是关于我们如何一劳永逸地解决问题的故事！
