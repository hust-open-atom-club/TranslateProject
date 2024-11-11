---
status: proofread
title: "Building and installing AFL++"
author: AFLplusplus Community
collector: Souls-R
collected_date: 20240827
translator: codefashion007
translated_date: 20241108
proofreader: shandianchengzi  
proofread_date: 20241111  
priority: 10
link: https://github.com/AFLplusplus/AFLplusplus/blob/stable/docs/INSTALL.md  
---
# 构建并安装 AFL++

## 在 x86 架构的 Linux 上

通过 docker 来安装已经预编译好的 AFL++ 是一个非常简便的方法：
你可以使用 [Dockerfile](../Dockerfile) ，或者直接从 Docker Hub 拉取（适用于 x86_64 和 arm64 架构）：

```shell
docker pull aflplusplus/aflplusplus:latest
docker run -ti -v /location/of/your/target:/src aflplusplus/aflplusplus  
```

当向稳定的分支推送时，这个 docker 镜像文件就会自动生成。
你可以在容器中的 `/src` 中找到你的目标源代码。

注意：你也可以拉取 `aflplusplus/aflplusplus:dev`,这是 AFL++ 的最新开发状态。

如果你想自己构建 AFL++，你有很多选择，其中最简单的就是构建并安装所有的东西：

注意：根据你的 Debian/Ubuntu/Kali/... 版本，将 `-14` 替换为任意的 llvm 可用版本。我们推荐使用 llvm 13 或者更新的版本。

```shell
sudo apt-get update
sudo apt-get install -y build-essential python3-dev automake cmake git flex bison libglib2.0-dev libpixman-1-dev python3-setuptools cargo libgtk-3-dev
#尝试安装 llvm 14，如果失败则安装默认的发行版
sudo apt-get install -y lld-14 llvm-14 llvm-14-dev clang-14 || sudo apt-get install -y lld llvm llvm-dev clang
sudo apt-get install -y gcc-$(gcc --version|head -n1|sed 's/\..*//'|sed 's/.* //')-plugin-dev libstdc++-$(gcc --version|head -n1|sed 's/\..*//'|sed 's/.* //')-dev
sudo apt-get install -y ninja-build #用于 QEMU 模式
sudo apt-get install -y cpio libcapstone-dev #用于 Nyx 模式
sudo apt-get install -y wget curl #用于 Frida 模式
sudo apt-get install python3-pip #用于 Unicorn 模式
git clone https://github.com/AFLplusplus/AFLplusplus
cd AFLplusplus
make distrib
sudo make install
```

推荐在你的发行版中尽可能地安装最新且可用的 gcc，clang 和 llvm-dev！

请注意，`make distrib` 也会构建 FRIDA 模式，QEMU 模式和 unicorn 模式等。如果你想要的就是普通的 AFL++ ，就执行 `make all`。如果你想要一些已经预编译的辅助工具，但是对那些只针对二进制的不感兴趣，那么你可以选择这个来替代：

```shell
make source-only
```

这些构建目标包括：

* all：主要的 AFL++ 二进制文件和 llvm/gcc 插桩
* binary-only：仅限于二进制模糊测试的所有内容：frida 模式，nyx 模式，qemu 模式，frida 模式，unicorn 模式，coresight 模式，libdislocator，libtokencap
* source-only：用于源代码模糊测试的所有内容：nyx 模式，libdislocator，libtokencap
* distrib：所有内容（包括仅二进制和源代码的模糊测试）
* man：从程序的帮助选项中创建简单的手册页
* install：安装你用上述构建选项已经编译好的所有内容
* clean：清理所有已编译的内容，不包括下载内容（除非你不在任何一个 checkout 版本中）
* deepclean：清理包括下载的所有内容
* code-format：在你提交和发送 PR 之前，请格式化代码！
* tests：运行测试用例来保证所有的功能都能够正常工作
* unit：运行单元测试（基于 cmocka）
* help：展示构建选项

