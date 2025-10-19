---
status: translated
title: "Setup: Ubuntu host, QEMU vm, x86-64 kernel"
author: Syzkaller Community
collector: jxlpzqc
collected_date: 20240314
translator: zqmz
translated_date: 20251019 
link: https://github.com/google/syzkaller/blob/master/docs/linux/setup_ubuntu-host_qemu-vm_x86-64-kernel.md
---

# 环境配置:Ubuntu 主机，QEMU 虚拟机，x86-64 内核

本文档介绍了在主机为 Ubuntn 系统、QEMU 实例为 Debian Bullseye 系统的环境中，使用 QEMU 对 x86-64 内核进行模糊测试的步骤。

以下内容使用 `$VAR` 表示法 （例如 `$GCC`, `$KERNEL` 等） 来表示目录路径。这些目录是在执行指令时创建的 （例如，解压 GCC 归档文件时自动创建的目录）， 或是你事先自行创建的。请手动将这些变量替换为实际路径。


## 依赖项的安装

命令：
``` bash
sudo apt update
sudo apt install make gcc flex bison libncurses-dev libelf-dev libssl-dev
```


## GCC 的准备

如果你的发行版自带的 GCC 版本较旧，推荐从 [这里](/docs/syzbot.md#crash-does-not-reproduce) 获取最新的 GCC 版本。将安装包下载并解压到 `$GCC` 目录下。确保你可以在 `$GCC/bin/` 目录下找到对应的 GCC 文件。

>**Ubuntu 20.04 LTS**: 如果你使用的是该版本的 Ubuntu 系统，可以忽略这一步骤，因为该版本中的 GCC 已经是最新的版本了。

如果你想要确认 GCC 是否符合要求，可以执行以下命令：
``` bash
ls $GCC/bin/
# 正确的输出结果示例:
# cpp     gcc-ranlib  x86_64-pc-linux-gnu-gcc        x86_64-pc-linux-gnu-gcc-ranlib
# gcc     gcov        x86_64-pc-linux-gnu-gcc-9.0.0
# gcc-ar  gcov-dump   x86_64-pc-linux-gnu-gcc-ar
# gcc-nm  gcov-tool   x86_64-pc-linux-gnu-gcc-nm
```

## 内核配置

### 克隆 Linux 内核源代码

执行命令:
``` bash
git clone --branch v6.2 git://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git $KERNEL
```

>我们建议从最新的稳定版本开始。这里的 v6.2 只是一个示例，实际操作时替换成对应的最新版本。

### 生成默认配置

命令:
``` bash
cd $KERNEL
make defconfig
make kvm_guest.config
```

如果你想要指定编译器，可以按以下方法操作。

命令:
``` bash
cd $KERNEL
make CC="$GCC/bin/gcc" defconfig
make CC="$GCC/bin/gcc" kvm_guest.config
```

### 启用必需的配置选项

启用 syzkaller 所需的内核配置选项，具体信息参考 [这里](kernel_configs.md) 。
不是所有选项都是必需的，但是至少确保启用以下选项:

``` make
# 覆盖率收集
CONFIG_KCOV=y

# 用于符号化的调试信息
CONFIG_DEBUG_INFO_DWARF4=y

# 内存错误检测器
CONFIG_KASAN=y
CONFIG_KASAN_INLINE=y

# Debian Stretch 及更高版本所必需的选项
CONFIG_CONFIGFS_FS=y
CONFIG_SECURITYFS=y
```

编辑并启用 `.config` 文件 （你也可以通过 `make menuconfig` 完成这一步骤）。

因为启用这些选项会产生更多可选的子选项，所以我们需要重新生成配置:

命令:
``` bash
make olddefconfig
```

如果你想指定编译器，执行以下命令

命令:
``` bash
make CC="$GCC/bin/gcc" olddefconfig
```

如果你愿意，还可以在 syzkaller 配置中禁用可预测的网络接口名称机制（详情参见 [这里](troubleshooting.md)）或者通过更新以下内核配置参数来实现禁用:

``` make
CONFIG_CMDLINE_BOOL=y
CONFIG_CMDLINE="net.ifnames=0"
```

### 编译内核

命令:
``` bash
make -j`nproc`
```

你同样可以通过以下命令继续指定编译器。

命令:
``` bash
make CC="$GCC/bin/gcc" -j`nproc`
```

完成以上步骤后，你应该可以找到 `vmlinux`（内核二进制文件）和 `bzImage` （压缩的内核镜像），通过以下步骤检查这两个文件是否存在。

命令:
``` bash
ls $KERNEL/vmlinux
# 输出示例 - $KERNEL/vmlinux
ls $KERNEL/arch/x86/boot/bzImage
# 输出示例 - $KERNEL/arch/x86/boot/bzImage
```

## 镜像

### 安装 debootstrap

命令:
``` bash
sudo apt install debootstrap
```

### 创建 Debian Bullseye Linux 镜像

创建一个包含必需软件包的最简 Debian Bullseye Linux 镜像

命令:
``` bash
mkdir $IMAGE
cd $IMAGE/
wget https://raw.githubusercontent.com/google/syzkaller/master/tools/create-image.sh -O create-image.sh
chmod +x create-image.sh
./create-image.sh
```

运行结果应该是生成了 `$IMAGE/bullseye.img` 磁盘镜像。

### 或者创建不同版本的 Debian Linux 镜像

要创建不同版本的 Debian 镜像（例如 buster, stretch, sid），请指定 `--distribution` 选项。

命令:
``` bash
./create-image.sh --distribution buster
```

### 镜像中扩展工具的安装

有时在 VM 中安装一些额外的工具也是有用的， 尽管这些工具不是运行 syzkaller 所必需的。你可以通过以下命令安装一些你认为会有帮助的工具 （允许自定义脚本中要安装的工具列表）。

命令:
``` bash
./create-image.sh --feature full
```

安装 perf 请执行以下命令（这个选项不是运行 syzkaller 必需的；安装 perf 需要 `$KERNEL` 指向内核源代码）。

命令:
``` bash
./create-image.sh --add-perf
```

关于 `create-image.sh` 的更多选项， 使用 `./create-image.sh -h` 了解详细信息。

## QEMU

### 安装 QEMU

命令:
``` bash
sudo apt install qemu-system-x86
```

### 验证是否成功安装

确保内核可以启动并且 `sshd` 服务能够正常启用。

命令:
``` bash
qemu-system-x86_64 \
	-m 2G \
	-smp 2 \
	-kernel $KERNEL/arch/x86/boot/bzImage \
	-append "console=ttyS0 root=/dev/sda earlyprintk=serial net.ifnames=0" \
	-drive file=$IMAGE/bullseye.img,format=raw \
	-net user,host=10.0.2.10,hostfwd=tcp:127.0.0.1:10021-:22 \
	-net nic,model=e1000 \
	-enable-kvm \
	-nographic \
	-pidfile vm.pid \
	2>&1 | tee vm.log
```

``` text
early console in setup code
early console in extract_kernel
input_data: 0x0000000005d9e276
input_len: 0x0000000001da5af3
output: 0x0000000001000000
output_len: 0x00000000058799f8
kernel_total_size: 0x0000000006b63000

Decompressing Linux... Parsing ELF... done.
Booting the kernel.
[    0.000000] Linux version 4.12.0-rc3+ ...
[    0.000000] Command line: console=ttyS0 root=/dev/sda debug earlyprintk=serial
...
[ ok ] Starting enhanced syslogd: rsyslogd.
[ ok ] Starting periodic command scheduler: cron.
[ ok ] Starting OpenBSD Secure Shell server: sshd.
```

完成这些之后，你应该可以在另一个终端中通过 ssh 连接到 QEMU 实例。

命令:
``` bash
ssh -i $IMAGE/bullseye.id_rsa -p 10021 -o "StrictHostKeyChecking no" root@localhost
```

### 故障排除

如果连接失败并提示 "too many tries", 可能是因为 ssh 在显式传递的密钥 （通过 `-i` 指定）之前传递了默认密钥。可以通过添加选项 `-o "IdentitiesOnly yes"` 解决这个问题。

终止 QEMU 实例请按 `Ctrl+A` 然后按 `X` 或者运行以下命令。

命令:
``` bash
kill $(cat vm.pid)
```

如果 QEMU 工作正常，内核能够正常启动并且 ssh 连接成功，你可以尝试关闭 QEMU 实例并运行 syzkaller。

## syzkaller

按照 [这里](/docs/linux/setup.md#go-and-syzkaller) 的描述编译安装 syzkaller 。
然后创建一个如下所示的管理器配置文件，将环境变量 `$GOPATH`, `$KERNEL` 和 `$IMAGE` 替换为实际值。

``` json
{
	"target": "linux/amd64",
	"http": "127.0.0.1:56741",
	"workdir": "$GOPATH/src/github.com/google/syzkaller/workdir",
	"kernel_obj": "$KERNEL",
	"image": "$IMAGE/bullseye.img",
	"sshkey": "$IMAGE/bullseye.id_rsa",
	"syzkaller": "$GOPATH/src/github.com/google/syzkaller",
	"procs": 8,
	"type": "qemu",
	"vm": {
		"count": 4,
		"kernel": "$KERNEL/arch/x86/boot/bzImage",
		"cpu": 2,
		"mem": 2048
	}
}
```

运行 syzkaller 管理器:

``` bash
mkdir workdir
./bin/syz-manager -config=my.cfg
```

现在 syzkaller 应该已经运行起来了，你可以通过 Web 浏览器在 `127.0.0.1:56741` 查看管理器状态。

如果在 `syz-manager` 启动后遇到问题，可以考虑使用 `-debug` 标志运行它。
另请参阅 [这一页](/docs/troubleshooting.md) 获取故障排除提示。
