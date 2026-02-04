---
status: proofread
title: "Darwin/XNU"
author: Syzkaller Community
collector: jxlpzqc
translator: CAICAIIs
collected_date: 20240314
translated_date: 20250221
proofreader: yinchunyuan
proofread_date: 20250926
publisher: zqmz
published_date: 20260129
link: https://github.com/google/syzkaller/blob/master/docs/darwin/README.md
---

# Darwin/XNU

事实证明，在不使用 macOS 附带的任何专有内核扩展的情况下，从 XNU 源代码构建可用于模糊测试的虚拟机镜像异常困难。因此，本指南基于标准的 macOS 安装。不幸的是，苹果的 macOS 最终用户许可协议（EULA）使得此方法不适合在 Google Cloud Platform 上对 XNU 进行模糊测试。

## 准备 macOS 安装磁盘镜像

如今，苹果主要通过 Mac App Store 分发 macOS 更新。但这只能获取最新版本。幸运的是，Munki 社区维护了一个脚本，允许我们从命令行下载指定版本的 macOS 构建。

我们需要选择与目标内核版本相近的 macOS 构建。您可以在[此页面查看苹果最新的源代码发布](https://opensource.apple.com/)。在撰写本文时，20G71 版本的 11.5 可用，并且与 11.5 的 xnu 源代码发布兼容。Munki 下载脚本仅能识别 macOS 版本和构建号，而无法识别 XNU 版本。有时您可能下载了匹配的 macOS 版本，但构建的内核仍无法启动。其中一个常见原因是内核与引导加载程序版本不匹配。获取正确的构建可能需要反复尝试。有时正确的构建可能已不可用。撰写本文时，可用的 11.5 构建 20G71 可与 11.5 的 xnu 源代码配合使用。

在下面的说明中，我将假定您已在主机 macOS 上安装了 VMware Fusion 以创建虚拟机磁盘映像。选择 Fusion 的原因是它允许我们直接拖放下载的 macOS 安装器应用程序。如果您想使用 Qemu 等其他工具，请参考[苹果官方创建可引导安装介质的方法](https://support.apple.com/en-us/HT201372)。在使用苹果方法生成可引导 ISO 时遇到问题的情况下，我通常会使用 Fusion 创建安装介质。

此外，以下说明要求您在虚拟机中禁用系统完整性保护（System Integrity Protection）和认证根（Authenticated Root）。我们需要禁用这些功能以运行稍后构建的自定义内核。这些功能的简要说明：
- 在 OS X 10.11 中，苹果引入了系统完整性保护（SIP），该功能（除其他作用外）限制 root 用户在正常操作期间对某些关键系统目录的写入。我们需要禁用它以将内核写入磁盘
- 在 macOS 11 中，苹果引入了认证根。从该版本开始，系统仅挂载经过加密签名的只读根文件系统快照。我们需要禁用它以重新挂载可写版本并创建新的可引导快照供日后使用

**快速操作指南：创建虚拟机镜像**
- [克隆 Munkis 的 macadmin-script 仓库](https://github.com/munki/macadmin-scripts)
- 运行 `installinstallmacos.py` 并选择与最新内核源代码匹配的版本
- 挂载下载的 `Install_macOS_<版本>-<构建号>.dmg`
- 打开 VMware Fusion 并通过文件菜单创建新虚拟机
- 将已挂载磁盘镜像中的 `Install macOS <名称>` 应用程序拖放至「选择安装方式」对话框
- 建议此时提升虚拟机的 CPU 和内存配置
- 在 macOS 安装器中选择语言后，打开「实用工具 -> 终端」
- 输入 `csrutil disable` 禁用系统完整性保护
- 输入 `csrutil authenticated-root disable` 禁用认证根
- 使用 Cmd+Q 退出终端应用
- 完成 macOS 安装，创建名为 `user` 的用户。如果无可用磁盘安装，可能需要先使用磁盘工具格式化虚拟磁盘
- 进入「系统偏好设置 -> 软件更新 -> 高级…」取消勾选「检查更新」
- 进入「系统偏好设置 -> 节能」勾选「防止显示器关闭时自动进入睡眠」
- 进入「系统偏好设置 -> 共享」勾选「远程登录」以启用 sshd
- 将 SSH 公钥添加到用户和 root 的 authorized_keys 文件
- 可选：通过 launchd 禁用 WindowServer 等非必要服务（注意将失去 GUI）：`sudo launchctl unload -w /System/Library/LaunchDaemons/com.apple.WindowServer.plist`

检查各项配置是否正确：
![显示干净 macOS 11.5 构建 20G71 安装的截图，包含 xnu-7195.141.2~5/RELEASE_X86_64 内核、已禁用系统完整性保护和认证根](https://i.imgur.com/xYJ7XgF.png)

## 准备适用于模糊测试的优化内核

您可能会疑惑为何不使用苹果内核开发套件（KDK）中的某个预编译内核。因为这些内核未启用 KSANCOV 功能标志。KSANCOV 是苹果提供的 API，允许用户空间请求内核追踪指定线程访问的内核代码，并将这些信息暴露给用户空间。Syzkaller 需要这些信息才能有效进行模糊测试。

幸运的是，[afrojer@](https://twitter.com/afrojer) 定期在其博客更新从源代码构建 XNU 并在 macOS 上安装的指南。撰写本文时，他的指南落后三个次要版本。[最新指南适用于 macOS 11.2](https://web.archive.org/web/20210524205524/https://kernelshaman.blogspot.com/2021/02/building-xnu-for-macos-112-intel-apple.html)。本文将介绍一些必要的额外修改。

构建和测试适用于模糊测试的 XNU：
- 从[苹果 Xcode 版本存档（需 Apple ID 登录）](https://developer.apple.com/download/all/?q=xcode)中下载较新的 Xcode 至虚拟机。本文使用 Xcode 12.5（12.5.1 和 13 beta 4 存在问题）
- 解压 `Xcode_<版本>.xip`，此过程较耗时，建议喝杯咖啡 ⏳
- 将解压的 Xcode 应用程序拖放至虚拟机的应用程序文件夹
- 启动 Xcode，同意许可协议并在安装完成后退出
- 在用户主目录创建并进入 `kernel` 目录
- 下载 afrojer@ 的 Makefile：`curl https://jeremya.com/sw/Makefile.xnudeps > Makefile.xnudeps`（注意该文件未版本化，始终原地更新）[本文撰写时的存档链接](https://web.archive.org/web/20210210224511/https://jeremya.com/sw/Makefile.xnudeps)
- `make -f Makefile.xnudeps macos_version=11.5 xnudeps` 将获取构建 11.5 XNU 的依赖项。[参考原始博客文章获取特定版本依赖项的详细信息](https://kernelshaman.blogspot.com/2021/02/building-xnu-for-macos-112-intel-apple.html)
- 进入 `~/kernel/xnu-<版本>/`
- 手动或通过 `git am` 应用[必要的 XNU 补丁](0001-fuzzing.patch)。使用 git 应用需要先初始化仓库并提交所有文件（建议操作以便跟踪后续修改）
    - `MakeInc.def` 和 `kasan.c` 的补丁是构建 KASAN 内核所必需的。KASAN（KernelAddressSANitizer）是用于在运行时检测内核内存安全问题的功能
    - `ksancov.h` 的补丁是构建 syzkaller executor 所必需的。由于 executor 使用 C++，需避免 void 指针转换
    - `cpuid.c` 和 `cpu_threads.c` 的补丁是使内核在 Qemu 上启动所必需的

- 运行 `mount` 查看根挂载设备。示例输出：`/dev/disk2s5s1 on / (apfs, sealed, local, read-only, journaled)`。记录设备名（忽略最后 sN 部分），本例为 `/dev/disk2s5`
- 进入 `~/kernel/xnu-<版本>/` 并运行以下命令（替换 `<your_disk>`）以构建和安装内核：

```
mkdir -p BUILD/mnt
sudo mount -o nobrowse -t apfs /dev/<your_disk> $PWD/BUILD/mnt

make SDKROOT=macosx TARGET_CONFIGS="KASAN X86_64 NONE" KSANCOV=1

kmutil create -a x86_64 -Z -n boot sys \
-B BUILD/BootKernelExtensions.kc.kasan \
-S BUILD/SystemKernelExtensions.kc.kasan \
-k BUILD/obj/kernel.kasan \
--elide-identifier com.apple.driver.AppleIntelTGLGraphicsFramebuffer

sudo ditto BUILD/BootKernelExtensions.kc.kasan "$PWD/BUILD/mnt/System/Library/KernelCollections/"
sudo ditto BUILD/SystemKernelExtensions.kc.kasan "$PWD/BUILD/mnt/System/Library/KernelCollections/"
sudo ditto BUILD/obj/kernel.kasan "$PWD/BUILD/mnt/System/Library/Kernels/"

sudo bless --folder $PWD/BUILD/mnt/System/Library/CoreServices --bootefi --create-snapshot
sudo nvram boot-args="-v kcsuffix=kasan wlan.skywalk.enable=0"
```

重启后运行 `uname -a` 应显示新内核：`Darwin users-Mac.local 20.6.0 Darwin Kernel Version 20.6.0: Mon Aug  9 16:12:43 PDT 2021; user:xnu-7195.141.2/BUILD/obj/KASAN_X86_64 x86_64`

为高效进行模糊测试，需要在宿主机准备内核二进制文件、符号表和源代码。执行以下复制操作：

```
mkdir -p ~/115/src/Users/user/kernel/ ~/115/obj
rsync -r mac:/Users/user/kernel/xnu-7195.141.2 ~/115/src/Users/user/kernel/
mv ~/115/src/Users/user/kernel/xnu-7195.141.2/BUILD/obj/KASAN_X86_64/kernel.kasan ~/115/obj/
mv ~/115/src/Users/user/kernel/xnu-7195.141.2/BUILD/obj/KASAN_X86_64/kernel.kasan.dSYM/ ~/115/obj/
```

## 为 Qemu 准备虚拟机

尽管 Mac 电脑是带有 EFI 的 AMD64 架构机器（至少本文涉及的机型是），但它们并不是完全兼容 IBM PC 的。到目前为止，VMware Fusion 为我们完成了虚拟化 macOS 所需的所有复杂操作，但 qemu-system-x86_64 却没有。

为使 macOS 启动，我们首先使用 OVMF（基于 tianocore 的 Qemu UEFI）启动 Qemu。接着引导 OpenCore，后者将执行某些技巧使得链式加载苹果原生 AMD64 EFI 引导加载程序成为可能。它还会进行二进制内核补丁操作，以便在需要时加载 macOS 附带的 RELEASE 内核。

OpenCore 具有较高可配置性，但我们不关心真实的硬件。[本文使用此预构建版本，已配置为在 Qemu 中工作](https://github.com/thenickdude/KVM-Opencore/releases)。我们可以直接用该仓库镜像中的 EFI 分区覆盖虚拟机的 EFI 分区。

首先确定要覆盖的分区。在 macOS 虚拟机中（当前仍通过 Fusion 启动）执行以下命令，可见 EFI 分区位于 `/dev/disk0s1`：

```
user@users-Mac ~ % diskutil list
/dev/disk0 (internal, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      GUID_partition_scheme                        *69.8 GB    disk0
   1:                        EFI EFI                     209.7 MB   disk0s1
   2:                 Apple_APFS Container disk1         69.6 GB    disk0s2

/dev/disk1 (synthesized):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      APFS Container Scheme -                      +69.6 GB    disk1
                                 Physical Store disk0s2
   1:                APFS Volume macos - Data            43.2 GB    disk1s1
   2:                APFS Volume Preboot                 385.6 MB   disk1s2
   3:                APFS Volume Recovery                623.2 MB   disk1s3
   4:                APFS Volume VM                      1.1 MB     disk1s4
   5:                APFS Volume macos                   16.0 GB    disk1s5
   6:              APFS Snapshot com.apple.bless.4099... 16.0 GB    disk1s5s1
```

下载 [OpenCore-v13.iso.gz](https://github.com/thenickdude/KVM-Opencore/releases/download/v13/OpenCore-v13.iso.gz) 并通过 `gzip -d OpenCore-v13.iso.gz` 解压。查看分区映射以确定镜像块大小及 EFI 分区偏移量和大小：


```
user@users-Mac ~ % hdiutil pmap ./OpenCore-v13.iso

MEDIA: ""; Size 150 MB [307200 x 512]; Max Transfer Blocks 2048
SCHEME: 1 GPT, "GPT Partition Scheme" [16]
SECTION: 1 Type:'MAP'; Size 150 MB [307200 x 512]; Offset 34 Blocks (307133 + 67) x 512
ID Type                 Offset       Size         Name                      (1)
-- -------------------- ------------ ------------ -------------------- --------
 1 EFI                            40       307120 disk image
```

组合这些值执行 dd 命令：`sudo dd if=./OpenCore-v13.iso of=/dev/disk0s1 bs=512 iseek=40 count=307120`

挂载 EFI 磁盘：`sudo mount -t msdos /dev/disk0s1 ~/mnt/`。需微调 OpenCore 配置文件：禁用引导设备选择器（以便全自动启动虚拟机），并在此处设置引导参数（在 OpenCore 中需通过 config.plist 设置，而非 VMware Fusion 中的 nvram 等工具）。

编辑 `~/mnt/EFI/OC/config.plist`：

```diff
index 8537ca8..a46de97 100755
--- a/Users/user/mnt/EFI/OC/config.plist
+++ b/Users/user/mnt/EFI/OC/config.plist
@@ -799,7 +799,7 @@
 			<key>PollAppleHotKeys</key>
 			<true/>
 			<key>ShowPicker</key>
-			<true/>
+			<false/>
 			<key>TakeoffDelay</key>
 			<integer>0</integer>
 			<key>Timeout</key>
@@ -944,7 +944,7 @@
 				<key>SystemAudioVolume</key>
 				<data>Rg==</data>
 				<key>boot-args</key>
-				<string>keepsyms=1</string>
+				<string>-v kcsuffix=kasan wlan.skywalk.enable=0 keepsyms=1 debug=0x100008 kasan.checks=4294967295</string>
 				<key>csr-active-config</key>
 				<data>Jg8=</data>
 				<key>prev-lang:kbd</key>

```

此时仍可通过 Fusion 启动虚拟机，但 OpenCore 将被忽略，这属正常现象。

## 准备 isa-applesmc

macOS 启动时会通过读取系统管理控制器（SMC）的值验证是否运行在正版 Mac 上。我们需要获取该值并在后续 Qemu 启动时传递。获取方法：
- [从此站点下载 smc_read.c 源代码](https://web.archive.org/web/20200603015401/http://www.osxbook.com/book/bonus/chapter7/tpmdrmmyth/)
- 编译：`gcc -Wall -o smc_read smc_read.c -framework IOKit`
- 运行：`./smc_read`

输出结果将作为 `<YOUR_APPLE_SMC_HERE>` 的替代值用于后续步骤。


## 通过 Qemu 启动 macOS

- 在宿主机 macOS 上安装 [Homebrew](https://brew.sh/)
- 在宿主机 macOS 上安装 `qemu`
- 转换虚拟机磁盘为 qcow2 格式（宿主机的磁盘路径类似 `~/Virtual\ Machines.localized/macOS-11.5-20G71.vmwarevm/Virtual\ Disk.vmdk`）：`qemu-img convert -U ./Virtual\ Disk.vmdk -O qcow2 ~/115/mac_hdd.qcow`
- 由于 Homebrew 未提供 OVMF，需[从 Ubuntu 下载 `ovmf` 包](https://packages.ubuntu.com/hirsute/ovmf)。解压：`ar -xv ./ovmf_2020.11-4_all.deb` 和 `tar -xvf ./data.tar.xz`，最后移动：`mv ./usr/share/OVMF /usr/local/share/OVMF`

启动 Qemu（替换 `<YOUR_APPLE_SMC_HERE>` 和磁盘路径中的用户名）：
```
qemu-system-x86_64 \
  -device isa-applesmc,osk="<YOUR_APPLE_SMC_HERE>" \
  -accel hvf -machine q35 -smp "2",cores="2",sockets="1" -m "4096" \
  -cpu Penryn,vendor=GenuineIntel,+invtsc,vmware-cpuid-freq=on,"+pcid,+ssse3,+sse4.2,+popcnt,+avx,+aes,+xsave,+xsaveopt,check" \
  -drive if=pflash,format=raw,readonly=on,file="/usr/local/share/OVMF/OVMF_CODE.fd" \
  -drive if=pflash,format=raw,readonly=on,file="/usr/local/share/OVMF/OVMF_VARS.fd" \
  -device ich9-intel-hda -device hda-duplex -device ich9-ahci,id=sata \
  -device ide-hd,bus=sata.4,drive=MacHDD \
  -drive id=MacHDD,if=none,file="/Users/user/115/macos_11_5.qcow",format=qcow2 \
  -netdev user,id=net0,hostfwd=tcp::1042-:22, -device e1000-82545em,netdev=net0,id=net0 \
  -device usb-ehci,id=ehci -usb -device usb-kbd -device usb-tablet \
  -monitor stdio -vga vmware
```

您应该既能看到 macOS 界面，也能通过 `ssh user@localhost -p 1042` 连接。确认已启动至 KASAN 内核：

```
user@users-Mac ~ % uname -a
Darwin users-Mac.local 20.6.0 Darwin Kernel Version 20.6.0: Mon Aug  9 16:12:43 PDT 2021; user:xnu-7195.141.2/BUILD/obj/KASAN_X86_64 x86_64
```

现在关闭虚拟机。我们很快会让 syzkaller 重新启动它。

## 构建 Syzkaller

- 通过 homebrew 安装 `go`
- 在 .zshrc 中添加如下内容：
```
export GOPATH=/Users/user/go
export PATH=$GOPATH/bin:$PATH
```
- 重新登录并按如下方式构建 syzkaller：
```
git clone https://github.com/google/syzkaller
cd syzkaller
make HOSTOS=darwin HOSTARCH=amd64 TARGETOS=darwin TARGETARCH=amd64 SOURCEDIR=/Users/user/115/src/Users/user/kernel/xnu-7195.141.2
```

## 使用 Syzkaller 进行模糊测试

- 需要 g++ 来支持 C 重现用例的编译。通过 homebrew 安装 `gcc@11`
- 需要 binutils 中的 addr2line 来支持 `/cover` 端点。通过 homebrew 安装 `binutils`
- 在 .zshrc 中添加 `export PATH="/usr/local/opt/binutils/bin:$PATH"`。重启 shell
- 将以下内容保存为 `~/115/syzkaller.cfg`。记得替换 `<YOUR_APPLE_SMC_HERE>`：
```
{
    "target": "darwin/amd64",
    "http": "127.0.0.1:56741",
    "sshkey": "/Users/user/.ssh/id_macos115",
    "workdir": "/Users/user/sk_darwin/",
    "kernel_obj": "/Users/user/115/obj/",
    "kernel_src": "/Users/user/115/src/",
    "syzkaller": "/Users/user/go/src/github.com/google/syzkaller",
    "procs": 2,
    "type": "qemu",
    "cover": true,
    "image": "/Users/user/115/macos_11_5.qcow",
    "vm": {
        "count": 2,
        "cpu": 2,
        "mem": 4096,
        "efi_code_device": "/usr/local/share/OVMF/OVMF_CODE.fd",
        "efi_vars_device": "/usr/local/share/OVMF/OVMF_VARS.fd",
        "apple_smc_osk": "<YOUR_APPLE_SMC_HERE>"
    }
}
```

通过 `~/115/bin/syz-manager -config=/root/115/syzkaller.cfg` 启动 syzkaller，并在浏览器中打开 http://localhost:56741。
