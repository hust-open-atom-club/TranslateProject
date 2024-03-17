---
status: translated
title: "Setup: Debian/Ubuntu/Fedora host, QEMU vm, s390x kernel"
author: Syzkaller Community
collector: chengziqiu
collected_date: 20240314
translator：xin-zheqi
link: https://github.com/google/syzkaller/blob/master/docs/linux/setup_linux-host_qemu-vm_s390x-kernel.md
---

# 安装: Debian/Ubuntu/Fedora host, QEMU vm, s390x kernel

## GCC

获取版本 9及以上的 GCC `s390x-linux-gnu-gcc` 。最新的 Debian/Ubuntu/Fedora 发行版
应该在 `gcc-s390x-linux-gnu` 软件包中提供足够新版本的交叉编译器。

## Kernel

检查Linux内核资源版本:

``` bash
git clone git://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git $KERNEL
```

生成默认配置:

``` bash
cd $KERNEL
make ARCH=s390 CROSS_COMPILE=s390x-linux-gnu- defconfig
make ARCH=s390 CROSS_COMPILE=s390x-linux-gnu- kvm_guest.config
```

启用 syzkaller 所需的内核配置选项，如下所述[kernel_configs.md](kernel_configs.md).

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

手动编辑 `.config` 文件并在文件中启用它们（如果您愿意，也可以通过 `make menuconfig` 进行操作）.

由于启用这些选项会导致更多子选项可用，因此我们需要重新生成配置:

``` bash
make ARCH=s390 CROSS_COMPILE=s390x-linux-gnu- olddefconfig
```

构建内核:

```
make ARCH=s390 CROSS_COMPILE=s390x-linux-gnu- -j$(nproc)
```

现在你应该有 `vmlinux` （内核二进制文件）和 `bzImage` （打包的内核映像）:

``` bash
$ ls $KERNEL/vmlinux
$KERNEL/vmlinux
$ ls $KERNEL/arch/s390/boot/bzImage
$KERNEL/arch/s390/boot/bzImage
```

## Image

### Debian

要使用最少的必需软件包集创建一个 Debian Linux 映像，请执行以下操作：

```
cd $IMAGE/
wget https://raw.githubusercontent.com/google/syzkaller/master/tools/create-image.sh -O create-image.sh
chmod +x create-image.sh
./create-image.sh -a s390x
```

执行结果应当是 `$IMAGE/bullseye.img` 的磁盘映像文件.

有关 `create-image.sh` 的其他选项，请参阅 `./create-image.sh -h` 

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

之后，您应该能够在另一个终端中通过 ssh 连接到 QEMU 实例：

``` bash
ssh -i $IMAGE/buster.id_rsa -p 10021 -o "StrictHostKeyChecking no" root@localhost
```

如果出现 "too many tries" 的错误，可能是因为SSH在传递显示用 `-i` 参数传递的密钥之前会传递默认密钥。请在命令中添加选项 `-o "IdentitiesOnly yes"` 。

终止正在运行的 QEMU 实例，请按 `Ctrl+A` ，然后按 `X` 或run运行：

``` bash
kill $(cat vm.pid)
```

如果QEMU正常工作，内核启动并且SSH连接成功，您可以关闭QEMU并尝试运行syzkaller。

## syzkaller

按照[此处](/docs/linux/setup.md#go-and-syzkaller)的说明构建syzkaller，target为s390x：

```
make TARGETOS=linux TARGETARCH=s390x
```

然后创建一个管理器配置文件，内容如下，请将环境变量 `$GOPATH`、`$KERNEL` 和 `$IMAGE` 替换为实际的值：

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

运行syzkaller管理器:

``` bash
mkdir workdir
./bin/syz-manager -config=my.cfg
```

现在syzkaller应该正在运行，您可以使用您的Web浏览器在站点： `127.0.0.1:56741` 查看管理器的状态。

如果在启动 `syz-manager` 后遇到问题，请考虑在 `-debug` 标志下运行它。此外，查看[此页面](/docs/troubleshooting.md)获取故障排除提示。
