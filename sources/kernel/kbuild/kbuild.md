---
status: translating
title: "Kbuild"
author: Linux Kernel Community
collector: tttturtle-russ
collected_date: 20240425
translator: estelledc
translated_date: 20250421
priority: 10
link: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/kbuild/kbuild.rst
---

# Kbuild

## 输出文件

### modules.order

此文件记录了模块在 Makefile 中出现的顺序。modprobe 使用此文件来确定性地解析匹配多个模块的别名。

### modules.builtin

此文件列出了所有内置于内核的模块。当 modprobe 尝试加载一个内置模块时，会使用此文件以避免失败。

### modules.builtin.modinfo

此文件包含所有内置于内核的模块的 modinfo 信息。与单独模块的 modinfo 不同，所有字段都以模块名称为前缀。

## 环境变量

### KCPPFLAGS

预处理时传递的附加选项。这些预处理选项将在所有 kbuild 进行预处理的场合使用，包括构建 C 文件和汇编器文件。

### KAFLAGS

汇编器的附加选项（用于内置模块和外部模块）。

### AFLAGS_MODULE

模块的附加汇编器选项。

### AFLAGS_KERNEL

内置模块的附加汇编器选项。

### KCFLAGS

C 编译器的附加选项（用于内置模块和外部模块）。

### KRUSTFLAGS

Rust 编译器的附加选项（用于内置模块和外部模块）。

### CFLAGS_KERNEL

使用 $(CC) 编译内置代码时的附加选项。

### CFLAGS_MODULE

用于 $(CC) 的附加模块特定选项。

### RUSTFLAGS_KERNEL

使用 $(RUSTC) 编译内置代码时的附加选项。

### RUSTFLAGS_MODULE

用于 $(RUSTC) 的附加模块特定选项。

### LDFLAGS_MODULE

链接模块时用于 $(LD) 的附加选项。

### HOSTCFLAGS

构建主机程序时传递给 $(HOSTCC) 的附加标志。

### HOSTCXXFLAGS

构建主机程序时传递给 $(HOSTCXX) 的附加标志。

### HOSTRUSTFLAGS

构建主机程序时传递给 $(HOSTRUSTC) 的附加标志。

### HOSTLDFLAGS

链接主机程序时传递的附加标志。

### HOSTLDLIBS

构建主机程序时链接的附加库。

### USERCFLAGS

编译用户程序时用于 $(CC) 的附加选项。

### USERLDFLAGS

链接用户程序时用于 $(LD) 的附加选项。用户程序使用 CC 进行链接，因此 $(USERLDFLAGS) 应包含 "-Wl," 前缀（如适用）。

### KBUILD_KCONFIG

将顶层 Kconfig 文件设置为此环境变量的值。默认名称是 "Kconfig"。

### KBUILD_VERBOSE

设置 kbuild 的详细程度。可以分配与 "V=..." 相同的值。

完整列表请参见 make help。

设置 "V=..." 优先于 KBUILD_VERBOSE。

### KBUILD_EXTMOD

构建外部模块时，设置查找内核源代码的目录。

设置 "M=..." 优先于 KBUILD_EXTMOD。

### KBUILD_OUTPUT

构建内核时指定输出目录。

输出目录也可以使用 "O=..." 指定。

设置 "O=..." 优先于 KBUILD_OUTPUT。

### KBUILD_EXTRA_WARN

指定额外的构建检查。可以通过命令行传递 W=... 来分配相同的值。

支持的值列表请参见 make help。

设置 "W=..." 优先于 KBUILD_EXTRA_WARN。

### KBUILD_DEBARCH

对于 deb-pkg 目标，允许覆盖 deb-pkg 部署的正常启发式方法。通常，deb-pkg 尝试根据 UTS_MACHINE 变量以及在某些架构上的内核配置来猜测正确的架构。KBUILD_DEBARCH 的值被假定（不检查）为有效的 Debian 架构。

### KDOCFLAGS

指定内核文档检查期间的额外（警告/错误）标志，有关支持的标志，请参见 scripts/kernel-doc。请注意，这目前不适用于文档构建。

### ARCH

将 ARCH 设置为要构建的架构。

在大多数情况下，架构的名称与 arch/ 目录中的目录名称相同。

但是一些架构如 x86 和 sparc 有别名。

- x86：32 位为 i386，64 位为 x86_64
- parisc：64 位为 parisc64
- sparc：32 位为 sparc32，64 位为 sparc64

### CROSS_COMPILE

