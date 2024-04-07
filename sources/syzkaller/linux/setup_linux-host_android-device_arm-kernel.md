---
status: translated
title: "Setup: Linux host, Android device, arm32/64 kernel"
author: Syzkaller Community
collector: jxlpzqc
collected_date: 20240314
translator: Athanlaich
translated_date: 20240401
link: https://github.com/google/syzkaller/blob/master/docs/linux/setup_linux-host_android-device_arm-kernel.md
---

# 设置：Linux 主机，Android 设备，arm32/64 内核

**注意：对真实的 Android 设备进行内核模糊测试可能会使其被破坏。**

本文详细介绍了在 Android 设备上设置 syzkaller 实例对 `arm32/64` Linux 内核进行模糊测试的步骤。

一些 syzkaller 的功能可能在 `arm32` 上尚不能正常工作。例如，对于 `arm32`，Linux 内核中并不提供所有的调试和测试覆盖功能，这限制了 syzkaller 在快速发现错误方面的有效性。

这些步骤在 NXP Pico-Pi-IMX7D 上进行了测试，遵循了[这里](https://developer.android.com/things/hardware/developer-kits.html)的说明.

您可以在 syzkaller 的 `adb` vm 实现[这里](https://github.com/google/syzkaller/blob/master/vm/adb/adb.go)找到更多详细信息。

## 设备设置

按照您的开发板说明安装 Android，并确保设备正常启动。

设置 adb 桥接，使 adb 和 fastboot 正常工作。

设置串行端口，按照您设备的说明操作，以便监视内核日志消息。在基于 Android 的开发板上，串行端口通常以 USB（或某些自定义）端口，或通过 GPIO 引脚的形式暴露。在手机上，您可以使用 Android 串行电缆或[Suzy-Q](https://chromium.googlesource.com/chromiumos/platform/ec/+/master/docs/case_closed_debugging.md)。syzkaller 也可以在没有专用串行端口的情况下工作（通过回退到`adb shell dmesg -w`），但这是不可靠的，并且会将许多崩溃转换为 "丢失与测试机器的连接" 崩溃，并且没有额外的信息。

获取适合您设备的编译器工具链。

在您的开发板上重新编译并重新安装具有[调试内核选项](https://github.com/xairy/syzkaller/blob/up-docs/docs/linux/kernel_configs.md) 的 Linux 内核。你可能会从后向移植 KCOV 或 KASAN 补丁中受益。

## 构建 syzkaller

按照[这里](https://github.com/google/syzkaller/blob/master/docs/linux/setup.md#go-and-syzkaller)的说明获取 syzkaller。

然后根据您使用的设备，为 `arm` 或 `arm64` 目标架构构建 syzkaller。

``` bash
make TARGETOS=linux TARGETARCH=arm
```

``` bash
make TARGETOS=linux TARGETARCH=arm64
```

如果您使用的是旧版 Android `/dev/ion` 驱动程序（内核 <= 3.18），在构建 syzkaller 之前，请复制旧的`/dev/ion`描述：

``` bash
cp sys/android/* sys/linux
```

## 管理器配置

创建一个管理器配置文件 `android.cfg`：

```
{
	"target": "linux/arm",
	"http": "127.0.0.1:56741",
	"workdir": "$GOPATH/src/github.com/google/syzkaller/workdir",
	"kernel_obj": "$KERNEL",
	"syzkaller": "$GOPATH/src/github.com/google/syzkaller",
	"cover": true,
	"type": "adb",
	"vm": {
		"devices": [$DEVICES],
		"battery_check": true
	}
}
```

将变量 `$GOPATH`、`$KERNEL`（内核构建目录的路径）和 `$DEVICES` （由 adb devices 报告的您的开发板设备 ID，例如 `ABCD000010`）替换为实际值。

对于 `arm64`，使用  `"target": "linux/arm64"`。

如果您的内核不支持覆盖率收集（例如，没有 KCOV 补丁的 `arm32`），请设置 `"cover": false`。

如果您的设备没有电池服务，请关闭 `battery_check`，详情请参见[此处](/vm/adb/adb.go)的注释。

## 运行 syzkaller

运行 syzkaller 管理器：

``` bash
./bin/syz-manager -config=android.cfg
```

现在 syzkaller 应该正在运行，您可以在 web 浏览器中输入 `127.0.0.1:56741` 检查管理器状态。

如果在 `syz-manager`  启动后遇到问题，请考虑使用 `-debug` 标志运行。

此外，查看[此页面](https://github.com/google/syzkaller/blob/master/docs/troubleshooting.md)获取故障排除提示，并查看[使用 KASAN+KCOV 构建 Pixel 内核](https://source.android.com/devices/tech/debug/kasan-kcov)或[使用 KASAN+KCOV 构建 PH-1 内核](https://github.com/EssentialOpenSource/kernel-manifest/blob/master/README.md)以获取内核构建/启动说明。
