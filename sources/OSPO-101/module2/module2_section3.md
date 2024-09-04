---
status: collected
title: "OSPO 101 Training Modules - Module 2"
author: TODO Group
collector: mudongliang
collected_date: 20240822
link: https://github.com/todogroup/ospo-career-path/blob/main/OSPO-101/module2/README.md
---

# Section: Developing Open Source Policies

## Lesson: Introduction

### Section Overview

In this section, we will discuss how to develop open source policies that set the framework for executing your chosen open source strategy. Special emphasis will be given to key factors that affect the success and organizational adoption of these policies.

### Learning Objectives

By the end of this section, you should be able to:

- Describe the process for implementing open source policies that drive the execution of your chosen strategy

- Understand what key considerations you need to consider when defining your policies

- Explain how you can best design policies that encourage widespread adoption in your organization

- Articulate the role of industry best practices to open source policy development

## Lesson: Overview of Open Source Policy Areas

### What Should My Open Source Policy Focus On?

Organizations starting on their journey of open source sometimes get bogged down in the minutia of defining policies from the perspective of ‘FUD’ (Fear, Uncertainty, and Doubt). While there will be more detailed coverage of areas like open source compliance in future modules, we’d like to give a general overview of the areas that should be considered by all organizations in crafting their open source policies from the perspective of more effective utilization, not just avoidance of risk.

We’ll also try to address how you can consider both which policies you should focus on first, as well as how to socialize these policies across your organization for maximum effect.

To do this, we’ll first present the elements that should be in any organizations open source policies - note that this isn’t necessarily an exhaustive list, and there could be additional items depending on your specific business situation:

- **Discovery**

- **Review & Approval**

- **Commercial Procurement**

- **Code Management & Maintenance**

- **Community Interaction**

- **Compliance**

- **Executive Engagement**

### Discovery

Open Source Discovery and Evaluation covers how and where your team finds open source software of interest and by what criteria that software is vetted for inclusion in your organization’s software portfolio. Discovery should not be a hit or miss endeavor. Starting with the right direction and criteria (vs. ad hoc) streamlines this sometimes difficult process and avoids problems down the road.

Discovering useful open source seldom starts from a blank slate. Most organizations already use at least some open source software and this code can form the basis of an internal (approved) repository. When looking outside the existing portfolio, there is a temptation for engineers to get creative, but to reduce risk and increase efficiency, best practices dictate establishing a set of trusted sources, either through commercial supplier distributions (organizations like Red Hat, Google or others), or through software foundations like Cloud Native Computing Foundation.

Moreover, a range of community, government and commercial tools exist for finding and choosing appropriate open source project code and versions. For example, OpenHub provides excellent metadata on thousands of popular projects, and Github itself offers dashboard info on project releases. Key security info can be gleaned from the NIST vulnerability database and the open source vulnerability database project.

It’s important to engage all levels of the organization in developing these discovery policies - simply telling engineers that they cannot use open source except from specific internal repositories without further explanation, and without involving them in the decision process, will likely lead to ‘creative’ attempts to circumvent this policy, which makes compliance harder later on.

### Review & Approval

No matter how careful or diligent your discovery process, the real test faced by open source code must come from your review and approval processes. Review and approval are your first lines of defense against security, legal and operational risk that can accompany open source.

As with discovery, leveraging previously-vetted code can speed up this process, so if your open source team has not already done so, best practices dictate creating lists of approved components and versions, reviewed and approved license types, and previously-employed evaluation rationale and results.

Building clear criteria (and involving all stakeholders from engineers to program managers) avoids issues during discovery and speeds review. Additionally, it’s important to consider building shortcuts in this policy for low risk approvals that can speed up this process, reduce cost, and provide more incentive for engineering teams to adhere to these policies.

### Commercial Procurement

When you first think of discovering and integrating open source code, it’s natural to think primarily of code acquired freely over the Internet. But a substantial amount of open source code makes its way into organizations through commercial sourcing. Open source often accompanies and/or is an integral part of commercial applications and also frequently finds its way into deliverables from contracted development.

The risks and compliance obligations that accompany commercially-sourced open source are no different from those that come with directly acquired open source. The big difference is that rather than reaching out and downloading open source code directly, your organization receives that code implicitly, even silently, usually through long-standing conventional procurement processes.

For commercially-sourced open source, industry best practices dictate working with your organization’s supply chain and sourcing personnel to establish and enforce policies for:

- Reporting the presence of open source elements in 3rd party code

- IP verification, and where appropriate, indemnification

- Code scanning and review of supplier governance programs to supplement reporting (if any)

- Documentation and integration with downstream component tracking, release audit and other compliance activities

### Code Management & Maintenance

The concept of "code ownership" emanates from the practices of scores of companies working with open source over the last decade and a half. At the highest level, the practice gives open source code “a face” within your organization, a “go to” person who is close to the code and to the community that develops and maintains it. Also typically included under the code ownership role is coordinating support for that code, directly or through third parties.

