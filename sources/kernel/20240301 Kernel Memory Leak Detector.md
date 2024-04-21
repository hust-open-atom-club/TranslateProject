---
status: proofread
title: Kernel Memory Leak Detector
author: Linux Kernel Community
collector: RutingZhang0429
collected_date: 20240301
translator: tttturtle-russ
translated_date: 20240306
proofreader: shandianchengzi
proofread_date: 20240406
link: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/dev-tools/kmemleak.rst
---
# 内核内存泄露检测器
Kmemleak (Kernel Memory Leak Detector) 提供了一个类似[可追踪的垃圾收集器](https://en.wikipedia.org/wiki/Tracing_garbage_collection)的方法来检测可能的内核内存泄漏。与之不同的是，孤立对象不会被释放，只会在 `/sys/kernel/debug/kmemleak` 中报告。相似的方法也在 Valgrind 工具（`memcheck --leak-chekc`）中使用过，用来检测用户空间应用中的内存泄露。

## 用法
\"Kernel hacking\" 中的 CONFIG\_DEBUG\_KMEMLEAK 必须被启用。一个内核线程（默认情况下）每10分钟扫描一次内存，并且打印出新发现的未被引用的对象个数。如果 `debugfs` 没有挂载，请执行以下指令挂载：

    # mount -t debugfs nodev /sys/kernel/debug/


显示所有扫描出的可能的内存泄漏的细节信息：

    # cat /sys/kernel/debug/kmemleak

启动一次中等程度的内存扫描：

    # echo scan > /sys/kernel/debug/kmemleak

清空当前检测出来的内存泄露问题列表：

    # echo clear > /sys/kernel/debug/kmemleak

当再次读取 `/sys/kernel/debug/kmemleak` 文件时，将会输出自上次扫描以来检测到的新的内存泄露。

注意，孤立对象是按照被分配的时间来排序的，列表开头的对象可能会导致后续的对象都被识别为孤立对象。

在运行状态下，可以通过写入 `/sys/kernel/debug/kmemleak` 文件修改内存扫描参数。下面是支持的参数：

- off  
    禁用 kmemleak（不可逆）
- stack=on  
    开启任务栈扫描（默认）
- stack=off  
    禁用任务栈扫描
- scan=on  
    开启自动内存扫描线程（默认）
- scan=off  
    关闭自动内存扫描线程
- scan=\<secs\>  
    设定自动内存扫描间隔，以秒为单位（默认值为 600，设置为 0 表示停止自动扫描）
- scan  
    触发一次内存扫描
- clear  
    通过标记所有当前已报告的未被引用对象为灰，从而清空当前可能的内存泄露列表；如果 kmemleak 被禁用，则释放所有 kmemleak 对象，。
- dump=\<addr\>  
    输出存储在 \<addr\> 中的对象信息

可以通过在内核命令行中传递 `kmemleak=off` 参数从而在启动时禁用 Kmemleak。

在 kmemleak 初始化之前就可能会有内存分配或释放，这些操作被存储在一个早期日志缓冲区中。缓冲区的大小通过 CONFIG\_DEBUG\_KMEMLEAK\_MEM\_POOL\_SIZE 选项配置。

如果 CONFIG\_DEBUG\_KMEMLEAK\_DEFAULT\_OFF 被启用，则 kmemleak 默认被禁用。在内核命令行中传递 `kmemleak=on` 参数来开启这个功能。

如果出现 \"Error while writing to stdout\" 或 \"write\_loop: Invalid argument\" 这样的错误，请确认 kmemleak 被正确启用。

## 基础算法
通过 [`kmalloc()`](https://docs.kernel.org/core-api/mm-api.html#c.kmalloc "kmalloc")，[`vmalloc()`](https://docs.kernel.org/core-api/mm-api.html#c.vmalloc "vmalloc")， [`kmem_cache_alloc()`](https://docs.kernel.org/core-api/mm-api.html#c.kmem_cache_alloc "kmem_cache_alloc") 以及其他同类函数进行的内存分配行为均被跟踪，其指针以及额外的信息（如大小和栈追踪等）被存储在红黑树中。对应的内存释放函数调用也被追踪，并从 kmemleak 数据结构中移除相应指针。

对于一个已分配的内存块，如果通过扫描内存（包括保存寄存器）的方式没有发现任何指针指向它的起始地址或者其中的任何位置，则认为这块内存是孤立的。这意味着内核无法将该内存块的地址传递给一个释放内存函数，这块内存便被认为泄露了。

扫描算法步骤：

> 1. 标记所有对象为白色（最后剩下的白色对象被认为是孤立的）
> 2. 从数据节和栈开始扫描内存，检测每个值是否是红黑树中存储的地址。如果一个指向白色对象的指针被检测到，则将该对象标记为灰色。
> 3. 扫描灰色对象引用的其他对象（有些白色对象可能会变为灰色并被添加到灰名单末尾）直到灰名单为空。
> 4. 剩余的白色对象就被认为是孤立的并通过 `/sys/kernel/debug/kmemleak` 报告。
>


有些指向已分配的内存块的指针存储在内核内部的数据结构中，它们不应该被检测为孤立。为了避免这种情况，kmemleak 也存储了引用被查找地址区域内的内存块的地址值的数量，引用计数表明了在这个地址范围内有其他引用存在，如此一来这些内存便不会被认为泄露。一个例子是 `__vmalloc()` 。

> 译者注：在Linux内核中，`__vmalloc()` 函数用于分配大于一个页面的虚拟内存区域。这种类型的内存分配通常用于动态内存需求较大的情况，例如创建大型缓冲区或者大块的临时内存。由于这些内存分配通常是临时性的，而且在释放后不会造成内存泄漏。  
> 当内核跟踪到 `__vmalloc()` 分配的内存块时，如果该内存块仍然被其他部分的内核代码所引用，那么在 kmemleak 的机制下内存块不会被错误地标记为泄漏。因此，通过存储引用计数，可以更准确地确定内存块是否真正泄漏。

## 用 kmemleak 测试特定部分
在初始化启动阶段 `/sys/kernel/debug/kmemleak` 的输出可能会很多，这也可能是你在开发时编写的漏洞百出的代码导致的。
为了解决这种情况你可以使用 \'clear\' 命令来清除 `/sys/kernel/debug/kmemleak` 输出的所有的未引用对象。在执行 \'clear\' 后执行 \'scan\' 可以发现新的未引用对象，这将会有利你测试代码的特定部分。

为了用一个空的 kmemleak 测试一个特定部分，执行： 

    # echo clear > /sys/kernel/debug/kmemleak
    ... 测试你的内核或者模块 ...
    # echo scan > /sys/kernel/debug/kmemleak

然后像平常一样获得报告：

    # cat /sys/kernel/debug/kmemleak

## 释放 kmemleak 内部对象

为了在用户禁用或发生致命错误导致 kmemleak 被禁用时，用户也能被允许访问先前发现的内存泄露，kmemleak 被禁用时 kmemleak 内部定义的对象不会被释放。这些对象可能会占用很大一部分物理内存。

在这种情况下，你可以用如下命令回收这些内存：

    # echo clear > /sys/kernel/debug/kmemleak

## Kmemleak API
在 include/linux/kmemleak.h 头文件中查看函数原型：

-   `kmemleak_init` - 初始化 kmemleak
-   `kmemleak_alloc` - 通知一个内存块的分配
-   `kmemleak_alloc_percpu` - 通知一个 percpu 类型的内存分配
-   `kmemleak_vmalloc` - 通知一个使用 vmalloc() 的内存分配
-   `kmemleak_free` - 通知一个内存块的释放
-   `kmemleak_free_part` - 通知一个部分的内存释放
-   `kmemleak_free_percpu` - 通知一个 percpu 类型的内存释放
-   `kmemleak_update_trace` - 更新分配对象过程的栈追踪
-   `kmemleak_not_leak` - 标记一个对象内存为未泄露的
-   `kmemleak_ignore` - 不要扫描或报告某个对象未泄露的
-   `kmemleak_scan_area` - 在内存块中添加扫描区域
-   `kmemleak_no_scan` - 不扫描某个内存块
-   `kmemleak_erase` - 在指针变量中移除某个旧的值
-   `kmemleak_alloc_recursive` - 和 `kmemleak_alloc` 效果相同但会检查是否有递归的内存分配
-   `kmemleak_free_recursive` - 和 `kmemleak_free` 效果相同但会检查是否有递归的内存释放

下列函数使用一个物理地址作为对象指针，并且只在地址有一个 lowmem 映射时做出相应的行为：

-   `kmemleak_alloc_phys`
-   `kmemleak_free_part_phys`
-   `kmemleak_ignore_phys`

## 解决假阳性/假阴性

假阴性是指，由于在内存扫描中有值指向该对象，虽然切实存在但 kmemleak 没有报告的内存泄露（孤立对象）。为了减少假阴性的出现次数，kmemleak 提供了 `kmemleak_ignore`，`kmemleak_scan_area`，`kmemleak_no_scan` 和 `kmemleak_erase` 函数（见上）。任务栈也会增加假阴性的数量并且默认不开启对它们的扫描。

假阳性是对象被误报为内存泄露（孤立对象）。对于已知不是内存泄露的对象，kmemleak 提供了 `kmemleak_not_leak` 函数。同时 `kmemleak_ignore` 可以用于标记已知不包含任何其他指针的内存块，标记后该内存块不会再被扫描。

一些被报告的泄露仅仅是暂时的，尤其是在 SMP（对称多处理）系统中，因为其指针暂存在 CPU 寄存器或栈中。kmemleak 定义了 MSECS\_MIN\_AGE（默认值为 1000）来表示一个被报告为内存泄露的对象的最小存活时间。

## 限制和缺点
主要的缺点是内存分配和释放的性能下降。为了避免其他的损失，只有当 `/sys/kernel/debug/kmemleak` 文件被读取时才会进行内存扫描。无论如何，这个工具是出于调试的目标，性能表现可能不是最重要的。

为了保持算法简单，kmemleak 寻找指向某个内存块范围中的任何值。这可能会引发假阴性现象的出现。但是，最后一个真正的内存泄露也会变得明显。

扫描了存储在不被指针指向的内存中的数据是假阴性的另一个来源。在将来的版本中，kmemleak 仅仅会扫描已分配结构体中的指针成员。这个特性会解决上述很多的假阴性情况。

Kmemleak 会报告假阳性。这可能发生在某些被分配的内存块不需要被释放的情况下（某些 `init_call` 函数中）。在这些情况中，指针的计算是通过其他方法而不是常规的 `container_of` 宏，或者指针被存储在 kmemleak 没有扫描的地方。

页分配和 `ioremap` 不会被追踪。

## 使用 kmemleak-test 测试
为了检测是否成功启用了 kmemleak，你可以对故意制造了内存泄露的 kmemleak-test 模组进行测试。请设置 CONFIG\_SAMPLE\_KMEMLEAK 为模组
（它不能作为内建模组使用），并启动启用了 kmemleak 的内核。加载模块并执行一次扫描：

    # modprobe kmemleak-test
    # echo scan > /sys/kernel/debug/kmemleak

注意你可能无法立刻或在第一次扫描后得到结果。kmemleak 得到结果时，将会输出日志 `kmemleak: <count of leaks> new suspected memory leaks`。然后，请读取文件以获取以下信息：

    # cat /sys/kernel/debug/kmemleak
    unreferenced object 0xffff89862ca702e8 (size 32):
      comm "modprobe", pid 2088, jiffies 4294680594 (age 375.486s)
      hex dump (first 32 bytes):
        6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b  kkkkkkkkkkkkkkkk
        6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b 6b a5  kkkkkkkkkkkkkkk.
      backtrace:
        [<00000000e0a73ec7>] 0xffffffffc01d2036
        [<000000000c5d2a46>] do_one_initcall+0x41/0x1df
        [<0000000046db7e0a>] do_init_module+0x55/0x200
        [<00000000542b9814>] load_module+0x203c/0x2480
        [<00000000c2850256>] __do_sys_finit_module+0xba/0xe0
        [<000000006564e7ef>] do_syscall_64+0x43/0x110
        [<000000007c873fa6>] entry_SYSCALL_64_after_hwframe+0x44/0xa9
    ...

用 `rmmod kmemleak_test` 移除模块时也会触发 kmemleak 的结果输出。
