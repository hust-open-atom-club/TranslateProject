---
status: collected
title: "Writing an LLVM Pass"
author: Linux Kernel Community
collector: tttturtle-russ
collected_date: 20240807
link: https://github.com/llvm/llvm-project/blob/main/llvm/docs/WritingAnLLVMNewPMPass.rst
---
# 编写LLVM Pass

## 简介 \-\-- 什么是LLVM Pass?


本文介绍了新的pass管理机制（New Pass Manager，NPM）。LLVM对代码生成管道使用的是传统的pass管理机制（Legacy Pass Manager）。详情参阅
`WritingAnLLVMPass`和
`NewPassManager`.

LLVM pass框架是LLVM系统中一个非常重要的组成部分，因为大多数编译器最值得关注的部分都在LLVM pass上。Pass执行着编译器的各种转换和优化工作，它们提供这些转换工作所需要的分析结果，并且最重要的是，它们为编译器代码提供了一种组织技术。

与传统pass管理器下的pass不同，传统pass管理器通过继承定义pass接口，而新pass管理器下的pass则依赖于基于概念的多态性，这意味着没有显式的接口（有关详细信息，请参见PassManager.h中的注释）。所有LLVM pass都继承自CRTP混入PassInfoMixin<PassT>。pass应该有一个run()方法，该方法返回一个PreservedAnalyses，并接受某些IR单元以及一个分析管理器作为输入。例如，函数pass将具有如下方法：
PreservedAnalyses run(Function &F, FunctionAnalysisManager &AM);

我们将向您展示如何构建一个pass，包括设置构建、创建pass，到执行和测试它。查看现有的pass总是学习细节的一个好方法。


## 快速开始 \-\-- 编写hello world


在这里，我们将介绍如何编写一个类似于“Hello World”的 Pass。这个“HelloWorld” Pass 的设计目的很简单，就是打印出正在编译的程序中所有非外部函数的名字。它不会对程序进行任何修改，仅仅是对其进行检查。

下面的代码已经存在；您可以自由地创建一个不同名称的 Pass，并与 HelloWorld 源文件一起放置。


### 设置构建 {#writing-an-llvm-npm-pass-build}

首先，按照《入门指南》中所述配置和构建 LLVM。

接下来，我们将重用一个已有的目录（创建一个新的目录会涉及比我们想要的更多的 CMake 文件操作）。在这个例子中，我们将使用 llvm/lib/Transforms/Utils/HelloWorld.cpp，这个文件已经被创建好了。如果你想创建自己的 Pass，可以在 llvm/lib/Transforms/Utils/CMakeLists.txt 中添加一个新的源文件（假设你想把你的 Pass 放在 Transforms/Utils 目录下）。

现在我们已经为新的 Pass 设置好了构建环境，接下来我们需要编写 Pass 本身的代码。

### 基本代码要求 {#writing-an-llvm-npm-pass-basiccode}

既然已经为新的 Pass 设置好了构建环境，我们现在只需要编写 Pass 的代码。

首先，我们需要在一个头文件中定义这个 Pass。我们将创建 llvm/include/llvm/Transforms/Utils/HelloWorld.h 文件。该文件应包含以下样板代码：

``` c++
#ifndef LLVM_TRANSFORMS_HELLONEW_HELLOWORLD_H
#define LLVM_TRANSFORMS_HELLONEW_HELLOWORLD_H

#include "llvm/IR/PassManager.h"

namespace llvm {

class HelloWorldPass : public PassInfoMixin<HelloWorldPass> {
public:
  PreservedAnalyses run(Function &F, FunctionAnalysisManager &AM);
};

} // namespace llvm

#endif // LLVM_TRANSFORMS_HELLONEW_HELLOWORLD_H
```


这段描述说明了如何创建一个 Pass 类，并声明 run() 方法，该方法实际执行 Pass 的功能。通过继承 PassInfoMixin<PassT>，我们可以避免亲自编写一些样板代码。我们的类位于 llvm 命名空间中，以避免污染全局命名空间。

接下来，我们将创建 llvm/lib/Transforms/Utils/HelloWorld.cpp 文件，并从以下内容开始：

``` c++
#include "llvm/Transforms/Utils/HelloWorld.h"  // 包含我们刚刚创建的头文件

using namespace llvm;  // 因为包含文件中的函数位于 llvm 命名空间中，所以需要这条语句。这应该只在非头文件中使用。

// Pass 的 `run` 方法定义
PreservedAnalyses HelloWorldPass::run(Function &F, FunctionAnalysisManager &AM) {
  errs() << F.getName() << "\n";  // 打印函数名到标准错误输出
  return PreservedAnalyses::all();  // 返回值表示所有的分析（例如支配树）在该 Pass 之后仍然有效，因为我们没有修改任何函数
}
```

该代码简单地将函数的名称打印到标准错误输出（stderr）。pass manager将确保这个pass会在模块中的每个函数上运行。PreservedAnalyses 的返回值表示所有分析（例如支配树）在此pass之后仍然有效，因为我们没有修改任何函数。