The need for "ownership" arises from the “self-service” nature of open source. Management policy should dictate what type of stewardship these components require and the code owner’s roles and responsibilities.

Other tasks associated with code management and maintenance are

- Archiving externally sourced open source

- Creating a current master copy (including updates, patches, etc.) for internal use, as the basis for sharing and reuse

- Tracking ownership, approvals and other decisions with an audit trail

The accompanying support model must be flexible, scalable and sustainable, with low risk and overhead. Options include:

- Internal support (if resources are available, expertise is strong and risk is low)

- Commercial support aggregator

- Focused vendor support for business-critical components and/or platforms for technically complex components or those with high business/technical risk

### Community Interaction

Open source software is typically created and maintained by communities of like-minded developers. Participation in those communities confers a range of benefits on organizations that integrate and deploy their open source software, ranging from education to support to bug fixes and beyond.

Community interaction is not a binary decision. Participation is, instead, a continuum. You and your colleagues can choose to participate in a variety of roles across a range of activities, from a modest start as consumers of OSS up through ongoing involvement and even leadership. While the level of participation can evolve organically, it is always best if the level of community interaction is aligned with organization business goals and based upon a cost-benefit analysis.

Here are some levels of interaction to consider:

1. No Participation (not recommended)
2. Participate as individuals
   - No tie to company allowed
3. Participate in a community on your company’s behalf

   1. No IP conveyance

   2. Contribute requirements or bug fixes

   3. Convey company-developed binaries, libraries, etc.

4. Provide sponsorship or support to a community

5. Release company IP as OSS and establish a company-managed open source project

### Compliance

Compliance focuses on observance of open source policy and open source license terms. License compliance is the most visible part of Open Source Management for organizations that distribute software, and often provides the impetus for the establishment of open source program offices (more on this in the next lesson module).

However, compliance is not the "be all" or ”end all” of good governance – no one uses open source software primarily for the privilege of complying with its licenses. Compliance should be treated on a par with the other dimensions of open source management, and not as a “police action”.

For organizations that do not distribute software, compliance is focused on ensuring that the open source policy and processes are followed in order to assure the security, reliability and supportability of the software systems and applications.

Compliance policy needs to be explicit and detailed, with rules spelled out for complying both with organizational policy and with the terms of open source licenses. The need for compliance highlights the requirement to be able to identify and catalogue third-party code (including open source) in each release, together with accompanying terms (e.g., source code disclosure, attribution, etc.).

### Executive Engagement

Open Source Management is not solely the province of developers who actually touch the code. Nor is it uniquely under the purview of corporate lawyers concerned with protecting intellectual property (IP). Successful open source management is a collaborative effort, requiring participation from many roles and disciplines.

One often ignored set of participants is the organization’s executives. Executives may initially think of open source technology as merely a detail of technical implementation, and be content to participate in open source management through the chain of command. Enlightened executives will perceive the risk/benefit balance in open source and its potential for innovation and differentiation, resulting in greater executive participation in key decisions around open source management policy.

It’s important for executives to consider their role in the following policy areas:

- Involvement with overall open source policy creation and evolution

- Participation in open source review and approval

  - Typically through legal and lines of business

- Participation in high-level decisions about open source contributions, project sponsorship, etc.

- Receiving and reviewing regular reports on open source activity

## Lesson: Policy Implementation Considerations

### Human Factors in Policy Creation

Policy creation in relation to open source has some interesting human dynamics at play that are different from traditional HR or other policies that your organization might be used to creating. The collaborative and ‘community-led’ nature of open source focuses more on getting work done than it does on a set of rigid or formal processes.

Collaboration is the key element here. Rather than considering these policies strictly as punitive or ways to eliminate risk, they also need to be considered opportunities for different groups, including engineers, program managers, legal experts, and even executives to have transparent and frank discussions about how to get the most out of the organization’s engagement in open source.

It’s true that in some cases, management may have to make decisions about policies that aren’t always in agreement with other groups (usually engineering), but in giving everyone a voice in how policies are created, it will make it easier for everyone to comply and see how the policies make sense for the organization.

### Economic and Productivity Considerations

Another element to consider when crafting your open source policies is how their implementation will affect working productivity, and therefore, indirectly, the economic impact to your organization.

Building completely ‘bulletproof’ policies that cover every possible case, and require a massive human and technological infrastructure can seem like the ‘safest’ approach, but those can have unintended consequences, including making software development slow, unwieldy and so unpleasant that you run the risk of losing critical software talent to organizations without such rigid policies.

Additionally, building out the necessary process infrastructure for such heavyweight policies has economic cost both in tools and in detailed human oversight. The best approach to combat the temptation to build the ‘perfect policies’ is to consider the oft-repeated open source mantra of ‘release early, release often.’ Consider what minimum set of policies you need to implement your open source strategy, and then build on those as both your management team and development organization progress up the ladder of open source engagement.
