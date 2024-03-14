---
status: collected
title: "Continuous integration fuzzing"
author: Syzkaller Community
collector: chengziqiu
collected_date: 20240314
link: https://github.com/google/syzkaller/blob/master/docs/ci.md
---

# Continuous integration fuzzing

[syz-ci](../syz-ci/) command provides support for continuous fuzzing with syzkaller.
It runs several syz-manager's, polls and rebuilds images for managers and polls
and rebuilds syzkaller binaries.
