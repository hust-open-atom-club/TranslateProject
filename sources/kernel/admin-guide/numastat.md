---
status: collected
title: "Numa policy hit/miss statistics"
author: Linux Kernel Community
collector: tttturtle-russ
collected_date: 20240718
link: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/admin-guide/numastat.rst
---

# Numa policy hit/miss statistics

/sys/devices/system/node/node\*/numastat

All units are pages. Hugepages have separate counters.

The numa_hit, numa_miss and numa_foreign counters reflect how well
processes are able to allocate memory from nodes they prefer. If they
succeed, numa_hit is incremented on the preferred node, otherwise
numa_foreign is incremented on the preferred node and numa_miss on the
node where allocation succeeded.

Usually preferred node is the one local to the CPU where the process
executes, but restrictions such as mempolicies can change that, so there
are also two counters based on CPU local node. local_node is similar to
numa_hit and is incremented on allocation from a node by CPU on the same
node. other_node is similar to numa_miss and is incremented on the node
where allocation succeeds from a CPU from a different node. Note there
is no counter analogical to numa_foreign.

In more detail:

+-----------------+----------------------------------------------------+
| numa_hit A pr   | ocess wanted to allocate memory from this node,    |
+-----------------+----------------------------------------------------+
| > and succ      | eeded.                                             |
+-----------------+----------------------------------------------------+
| numa_miss A pr  | ocess wanted to allocate memory from another node, |
+-----------------+----------------------------------------------------+
| > but ende      | d up with memory from this node.                   |
+-----------------+----------------------------------------------------+
| numa_foreign    | A process wanted to allocate on this node,         |
+-----------------+----------------------------------------------------+
| > but ende      | d up with memory from another node.                |
+-----------------+----------------------------------------------------+
| local_node A pr | ocess ran on this node\'s CPU,                     |
+-----------------+----------------------------------------------------+
| > and got       | memory from this node.                             |
+-----------------+----------------------------------------------------+
| other_node A pr | ocess ran on a different node\'s CPU               |
+-----------------+----------------------------------------------------+
| > and got       | memory from this node.                             |
+-----------------+----------------------------------------------------+
| interleave_hit  | Interleaving wanted to allocate from this node     |
+-----------------+----------------------------------------------------+
| > and succ      | eeded.                                             |
+-----------------+----------------------------------------------------+

For easier reading you can use the numastat utility from the numactl
package (<http://oss.sgi.com/projects/libnuma/>). Note that it only
works well right now on machines with a small number of CPUs.

Note that on systems with memoryless nodes (where a node has CPUs but no
memory) the numa_hit, numa_miss and numa_foreign statistics can be
skewed heavily. In the current kernel implementation, if a process
prefers a memoryless node (i.e. because it is running on one of its
local CPU), the implementation actually treats one of the nearest nodes
with memory as the preferred node. As a result, such allocation will not
increase the numa_foreign counter on the memoryless node, and will skew
the numa_hit, numa_miss and numa_foreign statistics of the nearest node.
