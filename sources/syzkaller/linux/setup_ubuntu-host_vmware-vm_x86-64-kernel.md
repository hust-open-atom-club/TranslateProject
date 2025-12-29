---
status: translated
title: "Setup: Ubuntu host, VMware vm, x86-64 kernel"
author: Syzkaller Community
collector: jxlpzqc
collected_date: 20240314
translator: yinchunyuan
translated_date: 20251127
link: https://github.com/google/syzkaller/blob/master/docs/linux/setup_ubuntu-host_vmware-vm_x86-64-kernel.md
---

# 设置：Ubuntu 主机，VMware 虚拟机，x86-64 内核

这里是一些关于怎么在 VMware Workstation 中使用 Ubuntu 主机和 Debian Bullseye 虚拟机
来模糊 x86-64 内核的指南。

在这个指南下，`$VAR` 符号（例如 `$GCC`、`$KERNEL` 等）表示目录路径，这些目录要么是在执行指南时创建的（比如，解压 GCC 归档文件时会创建一个目录），要么是你必须在运行指南前自己创建。请手动替换这些变量的值。

## GCC 和内核

你可以按照与使用 QEMU 时相同的 [指令](/docs/linux/setup_ubuntu-host_qemu-vm_x86-64-kernel.md) 来获得 GCC 并构建 Linux 内核。

## 镜像

安装 debootstrap：

``` bash
sudo apt-get install debootstrap
```

为了创建一个在 $USERSPACE 目录中的 Debian Bullseye Linux 用户空间，请执行：
```
sudo mkdir -p $USERSPACE
sudo debootstrap --include=openssh-server,curl,tar,gcc,libc6-dev,time,strace,sudo,less,psmisc,selinux-utils,policycoreutils,checkpolicy,selinux-policy-default,firmware-atheros,open-vm-tools --components=main,contrib,non-free bullseye $USERSPACE
```

注意：在用户空间中有 `open-vm-tools` 包很重要，因为这个包可以提供更好的虚拟机管理。

为了创建 Debian Bullseye Linux VMDK，请执行；

```
wget https://raw.githubusercontent.com/google/syzkaller/master/tools/create-gce-image.sh -O create-gce-image.sh
chmod +x create-gce-image.sh
./create-gce-image.sh $USERSPACE $KERNEL/arch/x86/boot/bzImage
qemu-img convert disk.raw -O vmdk disk.vmdk
```

磁盘镜像的结果应为 `disk.vmdk`，根 SSH 密钥的结果应为 `key`，如果想要，可以删除 `disk.raw`。

## VMware 工作站

打开 VMware 工作站并启动新建虚拟机向导。
假如你想在 `$VMPATH` 中创建新的虚拟机，按照以下步骤完成向导：

* Virtual Machine Configuration: Custom (advanced)
* Hardware compatibility: select the latest version
* Guest OS: select "I will install the operating system later"
* Guest OS type: Linux
* Virtual Machine Name and Location: select `$VMPATH` as location and "debian" as name
* Processors and Memory: select as appropriate
* Network connection: Use host-only networking
* I/O Controller Type: LSI Logic
* Virtual Disk Type: IDE
* Disk: select "Use an existing virtual disk"
* Existing Disk File: enter the path of `disk.vmdk` created above
* Select "Customize Hardware..." and remove the "Printer" device if you have one. Add a new "Serial Port" device. For the serial port connection choose "Use socket (named pipe)" and enter "serial" for the socket path. At the end it should look like this:

![设置虚拟机](vmw-settings.png?raw=true)

当你完成向导后，你应该有 `$VMPATH/debian.vmx`。从现在开始，你不再需要工作站用户界面了。

启动 Debian 虚拟机（无头模式）：
``` bash
vmrun start $VMPATH/debian.vmx nogui
```

获得 Debian 虚拟机的 IP 地址：
``` bash
vmrun getGuestIPAddress $VMPATH/debian.vmx -wait
```

以 SSH 密钥方式登录虚拟机：
``` bash
ssh -i key root@<vm-ip-address>
```

连接虚拟机的串行端口（在它启动后）：
``` bash
nc -U $VMPATH/serial
```

关闭虚拟机：
``` bash
vmrun stop $VMPATH/debian.vmx
```

如果以上所有的 `vmrun` 命令都可以正常工作，接下来可继续运行 syzkaller。

## syzkaller

创建一个如下所示的管理器配置，将环境变量 $GOPATH, $KERNEL 和 $VMPATH 替换为它们的实际值。

```
{
	"target": "linux/amd64",
	"http": "127.0.0.1:56741",
	"workdir": "$GOPATH/src/github.com/google/syzkaller/workdir",
	"kernel_obj": "$KERNEL",
	"sshkey": "$IMAGE/key",
	"syzkaller": "$GOPATH/src/github.com/google/syzkaller",
	"procs": 8,
	"type": "vmware",
	"vm": {
		"count": 4,
		"base_vmx": "$VMPATH/debian.vmx",
	}
}
```

运行 syzkaller 管理器：

``` bash
mkdir workdir
./bin/syz-manager -config=my.cfg
```

Syzkaller 将会从 `base_vmx` 虚拟机中创建完整的克隆虚拟机，然后使用 ssh 来复制并且在其中执行程序。
`base_vmx` 虚拟机将不会工作，并且它的磁盘将保持未修改状态。

如果你在 `syz-manager` 启动后遇到问题，考虑使用 `-debug` 标志运行它。同时也可以在 [这个页面](/docs/troubleshooting.md) 查找解决问题的方法。
