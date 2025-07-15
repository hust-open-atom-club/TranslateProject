---
status: proofread
title: "Fuzzing binary-only targets"
author: AFLplusplus Community
collector: Souls-R
collected_date: 20240827
priority: 10
translator: YunLongHaoYing
translated_date: 20241125
proofreader: SheepFifteen
proofread_date: 20250715
link: https://github.com/AFLplusplus/AFLplusplus/blob/stable/docs/fuzzing_binary-only_targets.md
---
# 对二进制目标程序进行模糊测试

AFL++、libFuzzer 等模糊测试工具在拥有目标程序源代码的情况下表现出色，能够实现高速且基于覆盖率引导的模糊测试。

但对于只有二进制程序而缺少源代码的情况，传统的 `afl-fuzz -n`（非插桩模式）效果并不理想。

为了对黑盒二进制文件进行快速的动态（on-the-fly）插桩，AFL++ 提供了多种支持。下文将介绍如何利用 AFL++ 对这些二进制文件进行模糊测试。

## 简要说明：

如果可以使用 `persistent mode` 且稳定性足够高，那么 `persistent mode` 下的 FRIDA 模式和 QEMU 模式速度最快。

如果无法使用 `persistent mode` 或是稳定性不足，可以尝试 Zafl、RetroWrite、Dyninst；若这些方法均不适用，可以回退到标准 FRIDA/QEMU 模式，并通过 `AFL_ENTRYPOINT` 和 `AFL_EXITPOINT` 手动指定测试入口点和退出点。

若目标程序运行在​​非 Linux 系统​​上，请使用 ​​unicorn 模式​​（unicorn_mode）

## 使用 AFL++ 对二进制目标程序进行模糊测试

### QEMU 模式

QEMU 模式是 AFL++ 工具针对目标程序的“原生”解决方案。该模式位于 `./qemu_mode/` 目录下， 编译后可通过 `afl-fuzz -Q` 命令行选项调用。QEMU 模式是最简单的替代方案，支持跨平台二进制文件的模糊测试。

对于 Linux 程序及其库文件，该模式通过 QEMU 的"用户空间模拟"（user space emulation）功能实现——这是一种较少被提及但功能强大的模拟方式。虽然 QEMU 是独立于 AFL++ 的项目，但您可以通过以下命令快速构建此功能：

```shell
cd qemu_mode
./build_qemu_support.sh
```

推荐的 QEMU 模式配置方案如下：

* 运行 1 个 `afl-fuzz -Q` 实例并启用 CMPLOG（`-c 0` + `AFL_COMPCOV_LEVEL=2`）
* 运行 1 个 `afl-fuzz -Q` 实例并启用 QASAN（`AFL_USE_QASAN=1`）
* 运行 1 个 `afl-fuzz -Q` 实例并启用 LAF（`AFL_PRELOAD=libcmpcov.so` + `AFL_COMPCOV_LEVEL=2`），也可以改用 FRIDA 模式，只需把 -Q 替换为 -O，并移除 LAF 实例

在完成上述基础配置后，可利用剩余 CPU 核心运行更多实例：
* 继续使用 -Q 模式的 QEMU 实例。
* 或采用静态二进制重写工具（如 Dyninst/RetroWrite/ZAFL 等）。这些重写工具各有优劣，其中 ZAFL 通常是综合表现最佳的选择

若目标程序兼容二进制重写工具，您可直接使用标准 afl-fuzz 命令——其运行速度可达 QEMU 模式的​​2倍​​（但仍低于 QEMU `persistent mode` 的速度）。

QEMU 模式存在约 ​​50% 的性能损耗​​，但可通过以下优化方案显著提升速度：
- **调整forkserver入口点​​**：通过 `AFL_ENTRYPOINT` 参数将 forkserver 的入口点移动至二进制文件的某个后续基本块，可提升 ​​5-10% ​​速度。
- **启用 persistent mode**：按照
  [qemu_mode/README.persistent.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/qemu_mode/README.persistent.md)指南配置后，可提升 150-300% 的总体速度（即达到原始 QEMU 模式的 3-8 倍速度）。
