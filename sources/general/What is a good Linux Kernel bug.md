---
status: collected
title: "What is a good Linux Kernel bug?"
author: Ben Hawkes
collector: tttturtle-russ
collected_date: 20240827
priority: 10
link: https://blog.isosceles.com/what-is-a-good-linux-kernel-bug
---
I found my first Linux kernel vulnerability in 2006, but it wasn't a particularly good one. At the time I was just copying everything that my colleague Ilja van Sprundel was doing, and that was good enough to find something. If you watch Ilja's video from CCC, [Unusual Bugs (2006)](https://media.ccc.de/v/23C3-1456-en-unusual_bugs?ref=blog.isosceles.com), you'll understand why copying Ilja was generally a good thing to do.

The bug I found was in a feature that wasn't enabled by default on Debian, SuSE, or Red Hat, and that was pretty much all you needed to know that the bug wasn't good in 2006. What good is a bug if it can't be used anywhere? Linux kernel bugs were for precisely one style of hacking: use a remote exploit to pop a shell as "nobody" or "sshd" or some other unprivileged account on a public facing server, use the kernel exploit to get root, steal some SSH creds, use the kernel exploit on all of those machines, and so on. Such elegant hacking!

I'll stop right there and note a little quirk of language. In the world of vulnerability research, we like to call bugs "good" if they're bad, and "bad" if they're either boring or completely catastrophic. So when I say a bug is "good", it doesn't mean good for society -- usually the opposite. A good bug has properties that are intrinsically interesting for an attacker, like if the bug is in code that's used everywhere, or if it looks like it will be easy to [exploit reliably](https://blog.isosceles.com/an-introduction-to-exploit-reliability/).

In 2006 it was easy to tell if any given Linux kernel exploit was "good". Usually it was as simple as running the exploit on your machine and seeing if it worked. Today the story is not quite as simple. So what is a "good" Linux kernel bug today?

## A Brief Detour
We'll get to that question soon. While we're here on the topic of Linux kernel security, I thought I'd do a brief detour through some of the Linux-related presentations at BlackHat. I went to BlackHat this year, but apparently I'm at the stage of life where I just have meetings instead of attending presentations, so I always try and go back to check out what I've missed. There's some good stuff.

- ["Bad io_uring: A New Era of Rooting for Android"](https://i.blackhat.com/BH-US-23/Presentations/US-23-Lin-bad_io_uring.pdf?ref=blog.isosceles.com) by Zhenpeng Lin, Xinyu Xing, Zhaofeng Chen, and Kang Li. The new io_uring subsystem has been the gift that keeps on giving (i.e. tons of serious vulnerabilities), but most of the work on io_uring exploits has been on server systems. This presentation shows that you can write an exploit for Android's Linux kernel as well, albeit with local access to an unlocked device (aka "rooting"). Bonus points for bypassing Samsung's KNOX protections on the S22. Fortunately Google recently [disabled the io_uring feature](https://security.googleblog.com/2023/06/learnings-from-kctf-vrps-42-linux.html?ref=blog.isosceles.com) in certain key areas, and you can't use io_uring bugs to break out of the Android app sandbox.
- ["Lost Control: Breaking Hardware-Assisted Kernel Control-Flow Integrity with Page-Oriented Programming"](https://i.blackhat.com/BH-US-23/Presentations/US-23-Han-Lost-Control-Breaking-Hardware-Assisted-Kernel.pdf?ref=blog.isosceles.com) by Seunghun Han. Control-flow integrity is hard to get right at the best of times, and even harder still in kernel-space. This presentation shows that kCFI (even when hardware-assisted) doesn't work when code pages can be rearranged with an arbitrary read/write vulnerability. It's a little bit theoretical in terms of impact because the kCFI they use is "FineIBT", which I don't think is widely used yet.

Anyway, this kind of thing is exactly why Apple has spent a lot of time building KTRR/CTRR (ed: not PPL like this post originally included) for iOS, which is the most robust approach to preventing this stuff that I know of. Windows currently has Kernel Data Protection ([KDP](https://www.microsoft.com/en-us/security/blog/2020/07/08/introducing-kernel-data-protection-a-new-platform-security-technology-for-preventing-data-corruption/?ref=blog.isosceles.com)) and they seem to be early adopters of Intel's [HLAT](https://edc.intel.com/content/www/jp/ja/design/ipla/software-development-platforms/client/platforms/alder-lake-desktop/12th-generation-intel-core-processors-datasheet-volume-1-of-2/001/hypervisor-managed-linear-address-translation/?ref=blog.isosceles.com), so they should be OK once that's available on more devices and they enable it by default. The Android situation is a bit more concerning, but at least Samsung's Knox is trying.
- ["Make KSMA Great Again: The Art of Rooting Android Devices by GPU MMU Features"](https://i.blackhat.com/BH-US-23/Presentations/US-23-WANG-The-Art-of-Rooting-Android-devices-by-GPU-MMU-features.pdf?ref=blog.isosceles.com) by Yong Wang. A deep dive into the MMU internals of ARM's Mali GPU, and a detailed discussion of one of the many recent vulnerabilities in the Mali driver (although I can't find the CVE for the issue, it was fixed [here](https://android.googlesource.com/kernel/google-modules/gpu/+/422aa1fad7e63f16000ffb9303e816b54ef3d8ca?ref=blog.isosceles.com)). Their observation is that with a sufficiently powerful vulnerability you can use a similar exploit technique to Kernel Space Mirroring Attacks (KSMA)/ret2dir, but using the GPU's MMU instead. Essentially you end up with a GPU memory mapping that is aliased to the CPU for arbitrary physical pages.
- A special mention goes to ["Core Escalation: Unleashing the Power of Cross-Core Attacks on Heterogeneous System"](https://i.blackhat.com/BH-US-23/Presentations/US-23-Wen-Core-Escalation.pdf?ref=blog.isosceles.com) by Guanxing Wen of the Pangu Team. This presentation follows the current trend of using coprocessors in modern attack chains, specifically on a Huawei Mate40 device. I'm not 100% sure what the final effect was -- "Screen Passcode Bypass" is the demo, but with their level of access I think they could basically do anything on the device in both the secure world and normal world since they have access to physical memory. Regardless, it's nice that they were able to achieve this from EL0 (e.g. theoretically no Linux kernel exploit was needed, although it's not clear what SELinux context has access to the character device they targeted).

To recap though, I think the BlackHat review board did a great job of choosing presentations that touch on some important themes in kernel security right now. Here's my take:

1. The era of io_uring is probably coming to an end, but it's been a very popular area of research recently. It reminds me of the gold rush around unprivileged user namespaces. Basically these complex new kernel features are consistently more bug-prone than we'd like, and this pattern seems to repeat itself every few years.
2. In a world where it's increasingly difficult (and arguably unnecessary) to launch control-flow based attacks (e.g. ROP), data-only attacks are becoming more common. In the kernel, the obvious routes for this are credential structures and page tables. A cat-and-mouse game has emerged between attackers (finding creative bypasses and new data structures to target) and defenders (installing increasingly complex integrity measures) -- and attackers are currently winning, except arguably on iOS.
3. There's a huge amount of interesting attack surface on coprocessors (display coprocessors, DSPs, NPUs, GPUs, etc) and their related drivers, and attackers are finding some easy wins in these areas right now. They're often easier to exploit than a traditional kernel memory corruption issue. On Android, the GPU is one of the most important attack surfaces -- it's widely accessible to apps, and the GPU drivers (mainly Mali, Adreno, and PowerVR) have had a string of highly exploitable issues. There's probably more to come.

## Everywhere or Nowhere?

So let's take CVE-2022-20409, the io_uring bug that was exploited in the first BlackHat presentation above. Is this a good bug? We know that they exploited it on Android (Pixel 6 and S22), but from the perspective of a local attacker with unlocked access to the device. And we know that Google's [Container-Optimized OS](https://cloud.google.com/container-optimized-os/docs?ref=blog.isosceles.com) was affected. But it's not enabled by default for apps on Android, and Google is looking to restrict io_uring across most of its other platforms too -- does that mean a bug like this isn't good anymore, even if it's highly exploitable?

The problem is that the Linux kernel is absolutely everywhere, but at the same time, there is no such thing as "*the* Linux kernel". Each Linux-based platform ships a slightly different version and configuration, and that makes it very challenging to work out the global exposure for any particular kernel CVE.

And beyond that, just because a bug is present in a particular kernel configuration doesn't mean that it's useful. If the bug is only accessible to a root user, or if a bug is only accessible to the most privileged SELinux context, or if a bug is only accessible from outside of a seccomp-bpf sandbox... all of these details can have a significant impact on how "good" a bug is.

Of course we have CVSSv3 to score the criticality of each individual bug, but CVSS doesn't do a great job of capturing these nuances of the Linux kernel ecosystem. It's hard to capture the fact that a bug can be super serious in one type of deployment, somewhat important in another, or no big deal at all -- and that the bug can be all of this at the same time. Vulnerability remediation is hard.

The added dimension is that there isn't an objective way to compare different platforms. One person may care a lot about whether the bug affects Amazon Linux 2, but not care much at all if it affects Azure Sphere OS. Another person may care a lot if a bug affects Galaxy S23 Ultra, but not at all if it affects Debian.

## Subjectively Good

So with that major caveat in mind, I can share an approach for assessing whether a kernel bug is good or not. There's a few ways to look at this.

Most people who spend time thinking about this type of thing will necessarily prioritize bugs based on the systems that they're responsible for securing, and filter out everything else that isn't relevant. That's fine, but it doesn't tell you much about which bugs are good or not *globally*, i.e. considering all potentially affected systems. Similarly, if you're a security researcher then you might favor bugs that fit into an existing area of expertise, or perhaps you'll focus on platforms that have the best bug bounties -- and both of these approaches have their own biases.

Personally, since I don't have the responsibility for securing a specific set of systems, and since I'm not super interested in bug bounties, I usually look at where the most real-world exploitation is occurring and then weight bugs that affect those areas more highly.

Obviously it's an imperfect science, but after many years of tracking public research on exploits, studying exploits that are detected in-the-wild, talking to experts in offensive security, and keeping an "ear to the ground" for any rumors about exploitation, you can build up a general sense for where exploitation is most likely to occur.

So if you assume that a bug is reliably exploitable (it's really hard to be a good bug if it's not reliably exploitable), then we just have to look at whether the bug affects a lot of platforms that are regularly targeted for exploitation.

## How, specifically?

The first heuristic is to look at the lifetime of the bug. If the bug was only introduced recently and hasn't even made it into a stable kernel release, then it's not a good bug. Don't get me wrong -- it might be a cool bug in the sense that it's interesting and exploitable, but just like in 2006, it's not important if nobody uses it. On the other hand, if the bug is in every longterm release since 4.4, then you're looking at something that shows some promise. A lot of bugs these days are somewhere in-between -- for example they might affect all 5.x/6.x releases in the last 18 months, but nothing further back.

The second thing that you need to understand is whether the bug is in a ubiquitous area of the kernel that will be enabled everywhere, or not. If the bug is in a core area, something like the core of the memory management subsystem (CVE-2016-5195) or futex system call (CVE-2014-3153), then it's almost certainly going to be a good bug.

Most kernel bugs are not ubiquitous though, for a number of different reasons. They might be in a feature that is only enabled in certain kernel configurations, or in a specific branch or custom patchset that's only used on certain platforms, or in driver code that requires a specific hardware configuration. Of course these can potentially be good bugs, but the details matter.

Concretely, my thought process starts with assessing the risk of the bug to the Android ecosystem:

1. Can the bug be used from the Chrome sandbox on all Android devices (i.e. is it triggerable despite the [isolated_app](https://cs.android.com/android/platform/superproject/main/+/main:system/sepolicy/private/isolated_app_all.te?ref=blog.isosceles.com) and Chrome's [seccomp-bpf policy](https://source.chromium.org/chromium/chromium/src/+/main:sandbox/linux/seccomp-bpf-helpers/baseline_policy_android.cc;l=135;drc=f2732aef3e95dca51f5d70c1242f0c7614a0b9aa;bpv=0;bpt=1?ref=blog.isosceles.com) for Android)?
2. Can the bug be used from a normal Android application on all Android devices (i.e. is it triggerable despite the [untrusted_app](https://cs.android.com/android/platform/superproject/main/+/main:system/sepolicy/private/untrusted_app_all.te?ref=blog.isosceles.com) SELinux context and Android's default [seccomp-bpf policy](https://cs.android.com/android/platform/superproject/main/+/main:bionic/libc/SECCOMP_BLOCKLIST_APP.TXT?ref=blog.isosceles.com) for apps)?
3. Or does the bug affect a large subset of all Android devices (e.g. a bug in the ARM Mali GPU driver, or Qualcomm's NPU driver)?
4. ... or a major Android OEM vendor (e.g. all Samsung devices, or all Xiaomi devices)?
5. ... or a small subset of important Android devices (e.g. a bug that specifically affects Samsung S22 and S23, but not any other Samsung devices or any non-Samsung devices)?

If the answer is "yes" to any of these questions, then the bug is important. In fact if you answer "yes" to point 1, you basically have the holy grail of Linux kernel bugs right now. There's a sliding scale from there, and these days it's more common to see the types of bugs described in points 3, 4, and 5.

I tend to put the Android ecosystem first in this kind of assessment because we have a pretty good sense for the high level of demand for Android privilege escalation exploits, particularly where they can be chained with a browser-based exploit. We also have a good sense that there is a steady supply of relevant issues being discovered, exploited, and sold to fulfill this demand. And we have some degree of insight into the societal impact that Android exploits can achieve.

If a bug doesn't affect Android however, it can still be a very good bug. Things get a bit murkier the further down the priority list you go, because reliable information on real-world attacks becomes more sparse, but there's still plenty of interesting stuff to attack out there. Particularly the idea of using kernel exploits to enable lateral movement and supply-chain attacks seems popular right now.

Based on that, my attempt at a roughly ordered priority list would probably go something like this:

1. Does the bug affect common server distributions like Ubuntu Server, Debian, and CentOS, or enterprise-focused distributions like RHEL or Oracle Linux?
2. Is the bug a hypervisor escape or does it otherwise cross virtual machine (VM) trust boundaries, and does it affect cloud systems that are in widespread usage?
3. Does the bug affect major desktop distributions like Ubuntu, Fedora, and Arch? Or does the bug affect ChromeOS?
4. Does the bug affect major cloud production environments (i.e. LPE on the prod kernel for the VM host, or the managed kernel for any hosted services)?
5. Or does the bug affect container-optimized host OS like Bottlerocket, Azure Linux, and Container Optimized OS?
6. Does the bug affect a significant number of IoT devices, particularly those with sensors for audio/video?
7. Does the bug affect common networking or enterprise security equipment like routers or next-gen firewalls?
8. Does the bug affect industrial control systems or other safety-critical systems?

The specific ordering I've chosen here is definitely up for debate, but hopefully the general intent is clear: I try to assess how good any given Linux kernel vulnerability is based on its reach against important systems, and I define "important" to mean "likely to be of interest to real-world attackers".

Further down the list, and particularly for 6/7/8, you start to have many non-kernel options to perform privilege escalation (like symlink attacks on scripts running as root), the kernel tends to be updated less, and also the need for a privilege escalation is often lessened (for example, the thing you're exploiting is already running as root).

I also haven't even included remote kernel bugs (like the issues in SCTP or IPv6 that have been seen in the past), as they're so rare that it's quite hard to reason about -- but if you have one that's enabled by default somewhere, it's probably a good bug.

## Final Thoughts

From an attacker's perspective, a good bug is one that is highly exploitable, and one that affects a lot of platforms that attackers actually care about. But from a defender's perspective, it's really hard to know for sure which platforms attackers care about. It's their job not to tell you!

In saying that, even if you have a specific set of systems that you're responsible for securing, I'd suggest going deeper than "does this bug affect my systems".  Real-world risk is a bit more nuanced, and trying to build up a sense for where attackers are likely to use kernel exploits (and why) is an important part of assessing that risk accurately.

I've tried to share my view on this, and the end result skews toward prioritizing Android and common server distributions pretty highly. I'd be very interested to hear from anyone who has a different (or complimentary) approach though, since we're all working with imperfect knowledge.

One thing is clear though: figuring out which bugs are good takes quite a bit more work than it used to, and I think security researchers are often in a good position to do this.

When we find a new bug, we ideally should be doing some preliminary analysis to work out the industry-wide impact, and sharing our understanding of this will help the bug get fixed faster. Being clear about whether the issue affects Android, whether it affects common server distributions, and how likely it is to affect the long tail of Linux-based devices can make a big difference. This means doing a quick analysis of how common the affected feature is, any prerequisites for triggering the bug, and the length of time the bug has been around.

Stay tuned, I'll update this post in 2040 after another 17 years of "good" Linux kernel bugs... or perhaps with the story of how we fixed stuff once and for all!
