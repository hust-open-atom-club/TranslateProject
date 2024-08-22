---
status: published
title: "Troubleshooting"
author: Syzkaller Community
collector: jxlpzqc
collected_date: 20240314
translator: mudongliang
translated_date: 20240814
proofreader: QGrain
proofread_date: 20240815
publisher: mudongliang
published_date: 20240815
link: https://github.com/google/syzkaller/blob/master/docs/troubleshooting.md
---

# 故障排查

如果你在运行 syzkaller 时遇到问题，以下是一些故障排除的方法：

 - 使用 `-debug` 命令行选项使 syzkaller 打印所有可能的调试输出，来自于 `syz-manager` 顶级程序及 `syz-fuzzer` 实例。使用这个选项时，syzkaller 只会运行一个虚拟机实例。

 - 使用 `-vv N` 命令行选项增加来自 `syz-manager` 顶级程序和 `syz-fuzzer` 实例的日志输出量（输出文件位于工作目录的 `crashes` 子目录中）。N 的值越大，输出的日志就越多。

 - 如果日志显示执行程序（executor）出现问题（例如 `executor failure`），请尝试手动运行一个短系统调用序列：
     - 将 `syz-executor` 和 `syz-execprog` 复制到正在运行的虚拟机中。
     - 在虚拟机中运行 `./syz-execprog -executor ./syz-executor -debug sampleprog`，其中 `sampleprog` 是一个简单的系统调用脚本（例如仅包含 `getpid()`）。
     - 例如，如果上述命令报告 `clone` 失败，这可能表明测试内核没有包含所有必需的命名空间支持。在这种情况下，使用 `-sandbox=setuid` 选项运行 `syz-execprog` 可解决问题，因此主要配置需要更新，将 `sandbox` 设置为 `setuid`。

 - 如果 syzkaller 在虚拟机启动后不久就打印出 `failed to copy binary` 错误：
     - 如果你使用的是 Buildroot 镜像，并且错误输出包含 `subsystem request failed on channel 0` 这一行，这可能是由于 [OpenSSH 9.0 更改](https://www.openssh.com/txt/release-9.0) 强制使用 SFTP 协议。升级你的 Buildroot 镜像到最新版本，并确保在其中启用了 SFTP。

另外，也可以查看 [Linux 内核特定的故障排除建议](linux/troubleshooting.md)。

如果上述方法都没有帮助，可以在 [错误跟踪器（bug tracker）](https://github.com/google/syzkaller/issues) 上提交 bug，或者直接在 syzkaller@googlegroups.com 邮件列表上询问我们。如果可以，请附上你使用的 syzkaller 版本号和启用了 `-debug` 标志的 `syz-manager` 输出。