[除非你使用的是 macOS 系统](https://developer.apple.com/library/archive/qa/qa1118/_index.html)，否则你还可以通过传递 `PERFORMANCE=1` 参数给 make 来构建 AFL++ 二进制文件的静态链接版本：

```shell
make PERFORMANCE=1
```

这些构建选项包括：

* PERFORMANCE - 编译带有性能选项可以使二进制文件不会迁移到其它系统。推荐（除了在 macOS 上）！
* STATIC - 编译 AFL++ 的静态链接（不要在 macOS 上进行）
* CODE_COVERAGE - 编译目标以测试代码覆盖率(详见 [README.llvm.md](../instrumentation/README.llvm.md))
* ASAN_BUILD - 编译并启用地址 sanitizer，用于调试
* UBSAN_BUILD - 编译 AFL++ 工具，并启用未定义行为的 sanitizer，用于调试
* DEBUG - 没有优化，-ggdb3，对所有的警告使用 -Werror
* LLVM_DEBUG - 显示 llvm 弃用警告
* PROFILING - 编译 afl-fuzz 并包含性能分析信息
* INTROSPECTION - 编译 afl-fuzz 并包含变异自省(mutation introspection)
* NO_PYTHON - 禁用 python 支持
* NO_SPLICING - 在 afl-fuzz 中禁用拼接变异，不推荐用于普通的模糊测试
* NO_UTF - 在状态界面(status screen)中不要使用 UTF-8 来行渲染
* NO_NYX - 禁用构建 nyx 模式依赖
* NO_CORESIGHT - 禁用构建 coresight（仅限于 arm64 架构）
* NO_UNICORN_ARM64 - 在 arm64 架构中禁用构建 unicorn
* AFL_NO_X86 - 如果在非 Intel/AMD 平台编译
* LLVM_CONFIG - 如果你的发行版没有使用 llvm-config 的标准名字（例如 Debian）

例如：`make LLVM_CONFIG=llvm-config-14`

## 在 x86_64 和 arm64 架构上的 macOS 系统

macOS 系统由于其平台的特殊性，存在一些需要注意的细节。

macOS 系统支持 AFL++ 插桩使用 SYSV 共享内存，但是默认设置的内存是不够的。在构建之前，可以通过运行提供的脚本来增加它们：

```shell
sudo afl-system-config
```

在 [https://www.spy-hill.com/help/apple/SharedMemory.html](https://www.spy-hill.com/help/apple/SharedMemory.html) 中可以看到关于共享内存设置以及如何使它们永久生效的文档。

接下来，为了构建 AFL++，需要从 brew 安装以下包：

```shell
brew install wget git make cmake llvm gdb coreutils
```

根据你的 macOS 系统和 brew 的版本，brew 可能会安装在不同地方。
你可以通过使用 `brew info llvm` 来检查它所在的位置，然后为它创建一个变量：

```shell
export HOMEBREW_BASE="/opt/homebrew/opt"
```

或者

```shell
export HOMEBREW_BASE="/usr/local/opt"
```

设置 `PATH` 以指向 brew clang，clang++。llvm-config，gmake 和 coreutils。
还要使用 brew clang 编译器；不能使用 Xcode clang 编译器。

```shell
export PATH="$HOMEBREW_BASE/coreutils/libexec/gnubin:/usr/local/bin:$HOMEBREW_BASE/llvm/bin:$PATH"
export CC=clang
export CXX=clang++
```

然后按照通用的 Linux 指令进行构建。

如果所有东西都正常工作，你应该已经安装了 `afl-clang-fast`，你可以通过以下方式检查：

```shell
which afl-clang-fast
```

注意 `afl-clang-lto`，`afl-gcc-fast` 和 `qemu_mode` 在 macOS 上并不能正常工作。

macOS 默认的自带的崩溃报告守护进程会导致模糊测试出现问题。你需要关掉它，你可以用 `afl-system-config` 来完成。

与其它 Unix 系统相比，macOS 系统上的 `fork()` 语句有一点不寻常，并且看起来并不遵守 POSIX 标准。这意味着两件事：

- 模拟测试可能会比在 Linux 上慢一点。实际上，一些人报告说在 macOS 上运行 Linux 虚拟机可以获得显著的性能提升。
- 一些非可移植的、平台特定的代码可能与 AFL++ 的 forksever 不兼容。如果你遇到了任何问题，在启动 afl-fuzz 之前，在环境中设置 `AFL_NO_FORKSRV=1`。

用户模拟模式的 QEMU 在 macOS 上不受支持，所以黑盒插桩模式 (`-Q`) 不会正常工作。然而，FRIDA 模式 (`-O`) 在 x86 和 arm64 macOS 上都可以正常工作。
