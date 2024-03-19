---
status: translated
title: "Linux kernel configs"
author: Syzkaller Community
collector: li-zhaoyang101
collected_date: 20240305
translator: RutingZhang0429
translated_date: 20240317
link: https://github.com/google/syzkaller/blob/master/docs/linux/kernel_configs.md
---

# Linux 内核配置

推荐的 `syzkaller` 内核配置一览。参考配置详见 [syzbot config](/dashboard/config/linux/upstream-apparmor-kasan.config)。

## Syzkaller 功能

启用覆盖率收集对于提高模糊测试的有效性极其重要：
```
CONFIG_KCOV=y
CONFIG_KCOV_INSTRUMENT_ALL=y
CONFIG_KCOV_ENABLE_COMPARISONS=y
CONFIG_DEBUG_FS=y
```
注意到如果你在测试一个旧版内核，`CONFIG_KCOV_ENABLE_COMPARISONS` 功能也要求 `gcc8+` 和如下的修改:
```
    kcov: support comparison operands collection
    kcov: fix comparison callback signature
```

使用 [内核内存泄露检测器
(kmemleak)](https://gitee.com/hust-open-atom-club/translate-project/blob/master/sources/kernel/20240301%20Kernel%20Memory%20Leak%20Detector.md) 检测内存泄漏：

```
CONFIG_DEBUG_KMEMLEAK=y
```

在网页界面显示代码覆盖率：
```
CONFIG_DEBUG_INFO=y
```

检测启用的系统调用和内核字长：
```
CONFIG_KALLSYMS=y
CONFIG_KALLSYMS_ALL=y
```

为了更好地构建沙盒：
```
CONFIG_NAMESPACES=y
CONFIG_UTS_NS=y
CONFIG_IPC_NS=y
CONFIG_PID_NS=y
CONFIG_NET_NS=y
CONFIG_CGROUP_PIDS=y
CONFIG_MEMCG=y
```

为利用 `namespace` 实现沙盒：
```
CONFIG_USER_NS=y
```

为了在虚拟机中运行，通常需要 `make kvm_guest.config`。

[tools/create-image.sh](/tools/create-image.sh) 生成的 Debian 镜像还需要：
```
CONFIG_CONFIGFS_FS=y
CONFIG_SECURITYFS=y
```

推荐关闭如下配置 (如果你的内核没有修改 [arm64: setup: introduce kaslr_offset()](https://github.com/torvalds/linux/commit/7ede8665f27cde7da69e8b2fbeaa1ed0664879c5)
 和 [kcov: make kcov work properly with KASLR enabled](https://github.com/torvalds/linux/commit/4983f0ab7ffaad1e534b21975367429736475205) 则必须关闭)：
```
# CONFIG_RANDOMIZE_BASE is not set
```

同时，推荐关闭可预测的网络接口命名机制。该机制可通过 syzkaller 配置或调整如下配置来关闭：
```
CONFIG_CMDLINE_BOOL=y
CONFIG_CMDLINE="net.ifnames=0"
```

## 漏洞检测配置

Syzkaller 可与
[KASAN](https://kernel.org/doc/html/latest/dev-tools/kasan.html) （设置可用的上游 `CONFIG_KASAN=y`），[KTSAN](https://github.com/google/ktsan) （原型可用），[KMSAN](https://github.com/google/kmsan) （原型可用），或者 [KUBSAN](https://kernel.org/doc/html/latest/dev-tools/ubsan.html) (设置可用的上游 `CONFIG_UBSAN=y`) 配合使用。

为检测释放后使用和越界访问漏洞，启用 `KASAN`：
```
CONFIG_KASAN=y
CONFIG_KASAN_INLINE=y
```

为使用故障注入测试，启动如下配置（syzkaller 会自动识别它）：
```
CONFIG_FAULT_INJECTION=y
CONFIG_FAULT_INJECTION_DEBUG_FS=y
CONFIG_FAULT_INJECTION_USERCOPY=y
CONFIG_FAILSLAB=y
CONFIG_FAIL_PAGE_ALLOC=y
CONFIG_FAIL_MAKE_REQUEST=y
CONFIG_FAIL_IO_TIMEOUT=y
CONFIG_FAIL_FUTEX=y
```
请注意，如果你在测试一个旧版内核，你需要进行如下修改：
```
    fault-inject: support systematic fault injection
    fault-inject: simplify access check for fail-nth
    fault-inject: fix wrong should_fail() decision in task context
    fault-inject: add /proc/<pid>/fail-nth
```

其他调试配置，越多越好，这里展示一些被证明特别有用的配置：
```
CONFIG_LOCKDEP=y
CONFIG_PROVE_LOCKING=y
CONFIG_DEBUG_ATOMIC_SLEEP=y
CONFIG_PROVE_RCU=y
CONFIG_DEBUG_VM=y
CONFIG_REFCOUNT_FULL=y
CONFIG_FORTIFY_SOURCE=y
CONFIG_HARDENED_USERCOPY=y
CONFIG_LOCKUP_DETECTOR=y
CONFIG_SOFTLOCKUP_DETECTOR=y
CONFIG_HARDLOCKUP_DETECTOR=y
CONFIG_BOOTPARAM_HARDLOCKUP_PANIC=y
CONFIG_DETECT_HUNG_TASK=y
CONFIG_WQ_WATCHDOG=y
```

增加挂起/暂停时间限制来减少错误误报率：
```
CONFIG_DEFAULT_HUNG_TASK_TIMEOUT=140
CONFIG_RCU_CPU_STALL_TIMEOUT=100
```
