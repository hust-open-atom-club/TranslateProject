---
status: collected
author: Jake Edge
colletor: Felix Jing
collected_time: 20240224
translated_time: 
translator: 
proofreader: 
---

# Supplementing CVEs with !CVEs [LWN.net]
The [Common Vulnerabilities and Exploits](https://www.cve.org/) (CVE) system
is the main mechanism for tracking various security flaws, using the
omnipresent CVE number—even vulnerabilities with fancy names and web sites
have CVE numbers. But the CVE system is not without its critics and, in truth,
the incentives between the reporting side and those responsible for handling
the bugs have always been misaligned, which leads to abuse of various kinds.
There have been [efforts to combat some of those
abuses](https://lwn.net/Articles/851849/) along the way; a newly [announced
"!CVE" project](https://lwn.net/ml/oss-
security/c01c1617-641d-4ec2-847f-2e85ea4676f7@notcve.org/) is meant to track
vulnerabilities ""that are not acknowledged by vendors but still are serious
security issues"".

The "!CVE Team" posted the announcement to the oss-security mailing list on
November 8; the project had just been [presented at Black Hat
Toronto](https://www.blackhat.com/sector/2023/arsenal/schedule/index.html#cve-
a-new-platform-for-unacknowledged-cybersecurity-vulnerabilities-36144) by
Hector Marco and Samuel Arevalo from [Cyber Intelligence,
S.L.](https://www.cyberintel.es/), which is a Spanish security research firm.
Given that Cyber Intelligence is the sole
[partner](https://notcve.org/partners.html) listed on the [!CVE web
site](https://notcve.org/), it is hard not to come to the conclusion that
Marco and Arevalo are part of (or all of) the !CVE Team, though its membership
is ostensibly anonymous.

The reasons behind the new project are pretty straightforward: tracking
vulnerabilities that the relevant CVE Numbering Authority (CNA) has rejected
for CVE assignment. CNAs are delegated to assign CVEs for a particular product
or project, which, in many cases, is the same as the vendor or project itself.
The announcement quotes the [CNA
rules](https://cve.mitre.org/cve/cna/CNA_Rules_v3.0.pdf): ""CNAs are left to
their own discretion to determine whether something is a vulnerability"".
Since the CNA is often the same as the one whose code is implicated, the
announcement noted that there is a problem:

> This poses a clear conflict of interest, since the same vendor is the one
> deciding whether or not an issue is a vulnerability and therefore whether a
> CVE is assigned to their own product or not.

The solution, according the project, is to have a panel of experts evaluate
reports of these kinds of vulnerabilities; if they
[qualify](https://notcve.org/faq.html), a !CVE-yyyy-nnnn identifier will be
assigned and an entry will be created in the NotCVE database. As might be
guessed, the exclamation point in the identifier was not popular, with
Alexander "Solar Designer" Peslyak [pointing out](https://lwn.net/ml/oss-
security/20231108140740.GA6515@openwall.com/) flaws in the numbering scheme in
the first response to the announcement:

> Please make these more distinctive, so that searching (e.g. the web or
> mailing list archives) for CVE-2023-0001 wouldn't find both the actual CVE
> and the !CVE, which are likely totally unrelated to each other. In fact,
> searching specifically for the !CVE could be difficult as the exclamation
> mark may be dropped by the tokenizer when indexing content.

He also noted that he had [created a CVE
alternative](https://lwn.net/Articles/679315/), called
[OVE](https://www.openwall.com/ove/), back in 2016, though it never really
went anywhere; ""Maybe yours will."" David A. Wheeler
[suggested](https://lwn.net/ml/oss-
security/B2EE9540-85EA-4866-85A4-D4A23979995A@dwheeler.com/) using "NotCVE"
rather than "!CVE", which is what the team eventually [decided to
adopt](https://lwn.net/ml/oss-
security/225a8553-b59c-47ca-8483-a66b4c3b9ebb@notcve.org/). Looking up the
first alert will work using either identifier, since there may be existing
references to [!CVE-2023-0001](https://notcve.org/view.php?id=!CVE-2023-0001).

At this point, NotCVE-2023-0001 has only been joined by
[NotCVE-2023-0002](https://notcve.org/view.php?id=NotCVE-2023-0002), which is,
somewhat ironically, a buffer overflow in [NVD
Tools](https://github.com/facebookincubator/nvdtools). That project provides a
set of tools to work with the [National Vulnerability
Database](https://nvd.nist.gov/), which includes CVEs among the vulnerability
information that it tracks.

In the thread, Mike O'Connor [asked](https://lwn.net/ml/oss-
security/ZU0aglk9Rt60nIQ-@dojo.mi.org/) about non-vendor CNAs, noting that the
GitHub CNA is responsible for lots of open-source projects it hosts, but is
hardly the "vendor" for them. He suggested that there are cases where CNAs are
legitimately rejecting CVE assignment:

> Perhaps they don't want to build deprecated decades-old code to scope out
> the severity of a buffer overflow some random fuzzbot found. How would !CVE
> work for the Linux kernel, where most security fixes have git commit hashes
> but not CVEs?

The !CVE Team [said](https://lwn.net/ml/oss-
security/467f3587-9a66-41c5-9ba1-6cb2a9871d08@notcve.org/) that the project
would only be tracking vulnerabilities that are not being assigned CVEs—for
any reason. It is not only for vulnerabilities that have been rejected for CVE
assignment, there is more to it than that:

> !CVE project is tracking, identifying and sharing security issues that
> otherwise would be randomly published in blog posts, Twitter, etc, (in the
> best case) or just lost. To obtain a NotCVE is not relevant whether someone
> is getting difficulties to obtain a CVE for their vulnerability or not. To
> get a NotCVE the issue must qualify.

O'Connor had also suggested working with the CVE project, ""addressing what
CNA rules you think may be broken"", but the !CVE Team said that MITRE (which
runs the CVE project) is not unaware:

> This is not something new or unknown by MITRE or vendors. In some cases
> MITRE is in favor of assigning a CVE but the vendor is against. In those
> cases MITRE can do nothing and by experience we can tell you that at the end
> CVE will not be assigned. Note that "the security issue" cannot be even
> named "vulnerability" because it is not (vendor is the only one with this
> authority) according to MITRE rules. If something is not a "vulnerability"
> there is nothing to patch, nothing to track, etc. Since those issues go
> unnoticed, they should be looked at even more cautiously since they are
> probably not going to be fixed.

At first blush, tracking untracked vulnerabilities seems like a perfectly
reasonable idea—and it is—but there are some risks to it as well. The biggest
problems with the current system stem from misaligned incentives; researchers
push for CVE assignment for personal-recognition purposes, while companies and
others sometimes want to forgo CVEs in order to _not_ be recognized as having
a security flaw. Meanwhile, governments and others base legislation and
agreements around fixing CVEs in short order, which gives vendors and projects
another reason to avoid them.

Beyond that, there are [bogus CVEs](https://lwn.net/Articles/944209/) that
projects have to grapple with if they do not create their own CNA. The
usefulness of NotCVEs is going to come down to how well the "panel of experts"
does in keeping bogus reports from getting added. If the NotCVE system were to
become popular, it would provide another target for researchers who are only
concerned with personal recognition, so the project might well be inundated
with bogus reports of various kinds.

The CVE system is, in short, a mess—and one that periodically spawns [attempts
to fix or replace the CVE
system](https://lwn.net/Security/Index/#Bug_reporting-CVE). So far, at least,
none of those efforts has gone very far and !CVE looks likely to join that
club. But the problems it is trying to address, remain. So we will probably
see more sporadic, generally quixotic, tilts at the CVE windmill over the
coming years—decades and more, even.

via: https://lwn.net/Articles/953738/
