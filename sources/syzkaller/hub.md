---
status: proofread
title: "Connecting several managers via Hub"
author: Syzkaller Community
collector: jxlpzqc
translator: CAICAIIs
proofreader: mudongliang
collected_date: 20240314
translated_date: 20250217
proofread_date: 20250715
priority: 10
link: https://github.com/google/syzkaller/blob/master/docs/hub.md
---

# 通过 Hub 连接多个管理器

`syz-hub` 程序可用于将多个 `syz-manager` 连接在一起，并允许它们交换测试程序。

使用 `make hub` 编译 `syz-hub`。然后按以下格式创建配置文件：

```
{
	"http": ":80",
	"rpc":  ":55555",
	"workdir": "/syzkaller/workdir",
	"clients": [
		{"name": "manager1", "key": "6sCFsJVfyFQVhWVKJpKhHcHxpCH0gAxL"},
		{"name": "manager2", "key": "FZFSjthHHf8nKm2cqqAcAYKM5a3XM4Ao"},
		{"name": "manager3", "key": "fTrIBQCmkEq8NsvQXZiOUyop6uWLBuzf"}
	]
}
```

使用 `bin/syz-hub -config hub.cfg` 启动 hub，然后在每个管理器的 `syz-manager` 配置文件中添加以下额外参数：

```
	"name": "manager1",
	"hub_client": "manager1",
	"hub_addr": "1.2.3.4:55555",
	"hub_key": "6sCFsJVfyFQVhWVKJpKhHcHxpCH0gAxL",
```

启动管理器后，当它们完成本地语料库的分类整理，便会连接到 hub 并开始交换测试输入。
Hub 和管理器的网页界面都会显示它们从 hub 发送/接收的测试输入数量。
