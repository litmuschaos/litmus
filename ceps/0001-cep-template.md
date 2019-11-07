---
cep-number: 0
title: My CEP
authors:
-   "@ksatchit"
owners:

-   TBD

-   "@ksatchit"
editor: TBD
creation-date: yyyy-mm-dd
last-updated: yyyy-mm-dd
status: provisional/implementable/implemented/deferred/rejected/withdrawn/replaced
see-also:

-   CEP-1

-   CEP-2

replaces:

-   CEP-3

superseded-by:

-   CEP-100
---

# Title

This is the title of the Chaos Enhancement Proposal (CEP).
Keep it simple and descriptive.
A good title can help communicate what the CEP is and should be considered as part of any review.

The title should be lowercased and spaces/punctuation should be replaced with `-`.

To get started with this template:
1. **Make a copy of this template.**
  Name it `YYYYMMDD-my-title.md`.
1. **Fill out the "overview" sections.**
  This includes the Summary and Motivation sections.
1. **Create a PR.**
  Name it `[CEP NUMBER] Title`, e.g. `[CEP 20191014] Initial work on Chaos Operator`.
  Assign it to owner(s) that are working on these features.
1. **Merge early.**
  Avoid getting hung up on specific details and instead aim to get the goal of the CEP merged quickly.
  The best way to do this is to just start with the "Overview" sections and fill out details incrementally in follow on PRs.
  View anything marked as a `provisional` as a working document and subject to change.
  Aim for single topic PRs to keep discussions focused.
  If you disagree with what is already in a document, open a new PR with suggested changes.

The canonical place for the latest set of instructions (and the likely source of this file) is [here](/ceps/0001-cep-template.md).

The `Metadata` section above is intended to support the creation of tooling around the CEP process.

## Table of Contents

A table of contents is helpful for quickly jumping to sections of a CEP and for highlighting any additional information provided beyond the standard CEP template.
[Tools for generating](https://github.com/ekalinin/github-markdown-toc) a table of contents from markdown are available.

-   [Table of Contents](#table-of-contents)

-   [Summary](#summary)

-   [Motivation](#motivation)

    -   [Goals](#goals)
    -   [Non-Goals](#non-goals)

-   [Proposal](#proposal)

    -   [User Stories](#user-stories-optional)
    -   [Story 1](#story-1)
    -   [Story 2](#story-2)
    -   [Implementation Details/Notes/Constraints](#implementation-detailsnotesconstraints)
    -   [Risks and Mitigations](#risks-and-mitigations)

-   [Graduation Criteria](#graduation-criteria)

-   [Implementation History](#implementation-history)

-   [Drawbacks](#drawbacks)

-   [Alternatives](#alternatives)

-   [Infrastructure Needed [optional]](#infrastructure-needed)

## Summary

The `Summary` section is incredibly important for producing high quality user focused documentation such as release notes 
or a development road map.It should be possible to collect this information before implementation begins in order to avoid 
requiring implementors to split their attention between writing release notes and implementing the feature itself.
CEP editors should help to ensure that the tone and content of the `Summary` section is useful for a wide audience.

A good summary is probably at least a paragraph in length.

## Motivation

This section is for explicitly listing the motivation, goals and non-goals of this CEP.
Describe why the change is important and the benefits to users.
The motivation section can optionally provide links to [experience reports](https://github.com/golang/go/wiki/ExperienceReports) to demonstrate the interest in a CEP 
within the wider Litmus community.

### Goals

List the specific goals of the CEP.
How will we know that this has succeeded?

### Non-Goals

What is out of scope for his CEP?
Listing non-goals helps to focus discussion and make progress.

## Proposal

This is where we get down to the nitty gritty of what the proposal actually is.

### User Stories (optional)

Detail the things that people will be able to do if this CEP is implemented.
Include as much detail as possible so that people can understand the "how" of the system.
The goal here is to make this feel real for users without getting bogged down.

#### Story 1

#### Story 2

### Implementation Details/Notes/Constraints (optional) 

What are the caveats to the implementation?
What are some important details that didn't come across above.
Go in to as much detail as necessary here.
This might be a good place to talk about core concepts and how they releate.

### Risks and Mitigations

What are the risks of this proposal and how do we mitigate.
Think broadly.
For example, consider both security and how this will impact the larger kubernetes ecosystem.

## Graduation Criteria

How will we know that this has succeeded?
Gathering user feedback is crucial for building high quality experiences and owners have the important responsibility 
of setting milestones for stability and completeness.

## Implementation History

Major milestones in the life cycle of a CEP should be tracked in `Implementation History.
Major milestones might include the following.

-   the `Summary` and `Motivation` sections being merged signaling owner acceptance
-   the `Proposal` section being merged signaling agreement on a proposed design
-   the date implementation started
-   the first Litmus release where an initial version of the CEP was available
-   the version of Litmus where the CEP graduated to general availability
-   when the CEP was retired or superseded

## Drawbacks (optional)

Why should this CEP _not_ be implemented.

## Alternatives (optional)

Similar to the `Drawbacks` section the `Alternatives` section is used to highlight and record other possible approaches 
to delivering the value proposed by a CEP.

## Infrastructure Needed (optional)

Use this section if you need things from the project/owner.
Examples include a new subproject, repos requested, github details.
Listing these here allows a owner to get the process for these resources started right away.
