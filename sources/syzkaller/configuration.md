---
status: collected
title: "Configuration"
author: Syzkaller Community
collector: jxlpzqc
collected_date: 20240314
link: https://github.com/google/syzkaller/blob/master/docs/configuration.md
---

# Configuration

The operation of the syzkaller `syz-manager` process is governed by a
configuration file, passed at invocation time with the `-config` option.
This configuration can be based on the [example](/pkg/mgrconfig/testdata/qemu.cfg);
the file is in JSON format and contains the the [following parameters](/pkg/mgrconfig/config.go).
