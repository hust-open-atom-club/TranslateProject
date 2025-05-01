---
status: collected
title: "Responsible and Effective Bugfinding"
author: John Regehr
collector: QGrain
collected_date: 20250501
link: https://blog.regehr.org/archives/2037
---

# Responsible and Effective Bugfinding

**NB: This piece is not about responsible disclosure of security issues.**

For almost as long as people have written code, we have also worked to create methods for finding software defects. Much more recently, it has become common to treat “external bug finding” — looking for defects in other people’s software — as an activity worth pursuing on its own. Several factors have contributed:

- The amount of software in use has grown massively, and presumably the number of latent bugs has grown with it.
- Since software is increasingly used to monitor and control aspects of our lives, and because systems are often networked, bugs can have more impact than they previously did.
- Cheap computer power for brute-force bug finding is ubiquitously available.

The [OSS-Fuzz](https://github.com/google/oss-fuzz) project is a good example of a successful external bug finding effort; its web page mentions that it “has found over 20,000 bugs in 300 open source projects.”

This article is about how to conduct an external bug finding effort in a way that is likely to maximize the overall benefit of the project. The high level summary is that this kind of work has to be done carefully, thoughtfully, and in collaboration with the software developers. In contrast, simply throwing a huge pile of bugs over the wall to some project and walking away, is unlikely to do much good. I’ve not seen a lot written up about this, but  “[A Few Billion Lines of Code Later: Using Static Analysis to Find Bugs in the Real World](https://web.stanford.edu/~engler/BLOC-coverity.pdf)” is very good and touches on some of the same issues.

The problem is that there are usually mismatches in costs and incentives between bug finders and project developers. External bug finders would like to find and report as many bugs as possible, and if they have the right technology (like a shiny new fuzzer) it can end up being cheap to find hundreds or thousands of bugs in a large, soft target. Bug finders are motivated altruistically (they want to make the targeted software more reliable by getting lots of bugs fixed) but also selfishly (a bug finding tool or technique is demonstrably powerful if it can find a lot of previously unknown defects). On the other side, developers of the targeted project typically appreciate bugfinding efforts (of course, they too want a reliable system) but for them a huge bug count is undesirable. First, every bug report requires significant attention and effort, usually far more effort than was required to simply find the bug. Second, a large bug count potentially reflects negatively on the project and consequently on its developers.

In the rest of this post I’ll present some questions that people doing external bug finding work should ask themselves about each bug that they find. The answers, and the process of answering, will help them do their work more responsibly and effectively.

## Is the system being tested an appropriate target for external bug finding?

This is obvious, but it still needs mentioning: not every code base wants or needs bug reports. There are plenty of throw-aways, research projects, and other code bases out there that have a very small number of users and at most a couple of developers. It is often inappropriate to use this sort of code as a target for external bugfinding work. In contrast, the more users a system has, and the more important its use cases are, the more appropriate a target it becomes. A reasonable bar for external bug finding might be: Does the package manager for your operating system include, by default, a recipe for installing the software you want to test? If not, then perhaps it has not risen to the level where it is a suitable target for external bugfinding.

## Is the bug a security vulnerability?

This is a completely separate can of worms; if you have found a potential vulnerability, [please seek advice elsewhere](https://en.wikipedia.org/wiki/Responsible_disclosure).

## Is the bug already known?

A drawback of fuzzers is that they tend to keep rediscovering known bugs. Automated bug triaging techniques exist, but they are far from perfect, especially for bugs that don’t trigger crashes. Furthermore, there’s good reason to believe that perfect automated bug triaging is impossible, since the notion of “distinct bugs” is inherently a human construct. When there is a reasonable possibility that a bug you have discovered is already known and reported, it is best to just sit on your new bug report for a little while. Once the potential duplicates that are already in the bug tracker get fixed, it will be easy to see if your test case still triggers a failure. If so, you can report it. Otherwise, discard it.

Occasionally, your bug finding technique will come up with a trigger for a known bug that is considerably smaller or simpler than what is currently in the issue tracker. For example, if a web browser contains a race condition that people believe can only be triggered using five threads, and your test case makes it happen using just two threads, then this is an interesting new finding. In this case you should consider appending your test case to the existing issue.

## Can you write a convincing bug report?

Writing good bug reports is a learned skill that requires significant care and patience. [Here](https://www.softwaretestinghelp.com/how-to-write-good-bug-report/) are a [couple](https://developer.mozilla.org/en-US/docs/Mozilla/QA/Bug_writing_guidelines) of good resources.

I only have a few points to add:

- A bug report is not simply a collection of facts, it also forms an argument for why a developer — who surely already had plans for the day — should instead work on fixing the defect.
- It is important to put yourself in the developers’ position. If you were reading this report, would you have enough information to act on it? Would you want to?
- Avoid, at all costs, being rude or presumptuous.
- Test cases found by fuzzers can be inherently less compelling to developers than test cases that come from real use cases. First, these test cases often just look funny. Second, developers often believe (no doubt correctly, sometimes) that fuzzer-discovered corner cases will not be triggered by human users. If you are submitting a bug report containing fuzzer-generated input, careful test case reduction must be performed, with an eye not only towards minimality but also towards readability and understandability.

A major advantage of external bug finding is that since the people performing the testing are presumably submitting a lot of bug reports, they can do a really good job at it. In contrast, regular end users may not submit bug reports very often, and consequently we would not expect them to be as skilled. Treat the ability to write high-quality bug reports as a superpower that enables you and the system’s developers to collaboratively increase the quality of the code in an efficient and pleasant fashion.

## Is the bug important?

Developers are almost always willing to fix important bugs that might have serious consequences for their users. On the other hand, they are often happy to delay fixing bugs that they believe are unimportant, so they work on more pressing things. As an external bug finder, it can be hard to tell which kind of bug you have discovered (and the numbers are not on your side: the large majority of bugs are not that important). One way to approach this problem is to look at bugs (both fixed and unfixed) that are already in the bug tracker: what common characteristics can you identify that caused developers to address defects rapidly? What common characteristics can you identify that caused developers to ignore bugs or mark them WONTFIX? You can also open a dialogue with developers: they may be willing to tell you the kinds of bugs they’re interested in, and not interested in. The developers of the CVC4 SMT solver recently added [a public document to this effect](https://github.com/CVC4/CVC4/wiki/Fuzzing-CVC4). I hope that many other projects will follow their lead.

Common sense is also useful: if the bug requires an obscure or unlikely combination of command-line options to be triggered, then perhaps it doesn’t matter that much. For example, when fuzzing compilers using Csmith we rarely invoked GCC and LLVM with flags other than -O0, -O1, -O2, -Os, and -O3.

## Have you tried to fix the bug?

In some cases, fixing a bug in software you’re unfamiliar with is impractical because it’s something like a deep race condition in an OS kernel or a subtle emission of incorrect object code by a compiler. Years of specific experience with the system might be required to locate the right place to fix the bug. On the other hand, a lot of bugs end up being easy to fix, including typos, copy-and-paste errors, or incorrect order of arguments to a library call. If you are able to take a few minutes to check if a bug you are reporting is easy to fix, and to suggest a patch if it is, then you can potentially save project developers considerable time and effort. They will appreciate this.

## How many open issues do you have in the bug tracker?

If you have already reported a few bugs and they have not been fixed (or, worse, have not even been acknowledged), then something is not working. Perhaps the developers are otherwise occupied, or perhaps they don’t find these bugs to be actionable or important. Regardless, at this point it is not helpful to continue reporting bugs. If you haven’t done so already, you might open a dialogue with developers to see what the situation is, or you might simply move on and find bugs in a different code base.

## Do the developers trust you?

If the developers of the system you’re reporting bugs in have never seen or heard of you, they are very likely to at least take a look at the first issue you submit. If they trust you, because you’ve submitted a number of high-quality bug reports before, they’ll look at it closely and are likely to take it seriously. However, if they actively don’t trust you, for example because you’ve flooded their bug tracker with corner-case issues, then they’re not likely to ever listen to you again, and you probably need to move on to do bug finding somewhere else. Do not let this happen, it makes developers salty and that makes bug finding work more difficult for all of us.

## Are your tools open source?

Internal bug finding — where project developers find bugs themselves — can be superior to external bug finding because developers are more in tune with their own project’s needs and also they can schedule bug finding efforts in such a way that they are most effective, for example after landing a major new feature. Thus, an alternative to external bug finding campaigns is to create good bug finding tools and make them available to developers, preferably as open source software. Drawbacks of this scheme include increasing the software engineering burden on bug-finding researchers (who must now create tools that other people can use, rather than creating tools solely for their own use) and decreasing social and academic credit given to researchers since some of the benefit of their work is now hidden, rather than being quantifiable and out in the open.

## Conclusions

Although software correctness is at some level a technical problem (either the code implements its specification or it doesn’t), improving the quality of software is an intensely human activity. Developers and external bug finders are on the same team here, but there’s plenty of potential for friction because their costs and incentives differ. This friction can be reduced if bug finders ask themselves a series of questions listed in this post before submitting bug reports.


*August 17, 2020 John Regehr, Professor of Computer Science, University of Utah, USA*