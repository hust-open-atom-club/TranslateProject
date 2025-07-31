---
status: proofread
title: "How to reproduce crashes"
author: Syzkaller Community
collector: jxlpzqc
translator: CAICAIIs
collected_date: 20240314
translated_date: 20250218
proofreader: SheepFifteen
proofread_date: 20250722
priority: 10
link: https://github.com/google/syzkaller/blob/master/docs/reproducing_crashes.md
---

# 如何复现 syzkaller 崩溃

## 使用 C 语言复现程序

如果该漏洞是由 syzbot 报告的，首先需要构建该工具当时所用的内核版本。syzbot 会在报告里提供必要的信息：

```
Hello,

syzbot found the following issue on:

HEAD commit:    ae58226b89ac Add linux-next specific files for 20241118
git tree:       linux-next
console+strace: https://syzkaller.appspot.com/x/log.txt?x=14a67378580000
kernel config:  https://syzkaller.appspot.com/x/.config?x=45719eec4c74e6ba
dashboard link: https://syzkaller.appspot.com/bug?extid=2159cbb522b02847c053
compiler:       Debian clang version 15.0.6, GNU ld (GNU Binutils for Debian) 2.40
syz repro:      https://syzkaller.appspot.com/x/repro.syz?x=137beac0580000
C reproducer:   https://syzkaller.appspot.com/x/repro.c?x=177beac0580000
```

在这种情况下，你需要执行以下操作：

