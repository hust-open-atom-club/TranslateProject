---
status: translated
title: "Fuzzing binary-only targets"
author: AFLplusplus Community
collector: Souls-R
collected_date: 20240827
priority: 10
translator: YunLongHaoYing
translated_date: 20241125
link: https://github.com/AFLplusplus/AFLplusplus/blob/stable/docs/fuzzing_binary-only_targets.md
---
# 对纯二进制目标进行模糊测试

AFL++、libFuzzer 及其他模糊测试工具在拥有目标源代码的情况下非常出色。这些工具能够提供快速且基于覆盖率指导的模糊测试。

但对于只有二进制程序而没有源代码的情况，标准的 `afl-fuzz -n`（非插桩模式）并不高效。

为了快速对黑盒二进制程序进行动态插桩，AFL++ 仍然提供了多种支持。下面将介绍如何使用 AFL++ 对这些二进制文件进行模糊测试。

## 简要说明：

如果可以使用 persistent mode，且稳定性足够高，那么 persistent mode 下的 FRIDA mode 和 QEMU mode 速度最快。

否则，可以尝试 Zafl、RetroWrite、Dyninst；如果这些方法也失败，可以使用标准 FRIDA/QEMU mode，并设置 AFL_ENTRYPOINT 到所需位置。

对于非 Linux 平台的目标，请使用 unicorn_mode。

## 使用 AFL++ 对纯二进制目标进行模糊测试

### QEMU mode

QEMU mode 是针对程序的“原生“解决方案。它位于 `./qemu_mode/` 目录中， 编译后可以通过 `afl-fuzz -Q` 命令选项访问。这是最简单的替代方案，即使是跨平台二进制文件也适用。

对于 Linux 程序及其库，这通过一个运行在鲜为人知的 “user space emulation” mode 下的 QEMU 版本来实现的。QEMU 是一个独立于 AFL++ 的项目，但可以通过以下方式轻松构建此功能：

```shell
cd qemu_mode
./build_qemu_support.sh
```

推荐的 QEMU mode 设置如下：

* 运行一个带 CMPLOG（`-c 0` + `AFL_COMPCOV_LEVEL=2`）的 `afl-fuzz -Q` 实例。
* 运行一个带 QASAN（`AFL_USE_QASAN=1`）的 `afl-fuzz -Q` 实例。
* 运行一个带 LAF（`AFL_PRELOAD=libcmpcov.so` + `AFL_COMPCOV_LEVEL=2`）的 `afl-fuzz -Q` 实例，或者改用 FRIDA mode，替换 `-Q` 为 `-O` 并移除 LAF 实例。

然后根据剩余核心数量运行尽可能多的 `-Q` 模式实例，或者使用二进制重写器（如 Dyninst、RetroWrite、ZAFL 等）。二进制重写器都有各自的优势和注意事项。ZAFL 是最好的，但不能用于商务/商业环境。

如果二进制重写器适用于你的目标，那么就可以正常使用 afl-fuzz，其速度将是 QEMU mode 的两倍（但比 QEMU persistent mode 慢）。

QEMU mode 的速度降低了约 50%。不过，有多种方法可以提高速度：
- 使用 AFL_ENTRYPOINT 将 forkserver 的入口点移动到二进制文件中的更后一个基本块（提高 5-10% 速度）。
- 使用 persistent mode 
  [qemu_mode/README.persistent.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/qemu_mode/README.persistent.md) ，可提升 150-300% 的总体速度（即原始 QEMU 模式的 3-8 倍）。
- 使用 AFL_CODE_START/AFL_CODE_END 仅插桩特定部分。

有关其他说明和注意事项，请参考 
[qemu_mode/README.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/qemu_mode/README.md)。如果可以，应使用持久模式，参见 
[qemu_mode/README.persistent.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/qemu_mode/README.persistent.md)。 该模式比编译时插桩慢约 2 至 5 倍，而且不利于并行化。