- **限定插桩范围​​**：使用 `AFL_CODE_START`/`AFL_CODE_END` 环境变量仅对特定代码段进行插桩。

更多使用说明及注意事项请参考[qemu_mode/README.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/qemu_mode/README.md)。如果可以，建议启用 `persistent mode`，详见 
[qemu_mode/README.persistent.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/qemu_mode/README.persistent.md)。需要注意的是，QEMU 模式的运行速度约为​​编译时插桩（compile-time instrumentation）的 1/5 至 1/2​​，且不利于并行化。

其他替代方案包括：
- honggfuzz：[https://github.com/google/honggfuzz](https://github.com/google/honggfuzz)，现已支持 QEMU 模式，但其性能仅比原生 QEMU 提升约 ​​1.5%​​。

- 如果您希望​​快速定制个性化模糊测试工具​​，推荐使用我们的姊妹项目 ​​libafl：
[https://github.com/AFLplusplus/LibAFL](https://github.com/AFLplusplus/LibAFL)，它同样支持 QEMU 模式，并提供更灵活的扩展接口。

### WINE + QEMU 模式

Wine 模式允许通过 QEMU 插桩技术运行 Win32 PE 格式的可执行文件。使用该模式需要预先安装 Wine、Python3 和 pefile Python 等依赖。

该功能已集成在 AFL++ 中。

更多信息请参考：[qemu_mode/README.wine.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/qemu_mode/README.wine.md).

### FRIDA 模式

在 FRIDA 模式下，您可以像使用 QEMU 模式一样轻松地对二进制目标程序进行模糊测试。FRIDA 模式通常比 QEMU 模式​​稍快​​，而且作为更新的技术，它支持在 ​​macOS 系统​​（包括 Intel 和 M1 芯片架构）上运行。

构建 FRIDA 模式命令如下：

```shell
cd frida_mode
gmake
```

更多说明和注意事项请参考：[frida_mode/README.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/frida_mode/README.md).

若条件允许，强烈建议您启用​​ `persistent mode`，具体配置详见
[instrumentation/README.persistent_mode.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/instrumentation/README.persistent_mode.md)。虽然该模式速度约为编译时插桩的 1/5 至 1/2，且并行化效率较低，但对于​​二进制目标程序​​的模糊测试场景，只要可用就能带来​​显著的速度提升​​。

FRIDA 模式还支持远程设备测试——例如针对iOS或Android设备的模糊测试，此时可借助[https://github.com/ttdennis/fpicker/](https://github.com/ttdennis/fpicker/) 作为中间层（该工具底层仍调用 AFL++ 进行模糊测试）。

若您需要快速开发定制化模糊测试工具，我们强烈推荐姊妹项目 libafl：
[https://github.com/AFLplusplus/LibAFL](https://github.com/AFLplusplus/LibAFL)，它不仅支持 FRIDA 框架，还提供现成的工作示例可直接参考。

### Nyx 模式
Nyx 是一个基于 KVM 和 QEMU 构建的全系统仿真模糊测试环境，支持快照功能。该模式​​仅限 Linux 平台​​使用，且当前仅支持​​ x86_64 架构​​。

对二进制目标程序进行模糊测试时，需要安装特定的 ​​5.10 版本内核​​。

更多信息请参考：[nyx_mode/README.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/nyx_mode/README.md).

### Unicorn 模式

Unicorn 是 QEMU 的一个分支，因此其插桩机制与 QEMU 非常相似。但与 QEMU 不同的是，Unicorn 不提供完整的系统仿真，甚至不支持用户空间仿真。如果需要运行时环境和/或加载器，必须从头开始编写。此外，Unicorn 移除了块链式执行功能（block chaining），这意味着 AFL++ 中针对 QEMU 模式所做的速度优化无法直接移植到 Unicorn 上。

对于非 Linux 平台的二进制文件，可以使用 AFL++ 的 unicorn_mode 进行仿真，该模式能够仿真任何你想要的平台，但代价是速度下降以及需要用户编写脚本。

构建 Unicorn 模式的命令如下：

```shell
cd unicorn_mode
./build_unicorn_support.sh
```

更多信息请参考：
[unicorn_mode/README.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/unicorn_mode/README.md).

### 共享库

若需对动态链接库进行模糊测试，目前提供两种主要方案。
两种方法，都需要编写一个小型测试桩程序（harness）加载并调用目标库。
随后使用 FRIDA 模式或 QEMU 模式对该 harness 进行模糊测试，需配合以下参数之一 `AFL_INST_LIBS=1`（全局插桩） 或 `AFL_QEMU/FRIDA_INST_RANGES`（指定插桩范围）。

另一种精确度较低且速度较慢的方案​是使用 `utils/afl_untracer/` 工具集进行模糊测试，并以 `afl-untracer.c` 为模板进行适配。此方式比 FRIDA 模式速度显著更慢。

更多信息请参考：
[utils/afl_untracer/README.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/utils/afl_untracer/README.md).

### Coresight

Coresight 是 ARM 针对 Intel PT 的解决方案。从 AFL++ v3.15 开始，Coresight 新增了基于 Coresight 的跟踪器实现（位于 `coresight_mode/` 目录），该模式相比 QEMU 具有更快的执行速度，​​但存在两个重要限制，不支持并行测试，目前一次只能追踪一个进程（当前版本仍处于开发阶段 WIP）。

更多信息请参考：
[coresight_mode/README.md](https://github.com/AFLplusplus/AFLplusplus/blob/stable/coresight_mode/README.md).

## 二进制重写工具 Binary rewriters

作为替代方案，二进制重写工具比 AFL++ 原生方案速度更快，但兼容性存在局限。

### ZAFL

ZAFL 是一款静态二进制重写平台，支持 x86-64 架构下的 C/C++ 二进制文件，无论是否 strip（剥离符号表和调试信息）、是否为 PIE（位置无关可执行文件）。除常规插桩外，ZAFL 提供的 API 还支持一些高级转换功能（如 laf-Intel 优化、上下文敏感插桩、InsTrim 指令精简等）。

ZAFL 的基准插桩速度通常达到 afl-clang-fast 的 90-95%。

项目地址：[https://git.zephyr-software.com/opensrc/zafl](https://git.zephyr-software.com/opensrc/zafl)

### RetroWrite

RetroWrite 是一款可与 AFL++ 集成的静态二进制重写工具，适用于以下场景：
* 目标架构为 x86_64 或 arm64
* 二进制文件不含 C++ 异常处理
* 若为 x86_64 架构，需保留符号表且采用位置无关代码（PIC/PIE）编译

该工具通过反编译生成 ASM 汇编文件，继而使用 afl-gcc 进行插桩。需注意： afl-gcc 仅在 AFL++ v4.21c 及更早版本中提供，后续版本已移除该组件（因技术迭代淘汰）。

经 RetroWrite 静态插桩的二进制文件，其执行效率接近原生编译器插桩版本，并显著优于基于 QEMU 的插桩方案。

项目地址：[https://github.com/HexHive/retrowrite](https://github.com/HexHive/retrowrite)

### Dyninst

Dyninst 是与 Pintool 和 DynamoRIO 类似的二进制插桩框架，其核心差异在于： Pintool 和 DynamoRIO 在运行时插桩，而 Dyninst 则是在程序加载时静态插桩，并直接运行修改后的程序或保存插桩后的二进制文件供后续使用。这种特性使其特别适合模糊测试等场景，但在恶意软件分析等需要运行时动态监控的领域效果有限。

使用 Dyninst 时，你可以对每个基本块插入 AFL++ 插桩代码，然后保存修改后的二进制文件。最后使用 afl-fuzz 对保存后的目标文件进行模糊测试。
虽然方案理论上完美，但实际存在重大技术障碍：插入插桩指令可能会改变进程地址空间布局，要保证程序仍正常运行非常困难。因此，实际测试中二进制文件崩溃率较高。

根据 afl-dyninst 的优化选项不同，插桩会导致 15%-35% 的性能下降。

项目地址：[https://github.com/vanhauser-thc/afl-dyninst](https://github.com/vanhauser-thc/afl-dyninst)

### Mcsema

从理论上讲，您可以使用 Mcsema 将二进制文件反编译为 LLVM 中间表示（IR），再利用 LLVM 模式进行插桩。不过...祝您好运。

项目地址：[https://github.com/lifting-bits/mcsema](https://github.com/lifting-bits/mcsema)

## 二进制追踪工具 Binary tracers

### Pintool & DynamoRIO

Pintool 和 DynamoRIO 是两款动态插桩引擎，可在程序运行时获取基本块信息。Pintool 仅支持 Linux、macOS 和 Windows 平台的 x86/x64 架构，DynamoRIO 除上述平台外还支持 ARM 和 AArch64 架构，且速度比 Pintool 快约 10 倍。

这两款工具的最大瓶颈在于速度损耗。DynamoRIO 会导致程序运行速度降低 98-99%，Pintool 的速度损耗更为严重，达到99.5%。

因此，仅在所有其他方法都失效时才考虑 DynamoRIO；若 DynamoRIO 也无法使用，才考虑使用 Pintool.

DynamoRIO 解决方案：
* [https://github.com/vanhauser-thc/afl-dynamorio](https://github.com/vanhauser-thc/afl-dynamorio)
* [https://github.com/mxmssh/drAFL](https://github.com/mxmssh/drAFL)
* [https://github.com/googleprojectzero/winafl/](https://github.com/googleprojectzero/winafl/)

  <= 效果很好但仅支持 Windows 系统

Pintool 解决方案：
* [https://github.com/vanhauser-thc/afl-pin](https://github.com/vanhauser-thc/afl-pin)
* [https://github.com/mothran/aflpin](https://github.com/mothran/aflpin)
* [https://github.com/spinpx/afl_pin_mode](https://github.com/spinpx/afl_pin_mode)

  <= 仅支持旧版 Pintool 工具链

### Intel PT（处理器跟踪）方案​​

如果您使用的是较新的 Intel CPU，可以利用 Intel 的​​处理器跟踪（Processor Trace, PT）​​技术。但 PT 的主要问题是​​缓冲区容量小​​，且通过 PT 收集的调试信息编码复杂，导致解码过程非常占用 CPU 资源，速度极慢。因此，整体性能会下降约​ ​70%-90%​​（具体取决于实现方式和其他因素）。

目前有两种基于 AFL 的 Intel PT 实现方案：

1. [https://github.com/junxzm1990/afl-pt](https://github.com/junxzm1990/afl-pt)
    => 需要 Ubuntu 14.04.05（不含更新）+ 4.4 内核

2. [https://github.com/hunter-ht-2018/ptfuzzer](https://github.com/hunter-ht-2018/ptfuzzer)
    => 需要 Ubuntu 14.04.05（不含更新）和 ​​4.14/4.15内核，并启用 ​​nopti 内核启动选项​。相比前者（afl-pt）​​速度更快​。

此外，honggfuzz[https://github.com/google/honggfuzz](https://github.com/google/honggfuzz) 也支持 Intel PT，但其 ​​IPT（Intel PT）性能仅 6%​​，效率极低。

## Non-AFL++ 解决方案

还有很多二进制模糊测试框架​​。部分框架在 CTF 竞赛中表现优异，但对大型二进制文件支持欠佳，有些虽路径发现能力强却运行缓慢，还有些配置极为复杂：

* Jackalope:
  [https://github.com/googleprojectzero/Jackalope](https://github.com/googleprojectzero/Jackalope)
* Manticore:
  [https://github.com/trailofbits/manticore](https://github.com/trailofbits/manticore)
* QSYM:
  [https://github.com/sslab-gatech/qsym](https://github.com/sslab-gatech/qsym)
* S2E: [https://github.com/S2E](https://github.com/S2E)
* TinyInst:
  [https://github.com/googleprojectzero/TinyInst](https://github.com/googleprojectzero/TinyInst)
*  ... 欢迎补充其他优秀但未提及的框架！

## 结束语

以上就是全部内容！如果您有最新消息、修正建议或更新信息，欢迎发送邮件至 vh@thc.org.