```bash
$ git checkout ae58226b89ac
$ wget -O '.config' 'https://syzkaller.appspot.com/x/.config?x=45719eec4c74e6ba`
$ make CC=clang LD=ld.lld olddefconfig
$ make CC=clang LD=ld.lld -j$(nproc)
```

你还需要一个可启动的磁盘镜像。目前 syzbot 使用基于 Buildroot 的小型镜像，你可以选择在本地构建[build locally](/tools/create-buildroot-image.sh)或直接下载[download](https://storage.googleapis.com/syzkaller/images/buildroot_amd64_2024.09.gz)。

下载并构建复现环境：

```bash
$ wget -O 'repro.c' 'https://syzkaller.appspot.com/x/repro.c?x=177beac0580000'
$ gcc repro.c -lpthread -static -o repro
```

运行虚拟机：

```bash
$ export DISK_IMAGE='buildroot_amd64_2024.09'
$ qemu-system-x86_64 -m 2G -smp 2,sockets=2,cores=1 -drive file=$DISK_IMAGE,format=raw -net nic,model=e1000 -net user,host=10.0.2.10,hostfwd=tcp::10022-:22 -enable-kvm -nographic -snapshot -machine pc-q35-7.1
```

运行复现程序：

```bash
$ scp -P 10022 -o UserKnownHostsFile=/dev/null  -o StrictHostKeyChecking=no -o IdentitiesOnly=yes ./repro root@127.0.0.1:/root/
$ ssh -p 10022 -o UserKnownHostsFile=/dev/null  -o StrictHostKeyChecking=no -o IdentitiesOnly=yes root@127.0.0.1 'chmod +x ./repro && ./repro'
```

## 使用 Syz 复现程序

Syzkaller 总是首先生成一个" Syz "复现程序（使用 [Syzkaller
DSL](/docs/program_syntax.md) 编写）。随后，Syzkaller 会尝试将这个 Syz 复现程序转换为 C 语言代码。但由于 syz-executor 运行环境与 C 复现程序模拟环境之间存在差异，这个转换过程并不总是能成功。因此，在某些情况下，可能只有 Syz 版本的复现程序可用。

要在本地运行 Syz 复现程序，所需的操作步骤与前一节基本相同。

下载并[构建 syzkaller](/docs/linux/setup.md#go-and-syzkaller)。若已安装 Docker，步骤会更简单：

```bash
$ git clone https://github.com/google/syzkaller.git
$ cd syzkaller
$ ./tools/syz-env make
```

按照上文所述步骤构建内核并启动虚拟机。

下载复现程序：

```bash
$ wget -O 'repro.syz' 'https://syzkaller.appspot.com/x/repro.syz?x=137beac0580000'
```

将复现程序和 syzkaller 二进制文件复制到测试机：

```bash
$ export SYZKALLER_PATH="~/syzkaller"
$ scp -P 10022 -o UserKnownHostsFile=/dev/null  -o StrictHostKeyChecking=no -o IdentitiesOnly=yes $SYZKALLER_PATH/bin/linux_amd64/* ./repro.syz root@127.0.0.1:/root/
```

现在您可以使用 `syz-execprog` 工具来真正执行程序。

```
$ ssh -p 10022 -o UserKnownHostsFile=/dev/null  -o StrictHostKeyChecking=no -o IdentitiesOnly=yes root@127.0.0.1 './syz-execprog -enable=all -repeat=0 -procs=6 ./repro.syz'
```

以下是 `syz-execprog` 工具的几个实用参数说明：

```
  -procs int
        指定并行执行的进程数量（默认值：1）
  -repeat int
    	设置程序重复执行次数（0表示无限循环，默认值：1）
  -sandbox string
    	指定模糊测试使用的沙箱类型（可选值：none/setuid/namespace，默认值："setuid"）
  -threaded
    	在执行器中启用线程模式（默认启用）
```

当设置 `-threaded=0` 时，所有系统调用将在同一线程中顺序执行；而 `-threaded=1` 则会强制每个系统调用在独立线程中执行，从而确保即使遇到阻塞式系统调用也能继续推进测试流程。

在 2021 年之前的版本中，`syz-execprog` 还支持以下附加参数:

```
  -collide
        强制系统调用并发执行以触发数据竞争（默认启用）
```

`-collide=1` 参数会强制在系统调用对并发执行时进行第二轮调用，以检测潜在的数据竞争问题。

从版本修订 [fd8caa54](https://github.com/google/syzkaller/commit/fd8caa5462e64f37cb9eebd75ffca1737dde447d) 开始，该行为已改由 [syzlang](/docs/program_syntax.md#async) 语言直接控制。如果您运行的是旧版本的复现程序，可能仍需显式设置 `-collide=1` 参数。

当您复现的程序包含如下格式的头部声明时：

```
# {Threaded:true Repeat:true RepeatTimes:0 Procs:8 Slowdown:1 Sandbox:none Leak:false NetInjection:true NetDevices:true NetReset:true Cgroups:true BinfmtMisc:true CloseFDs:true KCSAN:false DevlinkPCI:false USB:true VhciInjection:true Wifi:true IEEE802154:true Sysctl:true UseTmpDir:true HandleSegv:true Repro:false Trace:false LegacyOptions:{Collide:false Fault:false FaultCall:0 FaultNth:0}}
```

则需要根据头部参数显式配置 `syz-execprog` 的运行选项。具体对应关系如下：

- `Threaded/Procs/Sandbox` 参数直接对应 `-threaded/-procs/-sandbox` 命令行选项

- 若 `Repeat` 设置为 `true`，`syz-execprog` 需要添加 `-repeat=0` 参数

## 使用 ktest 工具

[ktest](https://evilpiepirate.org/git/ktest.git/tree/README.md) 是 Linux 内核测试套件，提供了一套简化本地测试的基础设施。

其中特别集成了 `syzbot-repro.ktest` 测试用例，能够自动化完成构建指定版本内核、启动虚拟机环境、获取 syzbot 漏洞报告详情、执行复现测试的流程。

​安装步骤如下：

```bash
$ git clone git://evilpiepirate.org/ktest.git
$ cd ktest
$ export KTEST_PATH=$(pwd)
$ sudo ./root_image init
$ sudo ./root_image create
$ cargo install --path $KTEST_PATH
```

复现 syzbot 漏洞流程如下：

```bash
$ cd ~/linux
$ git checkout <kernel-commit>
$ $KTEST_PATH/build-test-kernel run $KTEST_PATH/tests/syzbot-repro.ktest <bug-id>
```
​​
其中 `<bug-id>` 可从 syzbot 报告中获取，例如：

```
dashboard link: https://syzkaller.appspot.com/bug?extid=2159cbb522b02847c053
```

此处 `<bug-id>` 即为 `2159cbb522b02847c053`.

## 使用可下载资源

每个 syzbot 报告都会提供发现漏洞时使用的精确磁盘镜像、内核镜像和 vmlinux 文件。具体使用方法请参考[对应文档](/docs/syzbot_assets.md)。

### 从执行日志复现

虽然 syzbot 自动生成复现程序的过程已实现自动化，但在某些情况下仍无法精确定位到导致内核崩溃的单个程序。

#### 本地 syzkaller 实例
​​
管理器目录 `workdir/crashes` 中的崩溃日志包含崩溃前执行的程序。在并行模式（manager 配置中 `procs` 参数 > 1）下，导致崩溃的程序不一定紧邻崩溃记录，可能出现在更早的位置。

#### syzbot 报告
​​
提供的执行日志：

```
console output: https://syzkaller.appspot.com/x/log.txt?x=148914c0580000
```

### 手动制作复现程序

有两个工具可以帮助你定位并最小化导致崩溃的程序：`syz-execprog` 和 `syz-prog2c`。你可以分别通过 `make execprog` 和 `make prog2c` 来构建它们。

`syz-execprog` 可以执行单个 syzkaller 程序或一组程序，支持多种模式（单次执行或无限循环；线程模式/collide 模式；是否收集覆盖率）。

您可以先从崩溃日志中运行所有程序，检查是否确实会导致内核崩溃：

```bash
./syz-execprog -executor=./syz-executor -repeat=0 -procs=8 -cover=0 crash-log-file.txt
```

注意：`syz-execprog` 需在本地执行，因此您需要将 `syz-execprog` 和 `syz-executor` 拷贝到运行测试内核的虚拟机中执行。详情参考 [Using a Syz reproducer](#Using-a-Syz-reproducer) 一节。

要定位是哪一个程序触发了崩溃，您可以从 `crash-log-file.txt` 中逐个提取程序，并单独运行 `syz-execprog` 进行测试。

当您找到一个能触发崩溃的单独程序后，可以尝试以下方式进行最小化：

- 移除可疑系统调用（可以通过在行首添加 `#` 注释单行）

- 删除冗余的数据（例如将 `&(0x7f0000001000)="73656c6600"` 替换为 `&(0x7f0000001000)=nil`）

- 合并多个 mmap 调用为单个大内存映射

每次修改后，记得用 `syz-execprog` 工具测试最小化结果是否仍能触发崩溃。

在获得最小化程序后，使用 `./syz-execprog -threaded=0 -collide=0` 命令检查崩溃是否仍能在非线程模式下复现;若不可复现，则后续需要执行额外步骤。

使用 `syz-prog2c` 工具将程序转换为可执行的 C 源码。如果崩溃在 `-threaded=0 -collide=0` 模式下仍能复现，那么生成的 C 程序也应该能触发相同崩溃。

若上述方法无效，需模拟线程执行环境。可将各系统调用分配到独立线程中执行，示例参考：[https://groups.google.com/d/msg/syzkaller/fHZ42YrQM-Y/Z4Xf-BbUDgAJ](https://groups.google.com/d/msg/syzkaller/fHZ42YrQM-Y/Z4Xf-BbUDgAJ).

`syz-repro` 工具可部分自动化上述流程。您需要提供 manager 的配置文件和崩溃报告文件，可参考[示例配置文件](/pkg/mgrconfig/testdata/qemu-example.cfg)：

```bash
./syz-repro -config my.cfg crash-qemu-1-1455745459265726910
```

它会尝试定位并最小化触发崩溃的程序。由于影响复现的因素众多，其效果并不总是理想。
