---
status: proofread
title: "Introduction"
author: Linux Kernel Community
collector: tttturtle-russ
collected_date: 20240718
translator: Athanlaich
translated_date: 20240822
proofreader: mudongliang
proofread_date: 20240827
link: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/admin-guide/bug-bisect.rst
---

# 二分查找一个错误

## 介绍

请你总是尝试从 kernel.org 获取最新的内核，并从源代码开始构建。如果你对自己能够做到这一点不自信，请将错误报告发给你的发行版供应商，而不是内核开发者。

发现错误并不总是容易的。尽管如此，你还是需要尝试寻找。如果你找不到，请不要放弃。将你发现的尽可能多的信息报告给相关子系统的维护者。请参阅 MAINTAINERS 了解你工作的子系统对应的维护者是谁。

在提交错误报告之前，请阅读 
Documentation/admin-guide/reporting-issues.rst。

## 设备未显示

这通常是由 udev/systemd 引起的。在将错误归咎于内核之前，请先检查这一点。

## 寻找导致错误的补丁

使用 `git` 提供的工具，只要错误是可复现的，就很容易找到错误根源。

执行步骤:

-   从 git 源代码构建内核

-   开始二分查找[^1]:

        $ git bisect start

-   用以下命令标记有问题的变更集：

        $ git bisect bad [commit]

-   用以下命令标记正常的变更集：

        $ git bisect good [commit]

-   重新构建内核并测试

-   根据你正在测试的变更集是否发生了错误，选择使用以下命令与 git bisect 交互：

        $ git bisect good

    或者:

        $ git bisect bad

-   经过几次交互后，git bisect 将给出可能导致错误的变更集。

-   例如，如果你知道当前版本有问题，而 4.8 版本是好的，你可以这样做：

        $ git bisect start
        $ git bisect bad                     # 当前版本有问题
        $ git bisect good v4.8

有关进一步参考，请阅读：

-   `git-bisect` 的手册页
-   [使用 git bisect 对抗回归](https://www.kernel.org/pub/software/scm/git/docs/git-bisect-lk2009.html)
-   [使用 git bisect run 全自动二分查找](https://lwn.net/Articles/317154)
-   [使用 git bisect 找出何时引入了错误](http://webchick.net/node/99)

[^1]: 你可以通过使用 `git bisect start [BAD] [GOOD]` 选择性地提供好或坏的参数
