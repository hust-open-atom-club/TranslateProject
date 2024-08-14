---
status: proofread
title: "Setup: Debian host, QEMU vm, arm kernel"
author: Syzkaller Community
collector: jxlpzqc
collected_date: 20240314
translator: apowerfulmei
translated_date: 20240317
proofreader: QGrain
proofread_date: 20240814
link: https://github.com/google/syzkaller/blob/master/docs/linux/setup_linux-host_qemu-vm_arm-kernel.md
---

# 设置：Debian 主机，QEMU 虚拟机，arm 内核

# GCC

获取最新的 `arm-linux-gnueabihf-gcc` 工具。最新的 Debian 发行版中提供的版本为 7.2.0，这对于本文的工作来说已经足够。你也可以点击 [这里](https://www.linaro.org/downloads) 来下载 Linaro 编译器。

# 内核

以下指令已在 `v4.16.1` 上进行测试。请首先检查补丁 ["arm: port KCOV to arm"](https://groups.google.com/d/msg/syzkaller/zLThPHplyIc/9ncfpRvVCAAJ) 是否已经应用或回溯过，随后使用如下命令创建内核配置：

```shell
make ARCH=arm CROSS_COMPILE=arm-linux-gnueabihf- vexpress_defconfig
```

接着优先启用以下配置：

```
CONFIG_KCOV=y
CONFIG_DEBUG_INFO=y
CONFIG_DEVTMPFS_MOUNT=y
CONFIG_NAMESPACES=y
CONFIG_USER_NS=y
CONFIG_UTS_NS=y
CONFIG_IPC_NS=y
CONFIG_PID_NS=y
CONFIG_NET_NS=y
```

也可以查看一些通用的内核配置 [建议](/docs/linux/kernel_configs.md)。

随后使用以下命令构建内核：

```
make ARCH=arm CROSS_COMPILE=arm-linux-gnueabi-
```

# 映像

我们使用 buildroot 来创建磁盘映像。你可以点击 [此处](https://buildroot.uclibc.org/download.html) 来获取 buildroot。以下指令已在 buildroot `c665c7c9cd6646b135cdd9aa7036809f7771ab80` 上进行测试。首先运行：

```
make qemu_arm_vexpress_defconfig
make menuconfig
```

选择如下选项：

```
    Target packages
	    Networking applications
	        [*] dhcpcd
	        [*] iproute2
	        [*] openssh
    Filesystem images
	        exact size - 1g
```

取消选择如下选项：

```
    Kernel
	    Linux Kernel
```

运行命令 `make`。

在 `output/target/etc/fstab` 中添加如下一行内容：

```
debugfs	/sys/kernel/debug	debugfs	defaults	0	0
```

将 `output/target/etc/ssh/sshd_config` 替换为如下内容：

```
PermitRootLogin yes
PasswordAuthentication yes
PermitEmptyPasswords yes
```

再次运行命令 `make`。

# 测试内核与映像

运行：

```
qemu-system-arm -m 512 -smp 2 -net nic -net user,host=10.0.2.10,hostfwd=tcp::10022-:22 -display none -serial stdio -machine vexpress-a15 -dtb /linux/arch/arm/boot/dts/vexpress-v2p-ca15-tc1.dtb -sd /buildroot/output/images/rootfs.ext2 -snapshot -kernel /linux/arch/arm/boot/zImage -append "earlyprintk=serial console=ttyAMA0 root=/dev/mmcblk0"
```

上述命令将会启动内核。等待登录提示信息，随后在另一个控制台中运行：

```
ssh -p 10022 root@localhost
```

ssh 命令应该能够成功登录。

# syzkaller

按照 [这里](/docs/linux/setup.md#go-and-syzkaller) 描述的步骤构建 syzkaller，将目标架构设置为 `arm`：

```
make TARGETOS=linux TARGETARCH=arm
```

按照如下示例创建管理器配置文件 `arm.cfg`（根据需要更改路径）：

```
{
	"name": "arm",
	"target": "linux/arm",
	"http": ":12345",
	"workdir": "/workdir",
	"kernel_obj": "/linux",
	"syzkaller": "/gopath/src/github.com/google/syzkaller",
	"image": "/buildroot/output/images/rootfs.ext2",
	"sandbox": "none",
	"reproduce": false,
	"procs": 4,
	"type": "qemu",
	"vm": {
		"count": 10,
		"qemu_args": "-machine vexpress-a15 -dtb /linux/arch/arm/boot/dts/vexpress-v2p-ca15-tc1.dtb",
		"cmdline": "console=ttyAMA0 root=/dev/mmcblk0",
		"kernel": "/linux/arch/arm/boot/zImage",
		"image_device": "sd",
		"mem": 512,
		"cpu": 2
	}
}
```

最后，运行命令 `bin/syz-manager -config arm.cfg`。
