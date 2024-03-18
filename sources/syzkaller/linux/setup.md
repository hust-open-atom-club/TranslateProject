---
status: translated
title: "How to set up syzkaller"
author: Syzkaller Community
collector: dzm91_hust
collected_date: 20240304
translator:Tai-Xinwei
translated_data: 20240317
link: https://github.com/google/syzkaller/blob/master/docs/linux/setup.md
---

# 如何设置 syzkaller

关于如何设置 linux 内核模糊测试的通用指导[如下所示](setup.md#安装).

针对特定虚拟机类型或内核架构的设置指南，请参阅以下页面:

- [Setup: Ubuntu host, QEMU vm, x86-64 kernel](setup_ubuntu-host_qemu-vm_x86-64-kernel.md)
- [Setup: Linux host, QEMU vm, arm64 kernel](setup_linux-host_qemu-vm_arm64-kernel.md)
- [Setup: Linux host, QEMU vm, arm kernel](setup_linux-host_qemu-vm_arm-kernel.md)
- [Setup: Linux host, QEMU vm, riscv64 kernel](setup_linux-host_qemu-vm_riscv64-kernel.md)
- [Setup: Linux host, QEMU vm, s390x kernel](setup_linux-host_qemu-vm_s390x-kernel.md)
- [Setup: Linux host, Android device, arm32/64 kernel](setup_linux-host_android-device_arm-kernel.md)
- [Setup: Linux isolated host](setup_linux-host_isolated.md)
- [Setup: Ubuntu host, VMware vm, x86-64 kernel](setup_ubuntu-host_vmware-vm_x86-64-kernel.md)
- [Setup: Ubuntu host, Odroid C2 board, arm64 kernel](setup_ubuntu-host_odroid-c2-board_arm64-kernel.md) [已过时]

## 安装

要使用 syzkaller，需要以下组件:

 - Go 编译器和 syzkaller 本身
 - 具有覆盖率支持的 C 编译器
 - 增加了覆盖率的 Linux 内核
 - 虚拟机或物理设备

如果你遇到任何问题, 请查看[故障排除](/docs/troubleshooting.md)页面.

### Go 和 syzkaller

`syzkaller`是用 [Go](https://golang.org) 编写的，构建需要`Go 1.20+`工具链。通常我们支持最新的两个 Go 版本。可以使用以下命令安装工具链：

```
wget https://dl.google.com/go/go1.21.4.linux-amd64.tar.gz
tar -xf go1.21.4.linux-amd64.tar.gz
export GOROOT=`pwd`/go
export PATH=$GOROOT/bin:$PATH
```

其他选项请参见 [Go: 下载和安装](https://golang.org/doc/install)。

下载并构建 `syzkaller`:

``` bash
git clone https://github.com/google/syzkaller
cd syzkaller
make
```

编译完成后，应在`bin/`目录中生成可执行文件.

注意: 如果要进行跨操作系统/架构测试, 需要在`make`命令中指定`TARGETOS`、`TARGETVMARCH`和`TARGETARCH`参数。详细信息请参阅 [Makefile](/Makefile)。

### 环境设置

如果在跨架构环境下进行模糊测试，可能需要正确设置`binutils`，详见[这里](coverage.md#binutils)。

### C 编译器

Syzkaller 是一种基于覆盖率的模糊测试工具，因此需要使用支持覆盖率的内核进行构建，这要求使用较新版本的 GCC。覆盖率支持已被提交到 GCC，从 GCC 6.1.0 版本开始发布。
确保您的 GCC 符合此要求，或者获取 [syzbot](/docs/syzbot.md) 使用的 GCC，参见[这里](/docs/syzbot.md#crash-does-not-reproduce)。

### Linux 内核

除了 GCC 中的覆盖率支持外，还需要在内核方面进行相应的支持。KCOV 在 4.6 版本合入 Linux 内核主线，并通过`CONFIG_KCOV=y`内核配置选项启用。
对于旧版本的内核，至少需要将提交 [kernel: add kcov code coverage](https://github.com/torvalds/linux/commit/5c9a8750a6409c63a0f01d51a9024861022f6593) 进行移植。此外，建议移植所有涉及`kernel/kcov.c`的内核补丁。

为了启用更多的 syzkaller 功能并提高漏洞检测能力，建议使用额外的配置选项。详见[此页面](kernel_configs.md)。

### 虚拟机设置

Syzkaller 在工作虚拟机或物理设备上执行内核模糊测试。这些工作环境被称为虚拟机 (VMs)。Syzkaller 支持 QEMU、kvmtool 和 GCE 虚拟机、Android 设备以及 Odroid C2 开发板。

以下是 syzkaller VM 的通用要求：

 - 模糊测试进程需要与外界通信，因此 VM 镜像需要包含网络支持。
 - 使用 SSH 将模糊器进程的程序文件传输到 VM 中，因此 VM 镜像需要运行 SSH 服务器。
 - VM 的 SSH 配置应该设置为允许`syz-manager`配置中包含的身份的root访问权限。换句话说，您应该能够执行`ssh -i $SSHID -p $PORT root@localhost`而不会提示输入密码（其中`SSHID`是 SSH 身份文件，`PORT`是在`syz-manager`配置文件中指定的端口）。
 - 内核通过 debugfs 条目导出覆盖率信息，因此 VM 镜像需要在`/sys/kernel/debug`挂载 debugfs 文件系统

要在 QEMU 上使用 syzkaller VM，请在主机系统上安装 QEMU，有关详细信息请参见 [QEMU 文档](http://wiki.qemu.org/Manual)。可以使用 [create-image.sh](/tools/create-image.sh) 脚本创建适用的 Linux 镜像。

有关在 QEMU、Android 和其他一些类型的 VM 上设置 syzkaller 的说明，请参见文章顶部的链接。

### 故障排除

* QEMU 需要 root 权限才能使用`-enable-kvm`。

    解决方法：将用户添加到`kvm`组 (`sudo usermod -a -G kvm` 然后重新登录)。

* QEMU 崩溃并显示以下错误：

    ```
    qemu-system-x86_64: error: failed to set MSR 0x48b to 0x159ff00000000
    qemu-system-x86_64: /build/qemu-EmNSP4/qemu-4.2/target/i386/kvm.c:2947: kvm_put_msrs: Assertion `ret == cpu->kvm_msr_buf->nmsrs' failed.
   ```

    解决方法：从 QEMU 命令行中删除 `-cpu host,migratable=off`。最简单的方法是在`syz-manager`配置文件中将`qemu_args`设置为`-enable-kvm`。