这就是该pass本身的内容。现在，为了“注册”这个 Pass，我们需要在几个地方添加一些代码。
在 llvm/lib/Passes/PassRegistry.def 中添加 Pass
在 llvm/lib/Passes/PassRegistry.def 文件的 FUNCTION_PASS 部分添加以下内容：

``` c++
FUNCTION_PASS("helloworld", HelloWorldPass())
```

这将 Pass 注册为名为 "helloworld" 的函数级 Pass。

在 llvm/lib/Passes/PassBuilder.cpp 中包含头文件
由于 llvm/lib/Passes/PassRegistry.def 被多次包含在 llvm/lib/Passes/PassBuilder.cpp 中，我们需要在 PassBuilder.cpp 中添加正确的 #include 语句：

``` c++
#include "llvm/Transforms/Utils/HelloWorld.h"
```

现在我们已经完成了 Pass 的所有必要代码，接下来是编译和运行它。
### 使用`opt`运行pass 

现在你已经有了一个全新的pass，我们可以构建 `opt`并使用它将一些 LLVM IR 代码通过该pass处理。

``` console
$ ninja -C build/ opt
# or whatever build system/build directory you are using

$ cat /tmp/a.ll
define i32 @foo() {
  %a = add i32 2, 3
  ret i32 %a
}

define void @bar() {
  ret void
}

$ build/bin/opt -disable-output /tmp/a.ll -passes=helloworld
foo
bar
```

Our pass ran and printed the names of functions as expected!

### 测试 Pass

测试我们的 Pass 非常重要，以防止将来出现回归问题。我们将在 llvm/test/Transforms/Utils/helloworld.ll 添加一个 lit 测试。有关测试的更多信息，请参阅《测试指南》。

``` llvm
$ cat llvm/test/Transforms/Utils/helloworld.ll
; RUN: opt -disable-output -passes=helloworld %s 2>&1 | FileCheck %s

; CHECK: {{^}}foo{{$}}
define i32 @foo() {
  %a = add i32 2, 3
  ret i32 %a
}

; CHECK-NEXT: {{^}}bar{{$}}
define void @bar() {
  ret void
}

$ ninja -C build check-llvm
# 运行我们的新测试以及其他所有的 LLVM lit 测试
```

## 常见问题解答 (FAQs)

### 必需的 Pass

一个定义了静态 isRequired() 方法并返回 true 的 Pass 被认为是必需的 Pass。例如：

``` c++
class HelloWorldPass : public PassInfoMixin<HelloWorldPass> {
public:
  PreservedAnalyses run(Function &F, FunctionAnalysisManager &AM);

  static bool isRequired() { return true; }
};
```

必需的 Pass 是指不能被跳过的 Pass。例如，`AlwaysInlinerPass` 是一个必需的 Pass，因为它必须始终运行以保持 `alwaysinline` 语义。Pass 管理器也是必需的，因为它们可能包含其他必需的 Pass。

一个 Pass 可能被跳过的例子是 `optnone` 函数属性，它指定不应该对该函数运行优化。然而，即使对于带有 `optnone` 属性的函数，必需的 Pass 仍然会被运行。

有关更多实现细节，请参阅 `PassInstrumentation::runBeforePass()`。

### 注册 Pass 插件

LLVM 提供了一种机制，可以在诸如 clang 或 opt 等工具中注册 Pass 插件。Pass 插件可以将 Pass 添加到默认的优化管道中，或者通过像 opt 这样的工具手动运行。更多详细信息，请参阅 `NewPassManager` 文档。

创建 CMake 项目
在仓库根目录下创建一个新的 CMake 项目，与其他项目并列。该项目必须包含以下最小的 `CMakeLists.txt` 文件：

``` cmake
add_llvm_pass_plugin(MyPassName source.cpp)
```

Pass 必须至少提供两个入口点之一，一个用于静态注册，另一个用于动态加载插件：

- llvm::PassPluginLibraryInfo get##Name##PluginInfo();
- extern "C" ::llvm::PassPluginLibraryInfo llvmGetPassPluginInfo() LLVM_ATTRIBUTE_WEAK;
Pass 插件默认是动态编译和链接的。将 `LLVM_${NAME}_LINK_INTO_TOOLS` 设置为 ON 可以将项目转换为静态链接扩展。

对于树中的例子，可以参考 `llvm/examples/Bye/`.

使 PassBuilder 获取静态链接的 Pass 插件：

``` c++
// 声明插件扩展函数声明
#define HANDLE_EXTENSION(Ext) llvm::PassPluginLibraryInfo get##Ext##PluginInfo();
#include "llvm/Support/Extension.def"

...

// 在 PassBuilder 中注册插件扩展
#define HANDLE_EXTENSION(Ext) get##Ext##PluginInfo().RegisterPassBuilderCallbacks(PB);
#include "llvm/Support/Extension.def"
```

使 PassBuilder 获取动态链接的 Pass 插件：

``` c++
// 动态加载插件
auto Plugin = PassPlugin::Load(PathToPlugin);
if (!Plugin)
  report_error();
// 在 PassBuilder 中注册插件扩展
Plugin->registerPassBuilderCallbacks(PB);
```
