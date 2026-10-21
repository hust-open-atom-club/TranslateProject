---
status: translated
title: "Ramoops oops/panic logger"
author: Linux Kernel Community
collector: tttturtle-russ
collected_date: 20240718
translator: areacloser
translated_date: 20261020
link: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/admin-guide/ramoops.rst
---

# Ramoops oops/panic 日志记录器

Sergiu Iordache \<<sergiu@chromium.org>\>

最近更新：2021 年 2 月 10 日

## 介绍

Ramoops 是一个内核异常（oops）/恐慌（panic）日志记录器，它在系统崩溃之前将其日
志写入 RAM 中。它通过在环形缓冲区中记录 oops 和 panic 来工作。Ramoops 需要一个
具有持久性 RAM 的系统，以便该区域的内容在系统重新启动后仍然存在。

## Ramoops 中的概念

Ramoops 使用一块预定义的内存区域来存放 oops/panic 的日志转储。内存区域的起始地
址、大小和类型由三个变量来设置：

> -   `mem_address` 用于指定起始地址。
> -   `mem_size` 用于指定大小。内存大小将向下舍入为 2 的幂。
> -   `mem_type` 用于指定内存类型（默认值为 pgprot_writecombine）。
> -   `mem_name` 用于指定一块由 `reserve_mem` 命令行参数定义的内存区域。

通常应使用 `mem_type=0` 这一默认值，因为它将 pstore 映射设置为
pgprot_writecombine。设置 `mem_type=1` 会尝试使用 `pgprot_noncached`，但这仅在
某些平台上有效。这是因为 pstore 依赖于原子操作。至少在 ARM 平台上，
pgprot_noncached 会导致这块内存被映射为强序（strongly ordered），而强序内存上的
原子操作是实现定义的，并且在许多 ARM 平台（如 OMAP）上无法工作。设置
`mem_type=2` 则尝试将这块内存区域视为普通内存，从而启用其上的完整缓存。这可以提
高性能。

这块内存区域被划分成大小为 `record_size` 的记录块（其值同样向下舍入为 2 的幂），
每次 kmsg 转储都会写入一个大小为 `record_size` 的信息块。

可以通过 `max_reason` 的值来控制要存储哪些 kmsg 转储类型，该值在
include/linux/kmsg_dump.h 的 `enum kmsg_dump_reason` 中定义。例如，要同时存储
Oops 和 Panic，`max_reason` 应设置为 2（KMSG_DUMP_OOPS）；要仅存储 Panic，
`max_reason` 应设置为 1（KMSG_DUMP_PANIC）。将 `max_reason` 设置为
0（KMSG_DUMP_UNDEF）意味着，对转储原因的筛选将由 `printk.always_kmsg_dump` 启动
参数控制：如果未设置，则为 KMSG_DUMP_OOPS，否则为 KMSG_DUMP_MAX。

该模块使用计数器来记录多个日志转储，该计数器在重启后会被重置（也就是说，重启
后产生的新转储会覆盖旧转储）。

Ramoops 还支持持久性内存区域的软件纠错码（ECC）保护。这一功能在使用了硬件复位来
恢复机器正常工作状态（例如看门狗触发复位）后可能有用。在这些情况下，RAM 可能在
一定程度上被破坏，但通常这是可恢复的。

## 设置参数

可以通过几种不同的方式来设置 Ramoops 的参数：

