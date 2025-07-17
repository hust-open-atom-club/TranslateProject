---
status: proofread
title: "Headerparser"
author: Syzkaller Community
collector: mudongliang
collected_date: 20240304
translator: Kozmosa
translated_date: 20250717
proofreader: mudongliang
proofread_date: 20250717
priority: 10
link: https://github.com/google/syzkaller/blob/master/docs/headerparser_usage.md
---

# Headerparser

headerparser 是一个为 syzkaller 编写设备系统调用描述的辅助工具。

为了让 syzkaller 更智能地对设备节点开展模糊测试，你可以向它提供其预期的 ioctl 参数结构体类型信息。

然而，在某些情况下，参数结构体类型的数量可能很多，这增加了编写结构体类型描述文件所需的人工工作量。

为了减轻编写 ioctl 参数类型描述文件的工作量，headerlib 会尽力自动化生成这些文件。但你仍然要从[此处](/docs/syscall_descriptions_syntax.md)的类型列表中手动选择合适的 syzkaller 数据类型。

## 依赖项

Headerlib 使用 pycparser。你可以使用 pip 来安装 pycparser。

```shell
$ pip install pycparser
```

## 使用 Headerparser

```shell
$ python headerparser.py --filenames=./test_headers/th_b.h
B {
          B1     len|fileoff|flags|intN     #(unsigned long)
          B2     len|fileoff|flags|intN     #(unsigned long)
}
struct_containing_union {
          something          len|fileoff|flags|int32                   #(int)
          a_union.a_char     ptr[in|out, string]|ptr[in, filename]     #(char*)
          a_union.B_ptr      ptr|buffer|array                          #(struct B*)
}
```

你可以将 `Structure Metadata` 下方的内容复制粘贴到你的 syzkaller 设备描述中。

## 出现问题时

让我们尝试解析 `test_headers/th_a.h` 头文件来生成参数结构体。

```shell
$ python headerparser.py --filenames=./test_headers/th_a.h
ERROR:root:HeaderFilePreprocessorException: /tmp/tmpW8xzty/source.o:36:2: before: some_type

$ python headerparser.py --filenames=./test_headers/th_a.h --debug
DEBUG:GlobalHierarchy:load_header_files : ['./test_headers/th_a.h']
DEBUG:HeaderFilePreprocessor:HeaderFilePreprocessor._mktempfiles: sourcefile=/tmp/tmpbBQYhR/source.cobjectfile=/tmp/tmpbBQYhR/source.o
DEBUG:HeaderFilePreprocessor:HeaderFilePreprocessor.execute: cp ./test_headers/th_a.h /tmp/tmpbBQYhR
DEBUG:HeaderFilePreprocessor:HeaderFilePreprocessor.execute: gcc -I. -E -P -c /tmp/tmpbBQYhR/source.c > /tmp/tmpbBQYhR/source.o
ERROR:root:HeaderFilePreprocessorException: /tmp/tmpbBQYhR/source.o:36:2: before: some_type
```

我们可以从错误信息中发现，错误发生是因为 pycparser 无法识别 some_type 这个类型。我们使用 pycparser 识别这个未知类型以解决这个问题。为此，我们向 headerparser 提供一个包含文件，其中含有能够修复该解析错误的 C 语言声明和包含指令。

```shell
$ cat > include_file
typedef int some_type;
$ python headerparser.py --filenames=./test_headers/th_a.h --include=./include_file
A {
          B_item              ptr|buffer|array                          #(struct B*)
          char_ptr            ptr[in|out, string]|ptr[in, filename]     #(char*)
          an_unsigned_int     len|fileoff|int32                         #(unsigned int)
          a_bool              _Bool                                     #(_Bool)
          another_bool        _Bool                                     #(_Bool)
          var                 some_type                                 #(some_type)
}
```
