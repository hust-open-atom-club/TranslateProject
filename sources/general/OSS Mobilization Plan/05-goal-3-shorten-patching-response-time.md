---
status: collected
title: "[OSS Mobilization Plan] 05 - Goal 3: Shorten Ecosystem Patching Response Time"
author: OpenSSF
collector: benx-guo
collected_date: 20251118
link: https://8112310.fs1.hubspotusercontent-na1.net/hubfs/8112310/OpenSSF/OSS%20Mobilization%20Plan.pdf?utm_referrer=https%3A%2F%2Fopenssf.org%2F
---

# Goal 3: Shorten Ecosystem Patching Response Time

Finding and remediating vulnerabilities in open source projects is a critical first step in
addressing an issue. But the key goal for any such effort has to be to get the fixed versions
of these software components universally deployed everywhere this component is used.
This requires that every participant in the ecosystem, software vendors, intermediaries,
service providers, and finally the end user engineering and infrastructure teams, understand where OSS components are part of their infrastructure or of their deployed products.
We appreciate the role that Software Bills of Materials (SBOMs) play in this context and the
attention that is being paid to SBOMs at the public policy level. There are, however, other,
complementary efforts needed to ensure that all participants in the ecosystem update to
the latest secure version of all components they use and release such updated versions of
their components to the ecosystem participants downstream from them in a timely manner.

## **Stream 9: SBOM everywhere — Improve SBOM tooling and training to drive adoption.**

When a major new vulnerability is discovered, enterprises are often left scrambling to
determine if, how, and where they may be vulnerable. Far too often, they have no inventory
of the software assets they deploy, and often have no data about the components within
the software they have acquired. In addition, organizations consider acquiring software but
often do not have a way to measure the risk that software components within them contain
known vulnerabilities. Many have identified "Software Bill of Materials" (SBOM) as a fundamental building block for solving this problem. But to suitably address the challenge, their
adoption must be widespread, standardized, and as accurate as possible

By focusing on tools and advocacy, we can remove the barriers to generation, consumption,
and overall adoption of SBOMs everywhere, we can improve the security posture of the entire
open source ecosystem: producers, consumers, and maintainers. This stream addresses that
by resourcing a team of developers to improve that tooling and bake it into the most popular
software build tooling and infrastructure across all major programming languages. It will also
resource educational materials, training videos, default templates, examples, and other community advocacy work to normalize SBOM creation and consumption. Most importantly, it will provision a team to work directly with critical projects to submit improvements directly to add SBOM
support, removing last-mile barriers or resistance due to inertia. This stream addresses all three
points and works directly with the SPDX team to implement them as a new SPDX security profile.

Cost: $3.2M for the first year, and a TBD amount per year beyond.

## **Stream 10: Enhance the 10 most critical OSS build systems, package managers, and distribution systems with better supply chain security tools and best practices.**

Open source software is built using a range of language-specific build systems before being
distributed to end users via package managers. This means wildly different levels of quality and
risk permeate through the software supply chain as components from different ecosystems
come together in a production environment, making efforts to place unified policies around
risk management and mitigation very challenging.

The intent of this stream is to examine the most impactful security enhancements we can make
to the distribution of those software artifacts; driving improvements at the package manager
level to complement other streams focused on component level security and ecosystem risk.

The expected outcome will be a higher level of visibility and security of package management
systems, finding improvement at a critical point of leverage in the open source ecosystems, to
allow consumers of open source to attain a greater degree of trust into the composition and
provenance of their open source software.

Longer term, packaging and distribution improvements around composition and provenance
data should support shortened patch time through faster detection and remediation, improved
transparency of vulnerabilities and patches to downstream users, and better security tooling
for all developers.

Cost: $8.1M for the first year, $8.1M per year beyond.