> A. 使用模块参数（名称和前面列举的变量一样）。对于快速调试，你也可以在启动
> 时预留部分内存区域，然后将这块区域用于 Ramoops。例如，假设有一台内存大于
> 128 MB 的机器，下面的内核命令行会要求内核只使用前 128 MB 的内存，并将带有
> ECC 保护的 ramoops 区域放置在 128 MB 边界处的内存中：
>
>     mem=128M ramoops.mem_address=0x8000000 ramoops.ecc=1
>
> B. 使用设备树绑定，根据在
> `Documentation/devicetree/bindings/reserved-memory/ramoops.yaml` 中的描述。例如：
>
>     reserved-memory {
>         #address-cells = <2>;
>         #size-cells = <2>;
>         ranges;
>
>         ramoops@8f000000 {
>             compatible = "ramoops";
>             reg = <0 0x8f000000 0 0x100000>;
>             record-size = <0x4000>;
>             console-size = <0x4000>;
>         };
>     };
>
> C. 使用平台设备并设置平台数据。随后 Ramoops 的参数就可以通过该平台数据来设置。
> 以下为这种方式的一个示例：
>
> ``` c
> #include <linux/pstore_ram.h>
> [...]
>
> static struct ramoops_platform_data ramoops_data = {
>       .mem_size               = <...>,
>       .mem_address            = <...>,
>       .mem_type               = <...>,
>       .record_size            = <...>,
>       .max_reason             = <...>,
>       .ecc                    = <...>,
> };
>
> static struct platform_device ramoops_dev = {
>       .name = "ramoops",
>       .dev = {
>               .platform_data = &ramoops_data,
>       },
> };
>
> [... 在函数中 ...]
> int ret;
>
> ret = platform_device_register(&ramoops_dev);
> if (ret) {
>   printk(KERN_ERR "unable to register platform device\n");
>   return ret;
> }
> ```
>
> D. 使用一块通过 `reserve_mem` 命令行参数预留的内存区域。其地址和大小由
> `reserve_mem` 定义。需要注意， `reserve_mem` 可能不会总是将内存分配到同一个位
> 置，因而不应假定其分配地址固定。它需要进行测试，并且可能无法在每台机器
> 或每个内核上正常工作。请把这个方式看作一种 “尽力而为” 的方法。`reserve_mem` 选
> 项接受大小（size），对齐值（alignment）和名称（name）三个参数。其中名称用于将内
> 存区域映射为一个可被 Ramoops 检索的标签。
>
>     reserve_mem=2M:4096:oops ramoops.mem_name=oops

你可以指定 RAM ，也可以指定外设的内存区域。然而，若指定的是 RAM，需确保在
架构代码的非常早期调用 memblock_reserve() 以预留这块内存区域，例如：

    #include <linux/memblock.h>

    memblock_reserve(ramoops_data.mem_address, ramoops_data.mem_size);

## 转储格式

转储内容以一个头部（header）开始，该头部目前定义为 `====` 后面跟一个时间戳并换
行。随后是实际的转储数据。

## 读取数据

转储数据可以通过 pstore 文件系统来读取。这些文件的名称格式是 `dmesg-ramoops-N`，
其中 N 是内存中的记录编号。想要删除 RAM 中已存储的记录，只需删除对应的 pstore
文件即可。

## 持久化函数追踪

持久化函数追踪可能有助于调试由软件或硬件引起的系统卡死（hang）。函数调用链的日志
保存在 `ftrace-ramoops` 文件中。以下是一个用途示例：

    # mount -t debugfs debugfs /sys/kernel/debug/
    # echo 1 > /sys/kernel/debug/pstore/record_ftrace
    # reboot -f
    [...]
    # mount -t pstore pstore /mnt/
    # tail /mnt/ftrace-ramoops
    0 ffffffff8101ea64  ffffffff8101bcda  native_apic_mem_read <- disconnect_bsp_APIC+0x6a/0xc0
    0 ffffffff8101ea44  ffffffff8101bcf6  native_apic_mem_write <- disconnect_bsp_APIC+0x86/0xc0
    0 ffffffff81020084  ffffffff8101a4b5  hpet_disable <- native_machine_shutdown+0x75/0x90
    0 ffffffff81005f94  ffffffff8101a4bb  iommu_shutdown_noop <- native_machine_shutdown+0x7b/0x90
    0 ffffffff8101a6a1  ffffffff8101a437  native_machine_emergency_restart <- native_machine_restart+0x37/0x40
    0 ffffffff811f9876  ffffffff8101a73a  acpi_reboot <- native_machine_emergency_restart+0xaa/0x1e0
    0 ffffffff8101a514  ffffffff8101a772  mach_reboot_fixups <- native_machine_emergency_restart+0xe2/0x1e0
    0 ffffffff811d9c54  ffffffff8101a7a0  __const_udelay <- native_machine_emergency_restart+0x110/0x1e0
    0 ffffffff811d9c34  ffffffff811d9c80  __delay <- __const_udelay+0x30/0x40
    0 ffffffff811d9d14  ffffffff811d9c3f  delay_tsc <- __delay+0xf/0x20
