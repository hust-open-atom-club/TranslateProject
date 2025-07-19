---
status: translated
title: "Reproduce a bug with syzbot's downloadable assets"
author: Syzkaller Community
collector: jxlpzqc
collected_date: 20240314
translator: Kozmosa
translated_date: 20250718
priority: 10
link: https://github.com/google/syzkaller/blob/master/docs/syzbot_assets.md
---

## 使用 syzbot 的可下载资源复现错误

作为每份错误报告的一部分，syzbot 都会分享可下载的资源——即最初发现错误时所使用的磁盘镜像和内核二进制文件。

本文档旨在指导你如何使用这些资源在本地复现此类错误。

### 一份示例报告

具体来说，我们来看这个 syzbot 报告：[[syzbot] [hfs?] kernel BUG in hfsplus_bnode_put](https://lore.kernel.org/all/000000000000efee7905fe4c9a46@google.com/)。

```
syzbot has found a reproducer for the following issue on:

HEAD commit:    40f71e7cd3c6 Merge tag 'net-6.4-rc7' of git://git.kernel.o..
git tree:       upstream
console+strace: https://syzkaller.appspot.com/x/log.txt?x=10482ae3280000
kernel config:  https://syzkaller.appspot.com/x/.config?x=7ff8f87c7ab0e04e
dashboard link: https://syzkaller.appspot.com/bug?extid=005d2a9ecd9fbf525f6a
compiler:       Debian clang version 15.0.7, GNU ld (GNU Binutils for Debian) 2.35.2
syz repro:      https://syzkaller.appspot.com/x/repro.syz?x=142e7287280000
C reproducer:   https://syzkaller.appspot.com/x/repro.c?x=13fd185b280000

Downloadable assets:
disk image: https://storage.googleapis.com/syzbot-assets/073eea957569/disk-40f71e7c.raw.xz
vmlinux: https://storage.googleapis.com/syzbot-assets/c8a97aaa4cdc/vmlinux-40f71e7c.xz
kernel image: https://storage.googleapis.com/syzbot-assets/f536015eacbd/bzImage-40f71e7c.xz
mounted in repro: https://storage.googleapis.com/syzbot-assets/b5f1764cd64d/mount_0.gz
```

这里有 4 个文件的链接：
* 发现该 bug 的可启动虚拟机磁盘镜像：`https://storage.googleapis.com/syzbot-assets/073eea957569/disk-40f71e7c.raw.xz`
* **该镜像同时适用于 GCE 和 qemu**。
* 可用于报告符号化或基于 `gdb` 调试的 `vmlinux` 文件：`https://storage.googleapis.com/syzbot-assets/c8a97aaa4cdc/vmlinux-40f71e7c.xz`
* 独立的 `bzImage` 文件（它已包含在磁盘镜像中）：`https://storage.googleapis.com/syzbot-assets/f536015eacbd/bzImage-40f71e7c.xz`
* 在复现器中挂载的文件系统镜像：`https://storage.googleapis.com/syzbot-assets/b5f1764cd64d/mount_0.gz`

所有这些链接也可以从网页仪表板访问。

#### 运行 C 复现器

启动虚拟机：

```
$ wget 'https://storage.googleapis.com/syzbot-assets/073eea957569/disk-40f71e7c.raw.xz'
$ unxz disk-40f71e7c.raw.xz
$ qemu-system-x86_64 -m 2G -smp 2,sockets=2,cores=1 -drive file=./disk-40f71e7c.raw,format=raw -net nic,model=e1000 -net user,host=10.0.2.10,hostfwd=tcp::10022-:22 -enable-kvm -nographic -snapshot -machine pc-q35-7.1
```

构建并运行 C 复现器：

```
$ wget -O 'repro.c' 'https://syzkaller.appspot.com/x/repro.c?x=13fd185b280000'
$ gcc repro.c -lpthread -static -o repro
$ scp -P 10022 -o UserKnownHostsFile=/dev/null  -o StrictHostKeyChecking=no -o IdentitiesOnly=yes ./repro root@127.0.0.1:/root/
$ ssh -p 10022 -o UserKnownHostsFile=/dev/null  -o StrictHostKeyChecking=no -o IdentitiesOnly=yes root@127.0.0.1 'chmod +x ./repro && ./repro'
```

等待一分钟，注意 qemu 串口输出中的崩溃报告：

```
[   91.956238][   T81] ------------[ cut here ]------------
[   91.957508][   T81] kernel BUG at fs/hfsplus/bnode.c:618!
[   91.958645][   T81] invalid opcode: 0000 [#1] PREEMPT SMP KASAN
[   91.959861][   T81] CPU: 0 PID: 81 Comm: kworker/u5:3 Not tainted 6.4.0-rc6-syzkaller-00195-g40f71e7cd3c6 #0
```


#### 直接运行 syz 复现器

对于某些 bug，可能没有 C 复现器，或者 C 复现器不够可靠。在这种情况下，`syz` 复现器可能会很有用。

你首先需要 [Checkout 并构建](/docs/linux/setup.md#go-and-syzkaller) syzkaller。最快的方法如下（假设你的机器上已安装并配置好 Docker）：


```
$ git clone https://github.com/google/syzkaller.git
$ cd syzkaller
$ ./tools/syz-env make
```

然后像上一节一样启动虚拟机。

下载并运行 syz 复现器：

```
$ wget -O 'repro.syz' 'https://syzkaller.appspot.com/x/repro.syz?x=142e7287280000'
$ scp -P 10022 -o UserKnownHostsFile=/dev/null  -o StrictHostKeyChecking=no -o IdentitiesOnly=yes ./bin/linux_amd64/* ./repro.syz root@127.0.0.1:/root/
$ ssh -p 10022 -o UserKnownHostsFile=/dev/null  -o StrictHostKeyChecking=no -o IdentitiesOnly=yes root@127.0.0.1 './syz-execprog -enable=all -repeat=0 -procs=6 ./repro.syz'
```

稍后，你将在虚拟机的串口输出中看到相同的错误报告。

上述命令在虚拟机内部执行 `./syz-execprog -enable=all -repeat=0 -procs=6 ./repro.syz` 命令。更多详情请参阅[此文档](/docs/executing_syzkaller_programs.md)。

#### 使用 `tools/syz-crush` 工具

`syz-crush` 工具可以自动化上述步骤：它会设置并启动一个虚拟机池，并在其中运行给定的 `C` 或 `syz` 复现器。

首先，下载磁盘镜像和复现器（参见上述说明）。

然后，进入 syzkaller 检出目录并构建 `syz-crush` 工具：

```
$ make crush
```

准备一个配置文件（例如 `config.json`）：

```
{
    "name": "test",
    "http": "0.0.0.0:0",
    "target": "linux/amd64",
    "image": "/tmp/disk-40f71e7c.raw",
    "syzkaller": "/tmp/syzkaller",
    "workdir": "/tmp/syzkaller/workdir",
    "type": "qemu",
    "procs": 6,
    "vm": {
      "count": 5,
      "cmdline": "root=/dev/sda1",
      "cpu": 2,
      "mem": 2048,
      "qemu_args": "-machine pc-q35-7.1 -enable-kvm"
    }
}
```

你需要将 `/tmp/syzkaller` 替换为你的 syzkaller 检出目录的位置，并将 `/tmp/disk-40f71e7c.raw` 替换为可启动磁盘镜像的位置。

运行该工具：

```
$ mkdir workdir
$ ./bin/syz-crush -config config.json repro.syz
```


### 问题

#### 错误无法复现

如果 `C` 复现器不起作用，请尝试运行 `syz` 复现器。

如果仍然不成功，这可能属于比较罕见的情况，即执行环境变得至关重要。Syzbot 在 GCE 虚拟机上对内核进行模糊测试，这些虚拟机的指令集/执行速度可能与本地运行的 qemu 虚拟机不同。这些差异对于生成的复现器可能是至关重要的。

不幸的是，没有通用的解决方案。

请注意，你随时可以要求 syzbot [应用你的 git 补丁并重新运行复现器](/docs/syzbot.md#testing-patches)。它将在最初发现 bug 的相同 GCE 环境中运行。

另请参阅[此文档](/docs/syzbot.md#crash-does-not-reproduce)。

#### 资源无法下载

Syzbot 的可下载资源不会被永久存储。Syzbot 会一直保留它们，直到错误被修复或标记为无效，然后再保留 30 天。

因此，如果你无法通过邮件中的链接下载资源，这可能表明该错误实际上已不再值得关注。

#### Qemu 无法启动

一个[最近的 qemu 问题](https://lore.kernel.org/qemu-devel/da39abab9785aea2a2e7652ed6403b6268aeb31f.camel@linux.ibm.com/)可能会阻止它启动大型内核镜像。将 `-machine pc-q35-7.1` 添加到 qemu 参数中可以解决此问题。