指定二进制工具文件名的可选固定部分。CROSS_COMPILE 可以是文件名的一部分或完整路径。

CROSS_COMPILE 在某些设置中也用于 ccache。

### CF

sparse 的附加选项。

CF 通常在命令行上这样使用：

    make CF=-Wbitwise C=2

### INSTALL_PATH

INSTALL_PATH 指定放置更新的内核和系统映射镜像的位置。默认是 /boot，但你可以设置为其他值。

### INSTALLKERNEL

使用 "make install" 时调用的安装脚本。默认名称是 "installkernel"。

该脚本将使用以下参数调用：

> - $1 - 内核版本
> - $2 - 内核映像文件
> - $3 - 内核映射文件
> - $4 - 默认安装路径（如果为空则使用根目录）

"make install" 的实现是特定于架构的，可能与上述不同。

提供 INSTALLKERNEL 是为了在交叉编译内核时能够指定自定义安装程序。

### MODLIB

指定安装模块的位置。默认值是：

    $(INSTALL_MOD_PATH)/lib/modules/$(KERNELRELEASE)

可以覆盖该值，在这种情况下将忽略默认值。

### INSTALL_MOD_PATH

INSTALL_MOD_PATH 为 MODLIB 指定一个前缀，用于构建根所需的模块目录重定位。这不是在 makefile 中定义的，但如果需要，可以将该参数传递给 make。

### INSTALL_MOD_STRIP

如果定义了 INSTALL_MOD_STRIP，将导致模块在安装后被剥离。如果 INSTALL_MOD_STRIP 为 '1'，则将使用默认选项 --strip-debug。否则，INSTALL_MOD_STRIP 值将用作 strip 命令的选项。

### INSTALL_HDR_PATH

INSTALL_HDR_PATH 指定执行 "make headers*" 时安装用户空间头文件的位置。

默认值是：

    $(objtree)/usr

$(objtree) 是保存输出文件的目录。输出目录通常使用命令行上的 "O=..." 设置。

可以覆盖该值，在这种情况下将忽略默认值。

### INSTALL_DTBS_PATH

INSTALL_DTBS_PATH 指定安装设备树 blob 的位置，用于构建根所需的重定位。这不是在 makefile 中定义的，但如果需要，可以将该参数传递给 make。

### KBUILD_ABS_SRCTREE

Kbuild 在可能的情况下使用相对路径指向树。例如，在源代码树中构建时，源树路径为 '.'

设置此标志请求 Kbuild 使用绝对路径指向源树。这样做有一些有用的情况，例如生成具有绝对路径条目的标记文件等。

### KBUILD_SIGN_PIN

如果私钥需要，此变量允许在签署内核模块时将密码或 PIN 传递给 sign-file 实用程序。

### KBUILD_MODPOST_WARN

可以设置 KBUILD_MODPOST_WARN 以避免在最终模块链接阶段出现未定义符号的错误。它将这些错误变为警告。

### KBUILD_MODPOST_NOFINAL

可以设置 KBUILD_MODPOST_NOFINAL 以跳过模块的最终链接。这仅用于加速测试编译。

### KBUILD_EXTRA_SYMBOLS

用于使用其他模块符号的模块。更多详情请参见 modules.rst。

### ALLSOURCE_ARCHS

对于 tags/TAGS/cscope 目标，你可以指定要包含在数据库中的多个架构，用空格分隔。例如：

    $ make ALLSOURCE_ARCHS="x86 mips arm" tags

要获取所有可用的架构，你也可以指定 all。例如：

    $ make ALLSOURCE_ARCHS=all tags

### IGNORE_DIRS

对于 tags/TAGS/cscope 目标，你可以选择哪些目录不会包含在数据库中，用空格分隔。例如：

    $ make IGNORE_DIRS="drivers/gpu/drm/radeon tools" cscope

### KBUILD_BUILD_TIMESTAMP

将其设置为日期字符串会覆盖 UTS_VERSION 定义中使用的时间戳（运行内核中的 uname -v）。该值必须是可以传递给 date -d 的字符串。默认值是构建期间某个时刻的 date 命令输出。

### KBUILD_BUILD_USER, KBUILD_BUILD_HOST

这两个变量允许覆盖启动时和 /proc/version 中显示的 <user@host> 字符串。默认值分别是 whoami 和 host 命令的输出。

### LLVM

如果此变量设置为 1，Kbuild 将使用 Clang 和 LLVM 实用程序而不是 GCC 和 GNU binutils 来构建内核。