---
status: translated
title: "Setup: Linux isolated host"
author: Syzkaller Community
collector: chengziqiu
collected_date: 20240314
translater: xiaobor123
translate_data: 20240317
link: https://github.com/google/syzkaller/blob/master/docs/linux/setup_linux-host_isolated.md
---

# 设置: Linux 隔离主机

以下是如何在隔离计算机上的内核进行模糊测试的指导。
隔离机器以一种限制远程管理的的方式被分开。
由于其特定的硬件设置，我们可能有兴趣对其模糊测试。

这个 syzkaller 配置仅使用SSH来启动和监视一个隔离机器。

## 设置反向代理支持

考虑到可能只有 SSH 可用，我们将使用反向 SSH 代理来允许模糊实例和管理器进行通信。

确保目标机器上的 sshd 配置中 AllowTcpForwarding 设置为 yes。
```
machine:~# grep Forwarding /etc/ssh/sshd_config
AllowTcpForwarding yes
```

## 内核

被隔离的虚拟机不部署内核映像，因此确保目标机器上的内核是使用以下选项构建的：
```
CONFIG_KCOV=y
CONFIG_DEBUG_INFO=y
CONFIG_KASAN=y
CONFIG_KASAN_INLINE=y
```

当 KASLR 被禁用时，代码覆盖率效果更好：
```
# CONFIG_RANDOMIZE_BASE is not set
```

## 可选：重用现有的 SSH 连接

在大多数情况下，您应该使用 SSH 密钥连接到目标机器。隔离配置支持 SSH 密钥，如通用[设置](setup.md)中所述。

如果您无法使用 SSH 密钥，您应该配置您的管理机器以重用现有的 SSH 连接。

将以下行添加到您的 ~/.ssh/config 文件中：
```
Host *
	ControlMaster auto
	ControlPath ~/.ssh/control:%h:%p:%r
```

在进行模糊测试之前，连接到机器并保持连接打开，这样所有的 scp 和 ssh 使用都会重用该连接。

# 可选：Pstore 支持


如果被测试的设备（DUT）支持 Pstore，则可以配置 syzkaller 从 /sys/fs/pstore 获取崩溃日志。您可以在 syzkaller 配置文件的 `vm` 节中设置 `"pstore": true` 来实现这一点。

# 可选：启动脚本

要在模糊测试（重新）开始之前在 DUT 上执行命令，可以使用 startup_script。

## Syzkaller

按照[这里](/docs/linux/setup.md#go-and-syzkaller)描述的步骤构建 syzkaller。

使用以下配置：
```
{
	"target": "linux/amd64",
	"http": "127.0.0.1:56741",
	"rpc": "127.0.0.1:0",
	"sshkey" : "/path/to/optional/sshkey",
	"workdir": "/syzkaller/workdir",
	"kernel_obj": "/linux-next",
	"syzkaller": "/go/src/github.com/google/syzkaller",
	"sandbox": "setuid",
	"type": "isolated",
	"vm": {
		"targets" : [ "10.0.0.1" ],
		"pstore": false,
		"target_dir" : "/home/user/tmp/syzkaller",
                "target_reboot" : false
	}
}
```

不要忘记更新：
 - `target` (目标操作系统/架构)
 - `workdir` (工作目录路径)
 - `kernel_obj` (内核构建目录的路径)
 - `sshkey` 您可以设置一个SSH密钥（可选）
 - `vm.targets` 用于模糊测试的主机列表
 - `vm.target_dir` 目标主机上的工作目录
 - `vm.target_reboot` 如果远程进程挂起，则重新启动机器（对于广泛模糊测试很有用，默认情况下为false）

运行 syzkaller manager：
``` bash
./bin/syz-manager -config=my.cfg
```
如果在启动 syz-manager 后遇到问题，请考虑使用 -debug 标志运行它。同时参阅[此页面](/docs/troubleshooting.md)以获取故障排除提示。
