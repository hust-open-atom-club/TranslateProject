---
status: translated
title: "Video Output Switcher Control"
author: Linux Kernel Community
collector: tttturtle-russ
collected_date: 20240718
translator: jerryguo822
translated_date: 20261126
link: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/admin-guide/video-output.rst
---

# 视频输出切换控制

2006 <luming.yu@intel.com>

输出 sysfs 类驱动提供了一个抽象的视频输出层。通过通用的 sysfs 接口，该抽象层可用于将平台特定方法挂钩，以启用或禁用视频输出设备。例如，在我的 IBM ThinkPad T42 笔记本电脑上，ACPI 视频驱动将其输出设备，以及针对 “state” 的读写方法，注册到了输出 sysfs 类中。sysfs 中的用户空间接口如下：

    linux:/sys/class/video_output # tree .
    .
    |-- CRT0
    |   |-- device -> ../../../devices/pci0000:00/0000:00:01.0
    |   |-- state
    |   |-- subsystem -> ../../../class/video_output
    |   `-- uevent
    |-- DVI0
    |   |-- device -> ../../../devices/pci0000:00/0000:00:01.0
    |   |-- state
    |   |-- subsystem -> ../../../class/video_output
    |   `-- uevent
    |-- LCD0
    |   |-- device -> ../../../devices/pci0000:00/0000:00:01.0
    |   |-- state
    |   |-- subsystem -> ../../../class/video_output
    |   `-- uevent
    `-- TV0
       |-- device -> ../../../devices/pci0000:00/0000:00:01.0
       |-- state
       |-- subsystem -> ../../../class/video_output
       `-- uevent