请注意，还有 honggfuzz：
[https://github.com/google/honggfuzz](https://github.com/google/honggfuzz)，它现在也有 QEMU mode，但性能仅为 1.5%。

如果您想不费精力地编写一个自定义的模糊器，我们强烈推荐您查看我们同样支持 QEMU 的姊妹项目 libafl：
[https://github.com/AFLplusplus/LibAFL](https://github.com/AFLplusplus/LibAFL)

### WINE+QEMU

Wine mode 可以通过 QEMU 插桩运行二进制文件。它需要安装 Wine、Python3 和 pefile Python 包。

该模式已经包含在 AFL++ 中。

更多信息请参考：
[qemu_mode/README.wine.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/qemu_mode/README.wine.md).

### FRIDA mode

在 FRIDA mode 下，可以像使用 QEMU mode 一样轻松地对纯二进制目标进行模糊测试。大多数情况下，FRIDA mode 比 QEMU mode 稍快。此外，FRIDA mode 较新，并且支持 MacOS（包括 Intel 和 M1 芯片）。

构建 FRIDA mode 的方法：

```shell
cd frida_mode
gmake
```

更多说明和注意事项请参考：
[frida_mode/README.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/frida_mode/README.md).

如果可能，使用 persistent mode，参见
[instrumentation/README.persistent_mode.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/instrumentation/README.persistent_mode.md)。尽管其速度比编译时插桩慢 2-5 倍，并且不利于并行化，但对于纯二进制模糊测试来说，如果可以使用，它能够显著提高速度。

此外，还可以通过 FRIDA 进行远程模糊测试，例如，如果您希望在 iPhone 或 Android 设备上进行模糊测试，可以使用 
[https://github.com/ttdennis/fpicker/](https://github.com/ttdennis/fpicker/) 作为中间工具，它利用 AFL++ 进行模糊测试。

如果您想不费精力地编写一个自定义的模糊器，我们强烈推荐您查看我们同样支持 Frida 并且已经有现成的工作示例的姊妹项目 libafl：
[https://github.com/AFLplusplus/LibAFL](https://github.com/AFLplusplus/LibAFL)。

### Nyx mode
Nyx 是一个基于 KVM 和 QEMU 构建的全系统仿真模糊测试环境，支持快照功能。它仅适用于 Linux，目前仅支持 x86_x64 架构。

对于纯二进制模糊测试，需要一个特殊的 5.10 内核。

更多信息请参考：[nyx_mode/README.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/nyx_mode/README.md).

### Unicorn

Unicorn 是 QEMU 的一个分支，因此其插桩方式非常相似。但与 QEMU 不同的是，Unicorn 不提供全系统甚至用户态的仿真。如果需要，运行时环境和/或加载器必须从零开始编写。此外，Unicorn 移除了块链接功能，这意味着 AFL++ 的 QEMU mode 中的速度提升无法移植到 Unicorn。

对于非 Linux 二进制文件，可以使用 AFL++ 的 unicorn_mode，该模式可以模拟任意内容，但代价是较低的速度以及需要用户编写脚本。

构建 Unicorn 模式的方法：

```shell
cd unicorn_mode
./build_unicorn_support.sh
```

更多信息请参考：
[unicorn_mode/README.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/unicorn_mode/README.md).

### 共享库

如果目标是对共享库进行模糊测试，有两种方法可以选择。
对于这两种方法，都需要编写一个小型测试程序（harness）来加载并调用该库。
然后使用 FRIDA mode 或 QEMU mode 进行模糊测试，同时设置 `AFL_INST_LIBS=1` 或 `AFL_QEMU/FRIDA_INST_RANGES`。

另一种精确度较低且速度较慢的选择是使用 `utils/afl_untracer/` 进行模糊测试，并以 `afl-untracer.c` 为模板。这种方法比 FRIDA 模式慢。

更多信息请参考：
[utils/afl_untracer/README.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/utils/afl_untracer/README.md).

### Coresight

Coresight 是 ARM 针对 Intel PT 的解决方案。从 AFL++ v3.15 开始，Coresight 提供了一种追踪器实现，位于 `coresight_mode/` 中，速度比 QEMU 更快，但无法并行运行。目前只能追踪一个进程（开发中）。

更多信息请参考：
[coresight_mode/README.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/coresight_mode/README.md).

## 二进制重写器

二进制重写器是一种替代方案。与 AFL++ 提供的解决方案相比，重写器速度更快，但并非总能成功运行。

### ZAFL

ZAFL 是一个静态重写平台，支持 x86-64 的 C/C++ 二进制文件，无论是去符号表的还是未去符号表的，PIE（位置无关可执行文件）与非 PIE 文件都可支持。除了常规的插桩，ZAFL 的 API 还支持一些转换过程（例如，laf-Intel、上下文敏感性、InsTrim 等）。

ZAFL 的基准插桩速度通常达到 afl-clang-fast 的 90-95%。

[https://git.zephyr-software.com/opensrc/zafl](https://git.zephyr-software.com/opensrc/zafl)

### RetroWrite

RetroWrite 是一种可以与 AFL++ 结合使用的静态二进制重写工具。如果您有一个 x86_64 或 arm64 的二进制文件，且该文件不包含 C++ 异常处理机制，并且对于 x86_64 文件仍保留符号表并编译为位置无关代码（PIC/PIE），RetroWrite 可能是一个适合的解决方案。它会将二进制文件反编译为 ASM 文件，然后用 afl-gcc 对其进行插桩。

通过 RetroWrite 进行静态插桩的二进制文件，在性能上接近编译器插桩的文件，并优于基于 QEMU 的插桩方式。

[https://github.com/HexHive/retrowrite](https://github.com/HexHive/retrowrite)

### Dyninst

Dyninst 是一个二进制插桩框架，与 Pintool 和 DynamoRIO 类似。不过，Pintool 和 DynamoRIO 在运行时插桩，而 Dyninst 则是在加载时插桩目标，并在插桩后运行或将更改保存到二进制文件中。这对某些场景非常有用，例如模糊测试，但对其他场景（例如恶意软件分析）效果不佳。

使用 Dyninst，可以在每个基本块中插入 AFL++ 的插桩代码，然后将修改后的二进制文件保存下来。之后，使用 afl-fuzz 对保存后的目标文件进行模糊测试。
听起来很不错？确实如此。不过，插入指令后可能会改变进程空间中的地址，因此保证一切正常运行是一个非同小可的问题。因此，修改后的二进制文件经常会在运行时崩溃。

该方法的速度损失大约在 15%-35%，具体取决于使用 afl-dyninst 时的优化选项。

[https://github.com/vanhauser-thc/afl-dyninst](https://github.com/vanhauser-thc/afl-dyninst)

### Mcsema

从理论上讲，您可以使用 Mcsema 将二进制文件反编译为 LLVM IR，然后利用 llvm_mode 对其进行插桩处理。

[https://github.com/lifting-bits/mcsema](https://github.com/lifting-bits/mcsema)

## Binary tracers

### Pintool & DynamoRIO

Pintool 和 DynamoRIO 是动态插桩引擎，可用于运行时获取基本块信息。Pintool 仅适用于 Intel x32/x64 架构的 Linux、Mac OS 和 Windows 系统。
DynamoRIO 除此之外还支持 ARM 和 AARCH64 架构，并且速度比 Pintool 快 10 倍。

DynamoRIO的最大问题是速度（因此也包括 Pintool）。 DynamoRIO 的速度降低了 98-99%，而 Pintool 的速度降低了 99.5%。

因此，只有在其他方法都失败时，才推荐使用 DynamoRIO。而 Pintool 应仅在 DynamoRIO 不可用时作为备选。

DynamoRIO 解决方案：
* [https://github.com/vanhauser-thc/afl-dynamorio](https://github.com/vanhauser-thc/afl-dynamorio)
* [https://github.com/mxmssh/drAFL](https://github.com/mxmssh/drAFL)
* [https://github.com/googleprojectzero/winafl/](https://github.com/googleprojectzero/winafl/)
  <= 效果很好，仅支持 Windows

Pintool 解决方案
* [https://github.com/vanhauser-thc/afl-pin](https://github.com/vanhauser-thc/afl-pin)
* [https://github.com/mothran/aflpin](https://github.com/mothran/aflpin)
* [https://github.com/spinpx/afl_pin_mode](https://github.com/spinpx/afl_pin_mode)
  <= 仅支持旧版 Pintool

### Intel PT

如果您拥有较新的 Intel CPU，可以利用 Intel 的处理器追踪（PT）功能进行插桩分析。Intel PT 的最大问题是缓冲区较小，而且通过 PT 收集的调试信息编码复杂。 这使得解码非常耗费 CPU，因此速度很慢。 导致总体速度下降了约 70-90%（取决于实现方式和其他因素）。

AFL 的两种 Intel-PT 实现：

1. [https://github.com/junxzm1990/afl-pt](https://github.com/junxzm1990/afl-pt)
    => 需要 Ubuntu 14.04.05（不含更新）和 4.4 内核

2. [https://github.com/hunter-ht-2018/ptfuzzer](https://github.com/hunter-ht-2018/ptfuzzer)
    => 需要 Ubuntu 14.04.05（不含更新）和 4.4 内核。需要在内核引导选项中启用 "nopti"。此实现比 afl-pt 更快。

另一种工具 honggfuzz 
[https://github.com/google/honggfuzz](https://github.com/google/honggfuzz) 的 IPT 性能仅为 6%。

## 非 AFL++ 解决方案

还有很多二进制模糊框架。有些非常适合 CTF，但不支持大型二进制文件；有些非常慢，但有很好的路径发现能力；有些工具设置复杂。

* Jackalope:
  [https://github.com/googleprojectzero/Jackalope](https://github.com/googleprojectzero/Jackalope)
* Manticore:
  [https://github.com/trailofbits/manticore](https://github.com/trailofbits/manticore)
* QSYM:
  [https://github.com/sslab-gatech/qsym](https://github.com/sslab-gatech/qsym)
* S2E: [https://github.com/S2E](https://github.com/S2E)
* TinyInst:
  [https://github.com/googleprojectzero/TinyInst](https://github.com/googleprojectzero/TinyInst)
*  ... 如果您知道其他优秀工具，欢迎推荐！

## 结束语

以上就是全部内容！如果您有最新消息、纠正或更新，欢迎发送邮件至 vh@thc.org.
