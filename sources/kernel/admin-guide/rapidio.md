---
status: proofread
title: "RapidIO Subsystem Guide"
author: Linux Kernel Community
collector: tttturtle-russ
collected_date: 20240718
translator: Kozmosa
translated_date: 20250715
proofreader: mudongliang
proofread_date: 20250715
publisher: zqmz
published_date: 20260123
link: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/admin-guide/rapidio.rst
---

# RapidIO 子系统指南

作者

:   Matt Porter

## 引言

RapidIO 是一种高速的交换式互联结构，其特性主要面向嵌入式市场。RapidIO 支持通过交换网络进行内存映射 I/O，以及基于消息的事务。 RapidIO 拥有一个标准化的发现机制，与 PCI 总线标准类似，允许在网络中简单地检测设备。 

本文档提供给在新架构上支持 RapidIO，编写新驱动程序，或理解该子系统内部机制的开发人员。

## 已知的 Bug 和局限性

### Bugs

没有。;)

### 局限性

1. 对 RapidIO 内存区域的访问/管理尚未支持。
2. 多主机枚举尚未支持。

## RapidIO 驱动接口

我们为驱动程序提供了一组调用与子系统进行交互，收集设备信息、请求或映射内存区域资源以及管理邮箱/门铃。

### 函数

::: {.kernel-doc internal=""}
include/linux/rio_drv.h
:::

::: {.kernel-doc export=""}
drivers/rapidio/rio-driver.c
:::

::: {.kernel-doc export=""}
drivers/rapidio/rio.c
:::

## 内部机制

本章节包含了为 RapidIO 子系统自动生成的文档。

### 结构

::: {.kernel-doc internal=""}
include/linux/rio.h
:::

### 枚举与发现

::: {.kernel-doc internal=""}
drivers/rapidio/rio-scan.c
:::

### 驱动功能

::: {.kernel-doc internal=""}
drivers/rapidio/rio.c
:::

::: {.kernel-doc internal=""}
drivers/rapidio/rio-access.c
:::

### 设备模型支持

::: {.kernel-doc internal=""}
drivers/rapidio/rio-driver.c
:::

### PPC32 支持

::: {.kernel-doc internal=""}
arch/powerpc/sysdev/fsl_rio.c
:::

## 致谢

以下人员直接或间接地为 RapidIO 子系统做出了贡献：

1.  Matt Porter<mporter@kernel.crashing.org>
2.  Randy Vinson<rvinson@mvista.com>
3.  Dan Malek<dan@embeddedalley.com>

以下人员为本文档做出了贡献：

1.  Matt Porter<mporter@kernel.crashing.org>
