---
status: translated
title: "Android binderfs 文件系统"
author: Linux Kernel Community
collector: indigova
collected_date: 20261019
translator: indigova
translated_date: 20261022
link: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/admin-guide/binderfs.rst
---

# Android binderfs 文件系统

Android binderfs 是一个适用于 Android binder IPC 机制的文件系统，
允许在运行时动态地添加和移除 binder 设备。
位于不同 binderfs 实例里面的 binder 设备是相互独立的，挂载某个 
binderfs 实例会相应地获得一组其私有的 binder 设备。

## 挂载 binderfs

Android binderfs 可以用以下命令挂载：

    mkdir /dev/binderfs
    mount -t binder binder /dev/binderfs

执行完命令后，一个新的 binderfs 实例便会出现在 `/dev/binderfs` 下。
在一个新建的 binderfs 实例里不会有任何 binder 设备，只会有一个叫做 
`binder-control` 的设备，作为 binderfs 的请求处理器。在其他地方挂载
另一个 binderfs 实例时，将会创建一个独立于其他所有 binderfs 挂载的
新实例，这与 `devpts` 和 `tmpfs` 等的行为是相同的。另外，可以在用户
命名空间中挂载 Android binderfs 文件系统。

## 选项

max

:   挂载 binderfs 实例时可以限制可分配的 binder 设备数量，
    `max=<count>` 挂载选项用于为每个实例指定这个最大值限制。一旦指
    定了 `max=<count>`，那么这个 binderfs 实例中最多只能分配 
    `<count>` 个 binder 设备。

stats

:   选项 `stats=global` 可以启用全局 binder 统计信息，但此选项仅适
    用于初始用户命名空间中挂载的 binderfs 实例，若尝试在其他用户命
    名空间里使用这个选项来挂载 binderfs 实例，则会返回一个权限错误。

## 分配 binder 设备

如需在某 binderfs 实例里分配一个新的 binder 设备，则要通过 
`binder-control` 设备节点发送一个请求。这个请求以 
[ioctl()](http://man7.org/linux/man-pages/man2/ioctl.2.html) 
的形式发送。

程序需要做的是，打开 `binder-control` 设备节点，然后向内核发送一个 
`BINDER_CTL_ADD` 请求。binderfs 的用户需要向内核传递这个新的 
binder 设备的名称信息。默认情况下，上述设备名称（包括零终止字符）最
长只能有 `BINDERFS_MAX_NAME` 个字符。

一旦通过 
[ioctl()](http://man7.org/linux/man-pages/man2/ioctl.2.html) 向
内核传递了包含设备名称的 `struct binder_device`，内核便会分配一个
新的 binder 设备并返回一个包含这个新设备的主设备号和次设备号的 
struct（这是必要的，因为 binderfs 动态分配主设备号）。
[ioctl()](http://man7.org/linux/man-pages/man2/ioctl.2.html) 
返回后，`/dev/binderfs` 下便会新增一个以上述设备名称为名字的 
binder 设备。

## 删除 binder 设备

Binderfs 的 binder 设备可通过 
[unlink()](http://man7.org/linux/man-pages/man2/unlink.2.html) 
删除。这意味着可以通过 
[rm()](http://man7.org/linux/man-pages/man1/rm.1.html) 工具来
删除它们。注意，`binder-control` 设备不能被删除，因为这样的操作会
使得 binderfs 实例不可用。当 binderfs 实例被卸载并且所有指向它的
引用被释放之后，`binder-control` 设备便会随之被删除。

## Binder 功能

若一个 binderfs 实例已经被挂载到了 `/dev/binderfs` 下，那么便可在 
`/dev/binderfs/features/` 下找到这个 binder 驱动程序所支持的功能。
可以通过测试每个文件是否存在来确定驱动是否支持某个特定的功能。

例如：

    cat /dev/binderfs/features/oneway_spam_detection
    1
