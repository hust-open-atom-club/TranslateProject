---
status: collected
title: 3. Preprocessing
author: Ghidra Developers Team
collector: Hornos3
collected_date: 20240826
link: https://github.com/NationalSecurityAgency/ghidra/tree/master/GhidraDocs/languages/html/sleigh_preprocessing.html
---

::: {.navheader}
3. Preprocessing
:::

[Prev](sleigh_layout.html) 

 

 [Next](sleigh_definitions.html)

------------------------------------------------------------------------

::: {.sect1}
::: {.titlepage}
<div>

<div>

[]{#sleigh_preprocessing}3. Preprocessing {#preprocessing .title style="clear: both"}
-----------------------------------------

</div>

</div>
:::

SLEIGH provides support for simple file inclusion, macros, and other
basic preprocessing functions. These are all invoked with directives
that start with the '@' character, which must be the first character in
the line.

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#sleigh_including_files}3.1. Including Files {#including-files .title}

</div>

</div>
:::

In general a single SLEIGH specification is contained in a single file,
and the compiler is invoked on one file at a time. Multiple files can be
put together for one specification by using the [**\@include**]{.bold}
directive. This must appear at the beginning of the line and is followed
by the path name of the file to be included, enclosed in double quotes.

::: {.informalexample}
`@include "example.slaspec"`{.code}
:::

Parsing proceeds as if the entire line is replaced with the contents of
the indicated file. Multiple inclusions are possible, and the included
files can have their own [**\@include**]{.bold} directives.
:::

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#sleigh_preprocessor_macros}3.2. Preprocessor Macros {#preprocessor-macros .title}

</div>

</div>
:::

SLEIGH allows simple (unparameterized) macro definitions and expansions.
A macro definition occurs on one line and starts with the
[**\@define**]{.bold} directive. This is followed by an identifier for
the macro and then a string to which the macro should expand. The string
must either be a proper identifier itself or surrounded with double
quotes. The macro can then be expanded with typical "\$(identifier)"
syntax at any other point in the specification following the definition.

::: {.informalexample}
```
@define ENDIAN "big"
  ...
define endian=$(ENDIAN);
```
:::

This example defines a macro identified as [*ENDIAN*]{.emphasis} with
the string "big", and then expands the macro in a later SLEIGH
statement. Macro definitions can also be made from the command line and
in the ".spec" file, allowing multiple specification variations to be
derived from one file. SLEIGH also has an [**\@undef**]{.bold} directive
which removes the definition of a macro from that point on in the file.

::: {.informalexample}
`@undef ENDIAN`{.code}
:::
:::

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#sleigh_conditional_compilation}3.3. Conditional Compilation {#conditional-compilation .title}

</div>

</div>
:::

SLEIGH supports several directives that allow conditional inclusion of
parts of a specification, based on the existence of a macro, or its
value. The lines of the specification to be conditionally included are
bounded by one of the [**\@if\...**]{.bold} directives described below
and at the bottom by the [**\@endif**]{.bold} directive. If the
condition described by the [**\@if\...**]{.bold} directive is true, the
bounded lines are evaluated as part of the specification, otherwise they
are skipped. Nesting of these directives is allowed: a second
[**\@if\...**]{.bold} [**\@endif**]{.bold} pair can occur inside an
initial [**\@if**]{.bold} and [**\@endif**]{.bold}.

::: {.sect3}
::: {.titlepage}
<div>

<div>

#### []{#sleigh_ifdef}3.3.1. \@ifdef and \@ifndef {#ifdef-and-ifndef .title}

</div>

</div>
:::

The [**\@ifdef**]{.bold} directive is followed by a macro identifier and
evaluates to true if the macro is defined. The [**\@ifndef**]{.bold}
directive is similar except it evaluates to true if the macro identifier
is [*not*]{.emphasis} defined.

::: {.informalexample}
```
@ifdef ENDIAN
define endian=$(ENDIAN);
@else
define endian=little;
@endif
```
:::

This directive can only take a single identifier as an argument, any
other form is flagged as an error. For logically combining a test of
whether a macro is defined with other tests, use the
[**defined**]{.bold} operator in an [**\@if**]{.bold} or
[**\@elif**]{.bold} directive (See below).
:::

::: {.sect3}
::: {.titlepage}
<div>

<div>

#### []{#sleigh_if}3.3.2. \@if {#if .title}

</div>

</div>
:::

The [**\@if**]{.bold} directive is followed by a boolean expression with
macros as the variables and strings as the constants. Comparisons
between macros and strings are currently limited to string equality or
inequality. But individual comparisons can be combined arbitrarily using
parentheses and the boolean operators '&&', '\|\|', and '\^\^'. These
represent a [*logical and*]{.emphasis}, a [*logical or*]{.emphasis}, and
a [*logical exclusive-or*]{.emphasis} operation respectively. It is
possible to test whether a particular macro is defined within the
boolean expression for an [**\@if**]{.bold} directive, by using the
[**defined**]{.bold} operator. This exists as a keyword and a functional
operator only within a preprocessor boolean expression. The
[**defined**]{.bold} keyword takes as argument a macro identifier, and
it evaluates to true if the macro is defined.

::: {.informalexample}
```
@if defined(X_EXTENSION) || (VERSION == "5")
  ...
@endif
```
:::
:::

::: {.sect3}
::: {.titlepage}
<div>

<div>

#### []{#sleigh_else}3.3.3. \@else and \@elif {#else-and-elif .title}

</div>

</div>
:::

An [**\@else**]{.bold} directive splits the lines bounded by an
[**\@if**]{.bold} directive and an [**\@endif**]{.bold} directive into
two parts. The first part is included in the processing if the initial
[**\@if**]{.bold} directive evaluates to true, otherwise the second part
is included.

The [**\@elif**]{.bold} directive splits the bounded lines up as with
[**\@else**]{.bold}, but the second part is included only if the
previous [**\@if**]{.bold} was false and the condition specified in the
[**\@elif**]{.bold} itself is true. Between one [**\@if**]{.bold} and
[**\@endif**]{.bold} pair, there can be multiple [**\@elif**]{.bold}
directives, but only one [**\@else**]{.bold}, which must occur after all
the [**\@elif**]{.bold} directives.

::: {.informalexample}
```
@if PROCESSOR == “mips”
@ define ENDIAN “big”
@elif ((PROCESSOR==”x86”)&&(OS!=”win”))
@ define ENDIAN “little”
@else
@ define ENDIAN “unknown”
@endif
```
:::
:::
:::
:::

::: {.navfooter}

------------------------------------------------------------------------

  -------------------------------- --------------------- ----------------------------------
  [Prev](sleigh_layout.html)                                [Next](sleigh_definitions.html)
  2. Basic Specification Layout     [Home](sleigh.html)                4. Basic Definitions
  -------------------------------- --------------------- ----------------------------------
:::
