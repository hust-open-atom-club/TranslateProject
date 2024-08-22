---
status: published
title: "Setup: Debian/Ubuntu/Fedora host, QEMU vm, s390x kernel"
author: Syzkaller Community
collector: jxlpzqc
collected_date: 20240314
translator: xin-zheqi
translated_date: 20240317
proofreader: JingJing1016
proofread_date: 20240407
publisher: gitveg
published_date: 20240430
link: https://github.com/google/syzkaller/blob/master/docs/linux/setup_linux-host_qemu-vm_s390x-kernel.md
---

# 安装: Debian/Ubuntu/Fedora host, QEMU vm, s390x kernel

## GCC

获取至少 GCC 9 版本的 `s390x-linux-gnu-gcc`。最新的 Debian/Ubuntu/Fedora 发行版应该在 `gcc-s390x-linux-gnu` 软件包中提供足够新版本的交叉编译器。

## Kernel

获取 Linux 内核源码:

``` bash
git clone git://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git $KERNEL
```

生成默认配置:

``` bash
cd $KERNEL
make ARCH=s390 CROSS_COMPILE=s390x-linux-gnu- defconfig
make ARCH=s390 CROSS_COMPILE=s390x-linux-gnu- kvm_guest.config
```

启用 syzkaller 所需的内核配置选项，如下所述 [kernel_configs.md](kernel_configs.md)。

```
./scripts/config --file .config \
                 -d MODULES \
                 -e KCOV \
                 -e KCOV_INSTRUMENT_ALL \
                 -e KCOV_ENABLE_COMPARISONS \
                 -e KASAN \
                 -e KASAN_INLINE \
                 -e CONFIGFS_FS \
                 -e SECURITYFS \
                 -e DEBUG_INFO \
                 -e GDB_SCRIPTS \
                 -e PRINTK \
                 -e EARLY_PRINTK \
                 -e DEVTMPFS \
                 -e TUN \
                 -e VIRTIO_PCI \
                 -e VIRTIO_NET \
                 -e NET_9P_VIRTIO \
                 -e NET_9P \
                 -e 9P_FS \
                 -e BINFMT_MISC \
                 -e FAULT_INJECTION \
                 -e FAILSLAB \
                 -e FAIL_PAGE_ALLOC \
                 -e FAIL_MAKE_REQUEST \
                 -e FAIL_IO_TIMEOUT \
                 -e FAIL_FUTEX \
                 -e FAULT_INJECTION_DEBUG_FS \
                 -e FAULT_INJECTION_STACKTRACE_FILTER \
                 -e DEBUG_KMEMLEAK
```

手动编辑 `.config` 文件并在文件中启用它们（如果你愿意，也可以通过 `make menuconfig` 进行操作）。

由于启用这些选项会导致更多子选项可用，因此我们需要重新生成配置:

``` bash
make ARCH=s390 CROSS_COMPILE=s390x-linux-gnu- olddefconfig
```

编译内核:

``` bash
make ARCH=s390 CROSS_COMPILE=s390x-linux-gnu- -j$(nproc)
```

现在你应该有 `vmlinux`（内核二进制文件）和 `bzImage`（打包的内核镜像）:

``` bash
$ ls $KERNEL/vmlinux
$KERNEL/vmlinux
$ ls $KERNEL/arch/s390/boot/bzImage
$KERNEL/arch/s390/boot/bzImage
```

## Image

### Debian

要使用最少的必需软件包集创建一个 Debian Linux 镜像，请执行以下操作：

``` bash
cd $IMAGE/
wget https://raw.githubusercontent.com/google/syzkaller/master/tools/create-image.sh -O create-image.sh
chmod +x create-image.sh
./create-image.sh -a s390x
```

执行结果应当是 `$IMAGE/bullseye.img` 的磁盘镜像文件。

有关 `create-image.sh` 的其他选项，请参阅 `./create-image.sh -h`。

## QEMU

### Debian

运行:

```shell
qemu-system-s390x \
	-M s390-ccw-virtio -cpu max,zpci=on -m 4G -smp 2 \
	-kernel $KERNEL/arch/s390/boot/bzImage \
	-drive file=$IMAGE/buster.img,if=virtio,format=raw \
	-append "rootwait root=/dev/vda net.ifnames=0 biosdevname=0" \
	-net nic,model=virtio -net user,host=10.0.2.10,hostfwd=tcp:127.0.0.1:10021-:22 \
	-display none -serial mon:stdio \
	-pidfile vm.pid 2>&1 | tee vm.log
```

之后，你应该能够在另一个终端中通过 SSH 连接到 QEMU 实例：

``` bash
ssh -i $IMAGE/buster.id_rsa -p 10021 -o "StrictHostKeyChecking no" root@localhost
```

如果出现 "too many tries" 错误，可能是 SSH 先传递了默认密钥，而不是传递了 `-i` 所标识的指定密钥。请在命令中添加选项 `-o "IdentitiesOnly yes"`。

终止正在运行的 QEMU 实例，请按 `Ctrl+A` ，然后按 `X` 运行：

``` bash
kill $(cat vm.pid)
```

如果 QEMU 正常工作，内核启动并且 SSH 连接成功，您可以关闭 QEMU 并尝试运行 syzkaller 。

## syzkaller

按照 [此处](/sources/syzkaller/linux/setup.md#go-and-syzkaller) 的说明编译 syzkaller，target 为 s390x：

``` bash
make TARGETOS=linux TARGETARCH=s390x
```

然后创建一个管理器配置文件，内容如下，请将环境变量 `$GOPATH` 、`$KERNEL` 和 `$IMAGE` 替换为实际的值：

```
{
	"target": "linux/s390x",
	"http": "127.0.0.1:56741",
	"workdir": "$GOPATH/src/github.com/google/syzkaller/workdir",
	"kernel_obj": "$KERNEL",
	"image": "$IMAGE/buster.img",
	"sshkey": "$IMAGE/buster.id_rsa",
	"syzkaller": "$GOPATH/src/github.com/google/syzkaller",
	"procs": 8,
	"type": "qemu",
	"vm": {
		"count": 4,
		"kernel": "$KERNEL/arch/s390/boot/bzImage",
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

现在 syzkaller 应该正在运行，你可以通过浏览器在 `127.0.0.1:56741` 查看管理器的状态。

如果在启动 `syz-manager` 后遇到问题，请考虑在 `-debug` 标志下运行它。此外，查看 [此页面](/sources/syzkaller/troubleshooting.md) 获取故障排除提示。
