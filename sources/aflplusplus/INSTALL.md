---
status: collected
title: "Building and installing AFL++"
author: AFLplusplus Community
collector: Souls-R
collected_date: 20240827
priority: 10
link: https://github.com/AFLplusplus/AFLplusplus/blob/stable/docs/INSTALL.md
---
# 构建与安装AFL++

## 基于x86平台的Linux

### 通过Docker安装：

您可以通过以下[Dockerfile](https://hctt.hust.openatom.club/posts/aflplusplus/Dockerfile)或从Docker Hub上获得AFL++的Docker镜像（适用于x86-64和arm64平台）：

```shell
docker pull aflplusplus/aflplusplus:latest
docker run -ti -v /location/of/your/target:/src aflplusplus/aflplusplus
```

执行上述代码后，镜像的stable分支将会被自动拉取。您可以在容器的/src目录中找到目标源代码。

*注：您也可以拉取**aflplusplus/aflplusplus:dev**分支（将上述aflplusplus/aflplusplus:latest替换为aflplusplus/aflplusplus:dev），它展示了AFL++的最新开发状态。*

### 自行构建：

如果您想自己构建 AFL++，您有很多选择。最简单的选择是构建并安装所有内容：

*注：根据您的系统（如Debian/Ubuntu/Kali/...）版本，您可以选择任意可用的llvm版本替换“-14”，我们建议使用llvm-13或更新的版本。*

```shell
sudo apt-get update
sudo apt-get install -y build-essential python3-dev automake cmake git flex bison libglib2.0-dev libpixman-1-dev python3-setuptools cargo libgtk-3-dev
# try to install llvm 14 and install the distro default if that fails
sudo apt-get install -y lld-14 llvm-14 llvm-14-dev clang-14 || sudo apt-get install -y lld llvm llvm-dev clang
sudo apt-get install -y gcc-$(gcc --version|head -n1|sed 's/\..*//'|sed 's/.* //')-plugin-dev libstdc++-$(gcc --version|head -n1|sed 's/\..*//'|sed 's/.* //')-dev
sudo apt-get install -y ninja-build # for QEMU mode
sudo apt-get install -y cpio libcapstone-dev # for Nyx mode
sudo apt-get install -y wget curl # for Frida mode
sudo apt-get install python3-pip # for Unicorn mode
git clone https://github.com/AFLplusplus/AFLplusplus
cd AFLplusplus
make distrib
sudo make install
```

建议您尽可能在您的Linux发行版中安装最新的gcc、clang和llvm-dev。

*注：**make distrib**将会同时构建FRIDA mode，QEMU mode和unicorn mode等。如果您只想要单独的AFL++，可以执行**make all**。如果您还想同时编译一些辅助工具但不需要纯二进制文件，就选择：*

```shell
make source-only
```

以下是可选的构建目标：

all：主要 AFL++ 二进制文件和 llvm/gcc 工具
binary-only: 仅二进制文件：frida_mode、nyx_mode、qemu_mode、frida_mode、unicorn_mode、coresight_mode、libdislocator、libtokencap
source-only：仅源码：nyx_mode、libdislocator、libtokencap
distrib：所有内容（包括二进制文件和源码）
man：通过程序的帮助选项创建简单的 man 页面
install：安装使用上述构建选项编译的所有内容
clean：清除所有已编译内容，不包括下载内容（除非未通过检验）
deepclean：清除所有内容，包括下载内容
code-format：格式化代码，当您准备提交和发送 PR 之前，请执行该操作！
tests：运行测试用例，确保所有功能都能正常运行
unit：执行单元测试（基于 cmocka）
help：显示以上这些构建选项

*[如果您使用的不是macOS](https://developer.apple.com/library/archive/qa/qa1118/_index.html)，您也可以通过**PERFORMANCE=1**参数来构建静态链接版本的AFL++二进制文件：*

```shell
make PERFORMANCE=1
```

以下是可选的构建选项：

PERFORMANCE - 使用性能选项编译，使二进制文件无法转移到其他系统。建议使用（macOS 除外）！
STATIC - 静态编译 AFL++（在 macOS 上无效）
CODE_COVERAGE - 编译目标，并给出代码覆盖率（请参阅 [README.llvm.md](https://hctt.hust.openatom.club/posts/aflplusplus/instrumentation/README.llvm.md)）<!-- 原文为compile the target for code coverage  -->
ASAN_BUILD - 编译AFL++，并用address sanitizer（ASan，一种动态内存错误检测器）进行调试<!--未找到address sanitizer的合适翻译-->
UBSAN_BUILD - 编译AFL++工具，并用undefined behavior sanitizer（UBSan，用于检测C/C++中的未定义行为）进行调试
DEBUG - 无优化、-ggdb3、给出所有警告和 -Werror
LLVM_DEBUG - 显示 llvm 过时警告
PROFILING - 编译 afl-fuzz，同时进行分析<!-- 原文为compile afl-fuzz with profiling information -->
INTROSPECTION - 使用突变自省（mutation introspection）编译 afl-fuzz
NO_PYTHON - 禁用 python 支持
NO_SPLICING - 禁用afl-fuzz中的拼接突变（splicing mutation），不建议用于普通模糊测试
NO_UTF - 状态屏幕中的行渲染不使用 UTF-8（回退到原始AFL版本中的G1框绘制）。
NO_NYX - 禁用构建 nyx 模式依赖项
NO_CORESIGHT - 禁用构建 coreight（仅限 arm64）
NO_UNICORN_ARM64 - 禁用在 arm64 上构建 unicorn
AFL_NO_X86 - 在非 Intel/AMD 平台上编译
LLVM_CONFIG - 如果您的发行版不使用 llvm-config 的标准名称（如 Debian）。
例如：**make LLVM_CONFIG=llvm-config-14**

## 基于X86-64或arm64平台的macOS

由于平台的特殊性，macOS 存在一些问题。

macOS 支持 AFL++ 插桩<!--instrumentation-->使用的 SYSV 共享内存，但仅使用默认设置并不够。在构建之前，请运行所提供的脚本来完善默认设置：

```sh
sudo afl-system-config
```

有关共享内存设置以及如何将其永久化的文档，请参见 https://www.spy-hill.com/help/apple/SharedMemory.html。

接下来，要构建 AFL++，请从 brew 安装以下软件包：

```sh
brew install wget git make cmake llvm gdb coreutils
```

根据 macOS 系统和 brew 版本的不同，brew 可能安装在不同的位置。您可以使用 **brew info llvm** 查看安装位置，然后为其创建一个变量：

```sh
export HOMEBREW_BASE="/opt/homebrew/opt"
```

或

```sh
export HOMEBREW_BASE="/usr/local/opt"
```

设置 PATH 以指向 brew clang、clang++、llvm-config、gmake 和 coreutils。同时使用 **brew clang** 编译器；**请勿使用 Xcode clang 编译器**。

```sh
export PATH="$HOMEBREW_BASE/coreutils/libexec/gnubin:/usr/local/bin:$HOMEBREW_BASE/llvm/bin:$PATH"
export CC=clang
export CXX=clang++
```

然后按照一般的 Linux 说明进行构建。

如果一切正常，你应该已经安装了 afl-clang-fast，你可以用以下命令来检查：

```sh
which afl-clang-fast
```

请注意，**afl-clang-lto**、**afl-gcc-fast** 和 **qemu_mode** 无法在 macOS 上运行。

macOS 默认的崩溃报告守护进程会导致模糊测试<!--fuzzing-->出现问题。你需要关闭它，可以通过 afl-system-config 关闭。

与其他 unix 系统相比，macOS 上的 **fork()** 语义有些许不同，这绝对不符合 POSIX 标准。这意味着两件事:

- 模糊测试<!--fuzzing-->可能会比 Linux 慢。事实上，有报告说，在macOS上使用Linux虚拟机执行上述工作，可以大大提高性能。
- 一些不可移植的特定平台代码可能与 AFL++ forkserver 不兼容。如果遇到任何问题，请在启动 afl-fuzz 前在环境中设置 **AFL_NO_FORKSRV=1**。

macOS 似乎不支持 QEMU 的user mode，因此黑盒插桩模式 (-Q) 将无法运行。不过，FRIDA mode (-O) 可在 x86 和 arm64 macOS 上运行。