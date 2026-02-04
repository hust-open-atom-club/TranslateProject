---
status: proofread
title: "FreeBSD"
author: Syzkaller Community
collector: jxlpzqc
translator: CAICAIIs
collected_date: 20240314
translated_date: 20250219
proofreader: yinchunyuan
proofread_date: 20250913
publisher: zqmz
published_date: 20260131
link: https://github.com/google/syzkaller/blob/master/docs/freebsd/README.md
---

# FreeBSD

本页面包含在 FressBSD 或 Linux 主机上设置 syzkaller 并对运行于虚拟机中的 amd64 FreeBSD 内核进行模糊测试的说明。

目前，syzkaller 可对运行在 bhyve、QEMU 或 GCE（Google Compute Engine）下的 FreeBSD 进行模糊测试。无论采用哪种操作模式，均需遵循一些通用步骤。

## 设置主机

`syz-manager` 是 syzkaller 中用于管理目标虚拟机的组件。它在主机系统上运行，可以自动创建、运行和销毁共享用户指定镜像文件的虚拟机。

### 设置 FreeBSD 主机

要开箱即用地构建 syzkaller，主机必须使用较新的 FreeBSD 13.0-CURRENT 版本。旧版 FreeBSD 亦可使用，但需手动调整。

运行以下命令安装所需依赖：
```console
# pkg install bash gcc git gmake go golangci-lint llvm
```
使用 bhyve 作为虚拟机后端时，还需安装 DHCP 服务器：
```console
# pkg install dnsmasq
```
要获取 syzkaller 源代码副本，请运行：
```console
$ git clone https://github.com/google/syzkaller
```
并通过以下命令构建二进制文件：
```console
$ cd syzkaller
$ gmake
```

完成后，`bin/` 目录下应生成 `syz-manager` 可执行文件。

### 设置 Linux 主机

构建 Go 二进制文件请执行：
```
make manager fuzzer execprog TARGETOS=freebsd
```
要构建 C 语言 `syz-executor` 二进制文件，需将 `executor/*` 文件复制到 FreeBSD 机器上并执行以下构建命令：
```
c++ executor/executor.cc -o syz-executor -O1 -lpthread -DGOOS_freebsd=1 -DGOARCH_amd64=1 -DGIT_REVISION=\"CURRENT_GIT_REVISION\"
```
随后将生成的二进制文件复制回主机的 `bin/freebsd_amd64` 目录。

## 设置 FreeBSD 虚拟机

