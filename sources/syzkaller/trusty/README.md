---
status: translated
title: "Trusty support"
author: Syzkaller Community
collector: jxlpzqc
collected_date: 20240314
translator: yinchunyuan
translated_date: 20251126
link: https://github.com/google/syzkaller/blob/master/docs/trusty/README.md
---

# 可靠的支持

[Trusty](https://source.android.com/security/trusty) 是一组在移动设备上支持可信执行环境（TEE）的软件组件。

工作仍在进行中，参考 #933。目前我们仅支持通过实际的应用程序端口测试 `Trusty`。

# 构建带有 Trusty IPC 支持的内核

```
git remote add android https://android.googlesource.com/kernel/common
git fetch android
git checkout android/android-trusty-4.9
make distclean
# TODO: 考虑使用 trusty_qemu_defconfig
make ARCH=arm64 ranchu64_defconfig
# 应启用 qemu 网络功能： 
make ARCH=arm64 defconfig
make ARCH=arm64 kvmconfig
# 一些自定义配置：
ARCH=arm64 ./scripts/kconfig/merge_config.sh .config trusty.config
# 我们未安装的模块：
sed -i 's#^\(.*\)=m$#\# \1 is not set#g' .config
make ARCH=arm64 olddefconfig
make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- -j64
```

```
# trusty.config
CONFIG_TRUSTY=y
CONFIG_DEBUG_FS=y
CONFIG_DEBUG_INFO=y
CONFIG_KCOV=y
CONFIG_KASAN=y
CONFIG_KASAN_INLINE=y
CONFIG_PROVE_LOCKING=y
CONFIG_DEBUG_ATOMIC_SLEEP=y
CONFIG_DEBUG_VM=y
CONFIG_LOCKUP_DETECTOR=y
CONFIG_BOOTPARAM_HARDLOCKUP_PANIC=y
CONFIG_BOOTPARAM_SOFTLOCKUP_PANIC=y
CONFIG_DETECT_HUNG_TASK=y
CONFIG_DEFAULT_HUNG_TASK_TIMEOUT=140
CONFIG_BOOTPARAM_HUNG_TASK_PANIC=y
CONFIG_WQ_WATCHDOG=y
```

# 构建 Trusty

```
mkdir trusty; cd trusty
repo init -u https://android.googlesource.com/trusty/manifest -b master
repo sync -j32
source trusty/vendor/google/aosp/scripts/envsetup.sh
make -j32 generic-arm64
# 构建 Trusty 和 qemu 镜像：
trusty/vendor/google/aosp/scripts/build.py qemu-generic-arm64-test-debug
# 创建 qemu-comb.dtb：
KERNEL_DIR=$KERNEL build-root/build-qemu-generic-arm64-test-debug/run-qemu
```

# 构建 arm64 镜像

```
git clone git://git.buildroot.net/buildroot
cd buildroot
make qemu_aarch64_virt_defconfig
support/kconfig/merge_config.sh .config syzkaller.config
make -j64
```

```
# syzkaller.config
BR2_cortex_a57=y
BR2_TOOLCHAIN_EXTERNAL=y
BR2_TOOLCHAIN_EXTERNAL_ARM_AARCH64=y
BR2_TARGET_GENERIC_HOSTNAME="syzkaller"
BR2_TARGET_GENERIC_ISSUE="syzkaller"
BR2_PACKAGE_DHCPCD=y
BR2_PACKAGE_OPENSSH=y
BR2_TARGET_ROOTFS_EXT2_SIZE="1G"
BR2_ROOTFS_POST_FAKEROOT_SCRIPT="./syzkaller.sh"
# BR2_LINUX_KERNEL is not set
```

```
# syzkaller.sh
set -eux
# 为 KCOV 挂载 debugfs。
echo "debugfs /sys/kernel/debug debugfs defaults 0 0" >> $1/etc/fstab
# 生成并安装 ssh 密钥。
rm -f key key.pub
ssh-keygen -f key -t rsa -N ""
mkdir -p $1/root/.ssh
cp key.pub $1/root/.ssh/authorized_keys
```

# Testing build 测试构建

TODO: 固件来自哪里？

在 qemu 中启动：
```
cd $TRUSTY/build-root/build-qemu-generic-arm64-test-debug/atf/qemu/debug
$TRUSTY/build-root/build-qemu-generic-arm64-test-debug/qemu-build/aarch64-softmmu/qemu-system-aarch64 -m 1024 -smp 1 -net nic -net user,host=10.0.2.10,hostfwd=tcp::10022-:22 -display none -serial stdio -no-reboot -machine virt,secure=on,virtualization=on -cpu cortex-a57 -bios $TRUSTY/build-root/build-qemu-generic-arm64-test-debug/atf/qemu/debug/bl1.bin -d unimp -semihosting-config enable,target=native -no-acpi -dtb $TRUSTY/build-root/build-qemu-generic-arm64-test-debug/atf/qemu/debug/qemu-comb.dtb -hda $BUILDROOT/output/images/rootfs.ext4 -snapshot -kernel $KERNEL/arch/arm64/boot/Image -append "androidboot.hardware=qemu_trusty earlyprintk=serial console=ttyAMA0,38400 root=/dev/vda"
```

通过 SSH 进入虚拟机：
```
ssh -i $BUILDROOT/key -p 10022 -o IdentitiesOnly=yes root@localhost
```

# 运行 syzkaller

构建并运行 `syzkaller` 通过：
```
cd $SYZKALLER
make TARGETARCH=arm64
cd $TRUSTY/build-root/build-qemu-generic-arm64-test-debug/atf/qemu/debug
$SYZKALLER/bin/syz-manager -config trusty.cfg
```

使用下面的配置（用实际值代替 `$KERNEL`, `$SYZKALLER`, `$BUILDROOT` 和 `$TRUSTY`）：
```
{
	"name": "trusty",
	"target": "linux/arm64",
	"http": ":10000",
	"workdir": "/workdir",
	"kernel_obj": "$KERNEL",
	"syzkaller": "$SYZKALLER",
	"image": "$BUILDROOT/output/images/rootfs.ext4",
	"sshkey": "$BUILDROOT/key",
	"cover": false,
	"procs": 4,
	"type": "qemu",
	"vm": {
		"count": 4,
		"cpu": 1,
		"mem": 1024,
		"qemu": "$TRUSTY/build-root/build-qemu-generic-arm64-test-debug/qemu-build/aarch64-softmmu/qemu-system-aarch64",
		"qemu_args": "-machine virt,secure=on,virtualization=on -cpu cortex-a57 -bios $TRUSTY/build-root/build-qemu-generic-arm64-test-debug/atf/qemu/debug/bl1.bin -d unimp -semihosting-config enable,target=native -no-acpi -dtb $TRUSTY/build-root/build-qemu-generic-arm64-test-debug/atf/qemu/debug/qemu-comb.dtb",
		"cmdline": "androidboot.hardware=qemu_trusty console=ttyAMA0,38400 root=/dev/vda",
		"kernel": "$KERNEL/arch/arm64/boot/Image"
	},
	"enable_syscalls": [
		"openat$trusty*",
		"write$trusty*",
		"read",
		"ioctl$TIPC_IOC_CONNECT*",
		"ppoll",
		"dup3",
		"tkill",
		"gettid",
		"close"
	]
}
```
