---
status: published
title: "Troubleshooting"
author: Syzkaller Community
collector: jxlpzqc
collected_date: 20240314
translator: wyywwi
translated_date: 20240317
proofreader: mudongliang
proofread_date: 20240406
publisher: JasonC10
published_date: 20240419
link: https://github.com/google/syzkaller/blob/master/docs/linux/troubleshooting.md
---

# 故障排除

如果您在运行 syzkaller 时遇到问题，请检查以下几点。

 - 检查 QEMU 是否能成功启动虚拟机。例如，如果 `IMAGE` 设置为虚拟机的磁盘映像（根据 `image` 选项的配置值），并且 `KERNEL` 设置为测试内核（根据 `kernel` 选项的配置值），那么类似以下的命令应该能成功启动虚拟机：

     ```shell
     qemu-system-x86_64 -hda $IMAGE -m 256 -net nic -net user,host=10.0.2.10,hostfwd=tcp::23505-:22 -enable-kvm -kernel $KERNEL -append root=/dev/sda
     ```
 - 检查运行中的虚拟机的 SSH 服务器是否正常工作。例如，当虚拟机正常运行且 `SSHKEY` 设置为对应的 SSH 身份信息（根据 `sshkey` 的配置值获取）时，以下命令应该可以连接虚拟机：

     ```shell
     ssh -i $SSHKEY -p 23505 root@localhost
     ```
 - 如果你 *确实* 遇到了 SSH 连接困难，请确保你的内核配置已启用网络。有时内核的 defconfig 会过于简洁，而省略了以下必要选项：
     ```shell
     CONFIG_VIRTIO_NET=y
     CONFIG_E1000=y
     CONFIG_E1000E=y
     ```
 - 如果虚拟机报告 "Failed to start Raise network interfaces" 错误，或 syzkaller 无法连接到虚拟机（这是上述错误的结果），请尝试禁用**可预测的网络接口命名**（即 Predictable Network Interface Names）机制。可使用如下两种方法禁用该机制：
    - 在内核配置文件中添加以下两行并重新编译内核。
      ```
      CONFIG_CMDLINE_BOOL=y
      CONFIG_CMDLINE="net.ifnames=0"
      ```
    - 在 syzkaller 管理配置中的虚拟机属性中添加如下行：
      ```
      "cmdline": "net.ifnames=0"
      ```

      添加后的配置示例如下：
      ```json
      {
        "target": "linux/amd64",
        "http": "127.0.0.1:56741",
        "workdir": "$GOPATH/src/github.com/google/syzkaller/workdir",
        "kernel_obj": "$KERNEL",
        "image": "$IMAGE/bullseye.img",
        "sshkey": "$IMAGE/bullseye.id_rsa",
        "syzkaller": "$GOPATH/src/github.com/google/syzkaller",
        "procs": 8,
        "type": "qemu",
        "vm": {
            "count": 4,
            "kernel": "$KERNEL/arch/x86/boot/bzImage",
            "cmdline": "net.ifnames=0",
            "cpu": 2,
            "mem": 2048
        }
      }
      ```

      然而，这并不保证其在所有虚拟化技术中都能工作。
 - 检查 `CONFIG_KCOV` 选项是否在虚拟机内可用：
    - `ls /sys/kernel/debug       # 检查是否挂载了debugfs`
    - `ls /sys/kernel/debug/kcov  # 检查kcov是否启用`
    - 从 `Documentation/kcov.txt` 构建测试程序并在虚拟机内运行。
 - 检查调试信息（来自 `CONFIG_DEBUG_INFO` 选项）是否可用：
    - 将 kcov 测试程序的十六进制输出传递给 `addr2line -a -i -f -e $VMLINUX`（其中 `VMLINUX` 是 vmlinux 文件，从 `kernel_obj` 配置值获取），以确认内核符号可用。

也可以查看[此处](https://github.com/google/syzkaller/docs/troubleshooting.md)了解通用的故障排除建议。

如果以上方法都没有帮助，请在[错误追踪器](https://github.com/google/syzkaller/issues)上提交错误，或直接通过 syzkaller@googlegroups.com 邮件列表询问我们。请在问题中包含您使用的 syzkaller 版本和 `-debug` 标志启用时的 `syz-manager` 输出（如果适用的话）。