建议从 FreeBSD 的[快照镜像](https://ftp.freebsd.org/pub/FreeBSD/snapshots/VM-IMAGES/14.0-CURRENT/amd64/Latest/)开始操作。根据需求获取适用于 QEMU 的 QCOW2 磁盘镜像，或适用于 GCE、bhyve 的 raw 镜像。
获取 FreeBSD 内核源码副本并放置于 `/usr/src`。通常需扩展虚拟机磁盘空间。启动虚拟机前执行：
```console
# truncate -s 15G $IMAGEFILE
```
要在 FreeBSD 上启用 KCOV，必须编译自定义内核。此操作最适合在主机完成。<br>
启动虚拟机前，在主机上编译自定义内核并安装至虚拟机。主机端操作：
```console
# mdconfig -a -f $IMAGEFILE
# mount /dev/md0p4 /mnt
```
该操作将为虚拟机文件创建内存设备，并允许主机在虚拟机上安装自定义内核源码。 <br>
获取当前开发源码副本：
```console
# pkg install git
# git clone --depth=1 --branch=main https://github.com/freebsd/freebsd-src /usr/src
```
创建 syzkaller 专用内核配置文件并构建新内核：

```console
# cd /usr/src/sys/amd64/conf
# cat <<__EOF__ > SYZKALLER
include "./GENERIC"

ident	SYZKALLER

options 	COVERAGE
options 	KCOV
__EOF__
# cd /usr/src
# make -j $(sysctl -n hw.ncpu) KERNCONF=SYZKALLER buildkernel
# make KERNCONF=SYZKALLER installkernel DESTDIR=/mnt
```
启动虚拟机前务必执行：
```console
# umount /mnt
```
md 设备将保持挂载状态，后续可重复使用。若不再需要可销毁：
```console
# mdconfig -d -u 0
```
使用 QEMU 启动基于下载镜像的虚拟机：

```console
$ qemu-system-x86_64 -hda $IMAGEFILE -nographic -net user,host=10.0.2.10,hostfwd=tcp::10022-:22 -net nic,model=e1000
```
当出现引导加载菜单时，当出现引导加载菜单时，按 Esc 键进入加载程序提示符，依次执行 `set console="comconsole"` 和 `boot` 命令。进入登录提示后，以 root 身份登录并将以下配置参数添加至 `/boot/loader.conf`：

```console
# cat <<__EOF__ >>/boot/loader.conf
autoboot_delay="-1"
console="comconsole"
__EOF__
```
虚拟机启动后，/etc/rc.d/growfs 应已自动扩展文件系统。否则请运行：
```console
# /etc/rc.d/growfs onestart
```
验证 `uname -i` 输出是否为 `SYZKALLER` ，以确认新构建的内核正在运行。

为允许远程访问虚拟机，需配置 DHCP 并启用 `sshd`：

```console
# sysrc sshd_enable=YES
# sysrc ifconfig_DEFAULT=DHCP
```

若计划以 root 身份运行系统调用执行器，需在 `/etc/ssh/sshd_config` 中添加 `PermitRootLogin without-password` 以允许 root SSH 登录。 否则请使用 `adduser` 创建新用户。为该用户安装 SSH 密钥并验证能否从主机 SSH 连接至虚拟机。注意当前 bhyve 仍需使用 root 用户。

### 在 bhyve 下运行

主机端需执行额外步骤以使用 bhyve。首先，确保主机系统版本不低于 r346550。其次，因 bhyve 当前不支持磁盘镜像快照，必须使用 ZFS 提供等效功能。创建 ZFS 数据集并复制虚拟机镜像至其中。该数据集亦可存储 syzkaller 工作目录。例如，在名为 `data` 的存储池挂载于 `/data` 时执行：
```console
# zfs create data/syzkaller
# cp FreeBSD-13.0-CURRENT-amd64.raw /data/syzkaller
```
第三，为虚拟机实例配置网络和 DHCP：

```console
# ifconfig bridge create
bridge0
# ifconfig bridge0 inet 169.254.0.1
# echo 'dhcp-range=169.254.0.2,169.254.0.254,255.255.255.0' > /usr/local/etc/dnsmasq.conf
# echo 'interface=bridge0' >> /usr/local/etc/dnsmasq.conf
# sysrc dnsmasq_enable=YES
# service dnsmasq start
# echo 'net.link.tap.up_on_open=1' >> /etc/sysctl.conf
# sysctl net.link.tap.up_on_open=1
```
为实现每次系统启动时自动配置桥接网络，将以下内容添加至 /etc/rc.conf：
```console
# cloned_interfaces="bridge0 tap0"
# ifconfig_bridge0="inet 169.254.0.1 addm tap0 up"
# ifconfig_tap0="up"
```
最后确保加载 bhyve 内核模块：
```console
# kldload vmm
```

### 整合所有配置

若上述步骤均成功，请创建包含以下内容的 `freebsd.cfg` 配置文件（按需修改路径）：

```
{
	"name": "freebsd",
	"target": "freebsd/amd64",
	"http": ":10000",
	"workdir": "/workdir",
	"syzkaller": "/gopath/src/github.com/google/syzkaller",
	"sshkey": "/freebsd_id_rsa",
	"sandbox": "none",
	"procs": 8,
}
```
在 QEMU 下运行模糊测试时添加：

```
	"image": "/FreeBSD-13.0-CURRENT-amd64.qcow2",
	"type": "qemu",
	"vm": {
		"count": 10,
		"cpu": 4,
		"mem": 2048
	}
```
使用 GCE 时改为添加以下内容（按需修改存储桶路径）：

```
	"image": "/FreeBSD-13.0-CURRENT-amd64.raw",
	"type": "gce",
	"vm": {
		"count": 10,
		"instance_type": "n1-standard-4",
		"gcs_path": "syzkaller"
	}
```
使用 bhyve 时需指定虚拟机镜像快照名称及网络信息（按需修改数据集名称和路径）：
```
	"image": "/data/syzkaller/FreeBSD-13.0-CURRENT-amd64.raw",
	"type": "bhyve",
	"vm": {
		"count": 10,
		"bridge": "bridge0",
		"hostip": "169.254.0.1",
		"dataset": "data/syzkaller"
	}
```

随后通过以下命令启动 `syz-manager` ：
```console
$ bin/syz-manager -config freebsd.cfg
```
正常输出应类似：
```
booting test machines...
wait for the connection from test machine...
machine check: 253 calls enabled, kcov=true, kleakcheck=false, faultinjection=false, comps=false
executed 3622, cover 1219, crashes 0, repro 0
executed 7921, cover 1239, crashes 0, repro 0
executed 32807, cover 1244, crashes 0, repro 0
executed 35803, cover 1248, crashes 0, repro 0
```
若运行异常，可尝试为 `syz-manager` 添加 `-debug` 标志。

## 缺失功能

- 系统调用描述。FreeBSD 系统调用的初始列表复制自 Linux，虽经多次清理但仍需仔细审核。目前仍缺少许多系统调用描述。
- 需支持对 Linux 兼容性子系统进行模糊测试。
- 应提供针对 ZFS 文件系统的 FreeBSD 模糊测试指南。
- 需完善 `pkg/host` 对支持的系统调用/设备的检测功能。
- 为 FreeBSD 实现 KASAN 和 KCSAN 将非常有益。
- Linux 上我们通过 tun/gadgetfs 实现外部网络/USB 流量注入内核。为 FreeBSD 实现类似功能可发现多个高危漏洞。
