---
status: collected
title: "Coverage"
author: Syzkaller Community
collector: mudongliang
collected_date: 20240229
priority: 10
link: https://github.com/google/syzkaller/blob/master/docs/coverage.md
---

# 覆盖

`syzkaller` 使用 [sanitizer coverage (追踪模式)](https://clang.llvm.org/docs/SanitizerCoverage.html#tracing-pcs)
和 [KCOV](https://www.kernel.org/doc/html/latest/dev-tools/kcov.html) 来收集覆盖率。
Sanitizer 覆盖功能也得到了 `gcc` 的支持并且 `KCOV` 得到了其他一些操作系统的支持。
注意: `gVisor` 的覆盖范围是完全不同的。

覆盖率在编译器插入到目标代码中的 `覆盖点` 的基础上进行追踪。
覆盖点通常指的是代码的 [基本块](https://en.wikipedia.org/wiki/Basic_block) 或 [CFG edge](https://en.wikipedia.org/wiki/Control-flow_graph)
（这取决于编译时使用的编译器和检测模式，比如， 对`Linux` 和 `clang` 来说，它们的默认模式是 CFG 边，而 `gcc` 的默认模式则是基本块）。
注意，覆盖点是编译器在中端的大量转换和优化过程之后插入的。结果是覆盖范围可能与源代码的关联性较弱。
比如，你可能会看到一个在未覆盖行之后的覆盖行，或者你可能在本应该看到覆盖点的地方却看不到它，
反之亦然 （如果编译器拆分基本块，或者将控制流结构转换为没有控制流的条件移动等，这就可能会发生）。              
评价覆盖率一般来说仍然是非常有用的，它有助于了解模糊测试的整体进展，但对它需要辩证看待。

查找 Linux 内核特定覆盖信息，请参阅 [此处](linux/coverage.md)

## Web 界面

点击 `cover` 链接，然后你会看到在你内核构建目录里每个目录的页面。它显示了要么是百分比数字 `X% of N`，要么是  `---` 。
`X%` of `N` 表示到现在，`N` 个覆盖点中的 `X%` 已被覆盖。`---` 表示在此目录里没有覆盖。 

点击目录，你会看到一些文件和可能出现的子目录。在每个源代码文件上要么有 `---` ，要么有覆盖率。

点击任何 C 文件你将看到源代码视图。源代码视图使用特定的颜色。颜色定义可以在 [coverTemplate](/pkg/cover/report.go#L504) 中找到。着色描述如下。 

如果你点击列出的任何源文件中的百分比数字，你将得到该源文件中每个函数的覆盖率百分比。

### 已覆盖: 黑色 (#000000)

此路径上所有的 PC 值都被覆盖。左侧的数字表明有多少个程序被触发并执行与该行有关的 PC 值。你可以点击这个数字，它将打开最后运行的程序。下面的例子展示了如何显示被完全覆盖的单行。 

![代码行被完全覆盖](coverage_covered.png?raw=true)

### 两者: 橙色 (#c86400)
                 
这条线上有数个 PC 值，但它们不是所有都被执行。可以点击源代码行左边的数字打开与 PC 值有关的最后被触发的程序。下面的例子展示了一行包含已执行的程序计数器（PC）值和未执行的程序计数器（PC）值的代码。

![代码行已运行和未运行的 PC 值](coverage_both.png?raw=true)

###  不明显覆盖: 绯红 (#c80000)

函数符号（symbol）所在的行没有任何覆盖，意味着该函数不被执行。请注意，如果编译器已经优化了某些特定的符号并将代码改为内联形式，则与此行有关的符号就是代码被编译进去的那个符号。这会使它有时很难辨别出着色的意义。下面的例子展示了未被覆盖的单行代码以及与其相关的程序计数器（PC）值是如何出现在未被执行的函数中的。

![与此行有关的 PC 值不被运行并且这些在函数里的 PC 值同样也不被运行](coverage_weak-uncovered.png?raw=true)
 
### 未覆盖: 红色 (#ff0000)

此行未被覆盖。函数（符号）所在的行会被运行，并且会有与此行相关联的一个PC 值。 下面的例子展示了如何显示未覆盖的单行。

![代码行没有与之相关联的已执行程序计数器值。在代码行里的函数被运行](coverage_uncovered.png?raw=true)

### 未使用: 灰色 (#505050)

与该行有关的 PC 值不被检测或者源程序行没有生成任何代码。下面的例子展示了如何显示所有未使用的代码。

![未检测的代码行](coverage_not_instrumented.png?raw=true)

## syz-cover  

小程序在 syzkaller 仓库中原始覆盖数据的基础上生成覆盖报告。它在 [syz-cover](/tools/syz-cover) 中可用并且可被构建通过:

``` bash
GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o ./bin/syz-cover github.com/google/syzkaller/tools/syz-cover
```

原始覆盖数据可通过运行 `syz-manager` 获得:

``` bash
wget http://localhost:<your syz-manager port>/rawcover
```
现在这个原始覆盖数据可以被 `syz-cover` 读取从而生成覆盖报告：

``` bash
./bin/syz-cover --config <location of your syzkaller config> rawcover
```
你也可以输出包含函数覆盖率的 CSV 文件通过: 

``` bash
./bin/syz-cover --config <location of your syzkaller config> --csv <filename where to export>  rawcover
```
你可以输出一个包含行覆盖率信息的 JSON 文件通过:  

```bash
./bin/syz-cover --config <location of your syzkaller config> --json <filename where to export>  rawcover
```

