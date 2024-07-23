---
status: published
title: "Setup"
author: Syzkaller Community
collector: jxlpzqc
collected_date: 20240314
translator: keepgogogo
translated_date: 20240407
proofreader: mudongliang
proofread_date: 20240712
publisher: mudongliang
publish_date: 20240723
link: https://github.com/google/syzkaller/blob/master/docs/openbsd/setup.md
---

# 指南

以下为创建 amd64 架构 OpenBSD 主机和 OpenBSD 虚拟机的指令。另外，主机必须运行 `-current` 分支。

在整个操作指南中使用的变量如下：

- `$KERNEL` - 自定义编译的内核，参见 [编译内核](#编译内核)。
              如果遵循本指南，则默认值为 `/sys/arch/amd64/compile/SYZKALLER/obj/bsd`。 
- `$SSHKEY` - 用于连接至虚拟机且**不含密码**的 SSH 密钥，建议使用专用密钥。
- `$USER`   - 用于运行 syzkaller 的用户名。
- `$VMIMG`  - 虚拟机磁盘镜像。
- `$VMID`   - 最近启动的虚拟机的数字 ID。

## 安装 syzkaller

1. 安装依赖：

   ```sh
   # pkg_add git gmake go
   ```

   为了让 syzkaller 复现工具正常工作，还需要安装来自 ports 的 GCC：

   ```sh
   # pkg_add gcc
   ```

2. 复刻仓库：

   ```sh
   $ git clone https://github.com/google/syzkaller
   $ cd syzkaller
   $ gmake all
   ```

## 编译内核

若要成功编译一个 `GENERIC` 内核，[kcov(4)](https://man.openbsd.org/kcov.4) 必须启用：

```sh
$ cd /sys/arch/amd64
$ cat <<EOF >conf/SYZKALLER
include "arch/amd64/conf/GENERIC"
pseudo-device kcov 1
EOF
$ cp -R compile/GENERIC compile/SYZKALLER
$ make -C compile/SYZKALLER obj
$ make -C compile/SYZKALLER config
$ make -C compile/SYZKALLER
```

## 创建虚拟机

1. 必须配置 [vmd(8)](https://man.openbsd.org/vmd.8) 来允许非 root 用户创建虚拟机，这可以避免以 root 用户来运行 syzkaller：

   ```sh
   $ cat /etc/vm.conf
   vm "syzkaller" {
     disable
     disk "/dev/null"
     local interface
     owner $USER
     allow instance { boot, disk, memory }
   }
   ```

2. 创建磁盘映像：

   ```sh
   $ vmctl create -s 4G "qcow2:$VMIMG"
   ```

3. 安装虚拟机：

   ```sh
   $ vmctl start -c -t syzkaller -b /bsd.rd -d "$VMIMG" syzkaller-1
   ```

   对偏离默认值的问题的回答：

   ```
   Password for root account? ******
   Allow root ssh login? yes
   ```

4. 重启新创建的虚拟机并复制 SSH 密钥：

   ```sh
   $ vmctl stop -w syzkaller-1
   $ vmctl start -c -t syzkaller -d "$VMIMG" syzkaller-1
   $ ssh "root@100.64.${VMID}.3" 'cat >~/.ssh/authorized_keys' <$SSHKEY.pub
   ```

5. 可选地，可以禁用 ASLR 库来提升开机速度：

   ```sh
   $ ssh "root@100.64.${VMID}.3" 'echo library_aslr=NO >>/etc/rc.conf.local'
   ```

6. 最后，停止虚拟机：

   ```sh
   $ vmctl stop -w syzkaller-1
   ```

## 配置并运行 syzkaller

```sh
$ pwd
~/go/src/github.com/google/syzkaller
$ cat openbsd.cfg
{
  "name": "openbsd",
  "target": "openbsd/amd64",
  "http": ":10000",
  "workdir": "$HOME/go/src/github.com/google/syzkaller/workdir",
  "kernel_obj": "/sys/arch/amd64/compile/SYZKALLER/obj",
  "kernel_src": "/",
  "syzkaller": "$HOME/go/src/github.com/google/syzkaller",
  "image": "$VMIMG",
  "sshkey": "$SSHKEY",
  "sandbox": "none",
  "procs": 2,
  "type": "vmm",
  "vm": {
    "count": 4,
    "mem": 512,
    "kernel": "$KERNEL",
    "template": "syzkaller"
  }
}
$ ./bin/syz-manager -config openbsd.cfg
```
