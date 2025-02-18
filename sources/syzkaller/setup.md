---
status: translated
title: "How to set up syzkaller"
author: Syzkaller Community
collector: mudongliang
translator: CAICAIIs
collected_date: 20240304
translated_date: 20250217
priority: 10
link: https://github.com/google/syzkaller/blob/master/docs/setup.md
---

# 如何设置 syzkaller

针对 Linux 内核进行模糊测试的通用设置说明概述于[此处](linux/setup.md).

其他内核的配置方法请参见：
[Akaros](akaros/README.md),
[FreeBSD](freebsd/README.md),
[Darwin/XNU](darwin/README.md),
[Fuchsia](fuchsia/README.md),
[NetBSD](netbsd/README.md),
[OpenBSD](openbsd/setup.md),
[Windows](windows/README.md).

按照说明完成设置后，您应该能够运行 `syz-manager`，看到它执行测试程序，并能够访问 `http://127.0.0.1:56741`（或您在管理配置中指定的其他地址）提供的统计数据。若一切运行正常，典型的执行日志如下所示：

```
$ ./bin/syz-manager -config=my.cfg
2017/06/14 16:39:05 loading corpus...
2017/06/14 16:39:05 loaded 0 programs (0 total, 0 deleted)
2017/06/14 16:39:05 serving http on http://127.0.0.1:56741
2017/06/14 16:39:05 serving rpc on tcp://127.0.0.1:34918
2017/06/14 16:39:05 booting test machines...
2017/06/14 16:39:05 wait for the connection from test machine...
2017/06/14 16:39:59 received first connection from test machine vm-9
2017/06/14 16:40:05 executed 293, cover 43260, crashes 0, repro 0
2017/06/14 16:40:15 executed 5992, cover 88463, crashes 0, repro 0
2017/06/14 16:40:25 executed 10959, cover 116991, crashes 0, repro 0
2017/06/14 16:40:35 executed 15504, cover 132403, crashes 0, repro 0
```

此时需确保 syzkaller 能够收集已执行程序的代码覆盖率（除非您在配置中指定了 `"cover": false` 或您测试的内核尚未支持覆盖率收集）。网页上的 `cover` 计数器应显示非零值。

配置文件格式的更多信息请参见[此处](configuration.md).

故障排查技巧请参阅[此文档](troubleshooting.md)。