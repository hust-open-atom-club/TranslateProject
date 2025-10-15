---
status: translated
title: "KUnit - Linux Kernel Unit Testing"
author: Linux Kernel Community
collector: JasonC10
collected_date: 20250906
translator: yinchunyuan
translated_date: 20251012
link: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/dev-tools/kunit/index.rst
---\n
# KUnit - Linux 内核单元测试

::: {.toctree maxdepth="2" caption="Contents:"}
start architecture run_wrapper run_manual usage api/index style faq
running_tips
:::

本节详细介绍内核单元测试框架。

## 介绍

KUnit（内核单元测试框架）为 Linux 内核里的单元测试提供了一个通用框架。使用 KUnit，你可以定义称为测试套件的测试用例组。
这些测试要么在构建为内置组件时在内核启动时运行要么作为一个模块加载，KUint 会在内核日志中自动标记并报告失败的测试用例。
这些测试结果在 `KTAP (Kernel - Test Anything Protocol) format</dev-tools/ktap>`{.interpreted-text
role="doc"} 中。 它受 JUnit 、Python's unittest.mock 和 GoogleTest/GoogleMock (C++ 单元测试框架) 启发。

KUnit 测试用 C 语言编写，是内核的一部分，测试内核实现的部分内容（例如：一个C语言函数）。
除过构建时间，从调用到完成，KUnit 可以在 10 秒内运行大约 100 个测试。
KUnit 可以测试任何内核组件，比如文件系统、系统调用、内存管理、设备驱动程序等等。

KUnit 采用白盒测试方法，该测试可访问内部系统功能。 KUnit 在内核中运行并且不限于暴露给用户空间的事物。

同时 KUnit 有 kunit 工具，一个配置 Linux 内核的脚本（`tools/testing/kunit/kunit.py`），运行
QEMU 或 UML 下的 KUnit 测试（`User Mode Linux </virt/uml/user_mode_linux_howto_v2>`{.interpreted-text
role="doc"}），解析测试结果，并以用户友好的方式展示它们。

### 特点

- 为编写单元测试提供框架
- 在任何内核架构上运行测试
- 以毫秒为单位运行测试

### 准备

- 任何与 Linux 内核兼容的硬件
- 对于被测内核，Linux 内核版本需为 5.5 或更高

## 单元测试

单元测试是对孤立的单个代码单元进行测试。
一个单元测试是测试的最精细粒度，并允许在被测代码中测试所有可能的代码路径。 
如果被测代码规模较小，且不存在任何不受测试控制的外部依赖（如硬件），那么这有可能实现。

### 编写单元测试

为了编写好的单元测试，有一个简单但强大的模式：Arrange-Act-Assert。
这是一个构建测试用例并且定义运算顺序的好方法。

- 准备输入和目标：在测试开始时，整理可以让函数运行的数据。例如：初始化一条语句或对象
- 对目标行为采取行动：调用你所测试的函数/代码
- 断言预期结果： 验证结果（或结果状态）是否符合预期

### 单元测试优势

- 长期来看提高了测试速度和开发效率
- 在初始阶段检测到程序缺陷，因此与验收测试相比，降低了缺陷修复成本
- 提高代码质量
- 鼓励编写可测试的代码

其他请阅读 `kinds-of-tests`{.interpreted-text role="ref"}.

## 如何使用它？

你可以在 Documentation/dev-tools/kunit/start.rst 中找到一份关于编写和运行 KUnit 测试的分布指南。
或者自由浏览 KUnit 的其他文档，亦或尝试使用 tools/testing/kunit/kunit.py 以及 lib/kunit/kunit-example-test.c
下的例子。

测试顺利！
