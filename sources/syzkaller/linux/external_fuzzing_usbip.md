---
status: translated
title: "USB/IP Fuzzing for Linux Kernel"
author: Syzkaller Community
collector: jxlpzqc
collected_date: 20240314
translator: RutingZhang0429
translated_date: 20240602
link: https://github.com/google/syzkaller/blob/master/docs/linux/external_fuzzing_usbip.md
---

# Linux内核USB/IP子系统的模糊测试

Syzkaller 支持对 Linux 内核 USB/IP 子系统进行外部模糊测试。我们可以设置一个虚拟网络，并将 USB/IP 数据包发送到客户端内核，仿佛它们从外部服务器被接收。USB/IP 模糊测试需要启用 USB/IP 配置。你可以在配置部分找到相关列表。

目前，Syzkaller 仅支持对 USB/IP 客户端进行模糊测试，这包括两个主要部分：

1. USB/IP伪系统调用。
2. Syzkaller描述。

### 配置

以下配置应该为USB/IP启用：

```
CONFIG_USBIP_CORE=y
CONFIG_USBIP_VHCI_HCD=y
CONFIG_USBIP_VHCI_HC_PORTS=8
CONFIG_USBIP_VHCI_NR_HCS=8
CONFIG_USBIP_HOST=y
CONFIG_USBIP_VUDC=y
CONFIG_USBIP_DEBUG=y
```

### 伪系统调用

目前，Syzkaller定义了一个 USB/IP 伪系统调用和一个 USB/IP 特定的写系统调用（参见[此处](/executor/common_linux.h)获取伪系统调用和[此处](/sys/linux/usbip.txt)获取其 Syzkaller 描述）：

`syz_usbip_server_init` 设置 USB/IP 服务器。它创建一对连接的套接字并打开 `/sys/devices/platform/vhci_hcd.0/attach` 文件。随后，这个伪系统调用将 USB/IP 客户端的套接字描述符以及用于 USB/IP 连接的端口号、USB 设备 ID 和 USB 设备速度写入该文件，以便 USB/IP 客户端和服务器之间开始通信，并且客户端的内核可以从服务器接收 USB/IP 数据包。

`write$usbip_server` 通过使用服务器的套接字描述符向客户端发送 USB/IP 数据包。（特别是 USBIP_RET_SUBMIT 和 USBIP_RET_UNLINK 数据包。）我们假设服务器可以发送任意 USB/IP 数据包，而不是模拟一个真实设备。这些数据包最终会进入客户端的内核并在那里解析。

### 进一步改进

1. 对 USB/IP 的服务器端进行模糊测试。
2. 收集来自 USB/IP 内核代码的覆盖率。
