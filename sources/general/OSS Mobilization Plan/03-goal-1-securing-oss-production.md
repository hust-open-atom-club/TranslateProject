---
status: collected
title: "[OSS Mobilization Plan] 03 - Goal 1: Securing OSS Production"
author: OpenSSF
collector: benx-guo
collected_date: 20251118
link: https://8112310.fs1.hubspotusercontent-na1.net/hubfs/8112310/OpenSSF/OSS%20Mobilization%20Plan.pdf?utm_referrer=https%3A%2F%2Fopenssf.org%2F
---

# **Goal 1: Securing OSS Production**

Writing secure software is not easy. Several different, overlapping challenges contribute to
the problem:

- formal and informal computer science education curricula typically do not cover security
techniques
- security researchers constantly discover new forms of vulnerabilities in the ecosystem,
even in programming languages and systems that have existed for decades
- existing security tools can help identify security issues, but require training and expertise
to really benefit the overall quality and security of the code.

Security is often characterized as a process[^4], not an end-state. Therefore investments here need
to be focused on improving awareness and education, improving the processes used by maintainers of critical code, and improving the tools used by all developers for software development.

## **Stream 1: Deliver baseline secure software development education and certification to all.**

It is rare to find a software developer, whether college-educated, educated in other fora such
as "boot camps" and coding academies, or self-taught, who receives formal training in writing
software securely. A modest amount of training — 10 hours at the very least, 40-50 hours ideally
— could make a huge difference in developer performance. There exist such training modules
available for free, such as the [OpenSSF Secure Software Fundamentals](https://openssf.org/training/courses/). We propose bringing
together a small team to iterate and improve such training materials so they can be considered
industry standard, and then driving demand for those courses and certifications through partnerships with educational institutions of all kinds, coding academies and accelerators, and major
employers to both train their own employees and require certification for job applicants.

Cost: $4.5M for the first year, $3.45M per year beyond.

## **Stream 2: Establish a public, vendor-neutral, objective-metrics-based risk assessment dashboard for the top 10,000 (or more) OSS components.**

This stream collects the array of different open source methods (such as the [OpenSSF Best Practices Badge](https://bestpractices.coreinfrastructure.org/en) and the [Security Scorecard](https://openssf.org/blog/2020/11/06/security-scorecards-for-open-source-projects/)) for assessing how well a given OSS component, and
the maintainer team developing it, measures up when it comes to practices and methods that
would reduce the risk to end-users. Such a platform would also track vulnerabilities in dependencies via software composition analysis (SCA), to understand how a bug in an upstream component affects others. This provides "situational awareness" for organizations that deploy OSS
and provides clear guidance to projects wishing to attract more users by reducing their risk.

Cost: $3.5M for the first year, $3.9M per year beyond.

## **Stream 3: Accelerate the adoption of digital signatures on software releases.**

Digital signatures are a critical part of ensuring that all participants in the ecosystem, from
software builders to end users, can verify that the components that they use are indeed the
components that they intend to use. While signatures are already relatively commonly used
at distribution end-points, in the upstream development process they are far less common.
This stream will drive improvement of the existing signing tools and infrastructure and
encourage adoption by open source projects. Through training for maintainers and direct
source code contributions, the goal is to achieve signed source releases. The goal is to see
50 of the top 200 projects and 1000 of the top 10,000 projects using an interoperable software signing approach.

Cost: $13M for the first year, $4M per year beyond, with a one-time $10M push after the first
year.

## **Stream 4: Eliminate root causes of many vulnerabilities through replacement of non-memory-safe languages**

Some programming languages, like C and C++, make memory safety challenging and can
lead to difficult to detect and eliminate software defects. In contrast, most programming
languages, like Go and Rust, handle memory management and other kinds of security-sensitive tasks safely by default, making it easier for developers to avoid entire categories of vulnerabilities. Much of the modern Internet software infrastructure is built on software written
in C, and that leads to a large number of vulnerabilities each year. About 70% of Microsoft’s
vulnerabilities in 2006-2018 were due to memory safety issues[^5], and in 2020 Google
reported that 70% of Chrome’s vulnerabilities were due to memory management and safety
issues[^6]. Identifying small, self-contained, critical components that are good candidates for
being rewritten in a memory-safe language, and facilitating these rewrites, could help eliminate an entire category of such weaknesses. This stream would resource that development
work, as well as the associated promotion, adoption, and community development activities
to make the new code bases the industry standard.

Cost: $5.5M for the first year, $2M per year beyond.

---

[^4]: [https://www.schneier.com/essays/archives/2000/04/the_process_of_secur.html](https://www.schneier.com/essays/archives/2000/04/the_process_of_secur.html)

[^5]: "Microsoft: 70 percent of all security bugs are memory safety issues" by Catalin Cimpanu, 2019-02-11, [https://www.zdnet.com/article/microsoft-70-percent-of-all-security-bugs-are-memory-safety-issues](https://www.zdnet.com/article/microsoft-70-percent-of-all-security-bugs-are-memory-safety-issues/)

[^6]: "Chrome: 70% of all security bugs are memory safety issues" by Catalin Cimpanu, 2020-05-22, [https://www.zdnet.com/article/chrome-70-of-all-security-bugs-are-memory-safety-issues](https://www.zdnet.com/article/chrome-70-of-all-security-bugs-are-memory-safety-issues/)
