---
status: collected
title: 2. Basic Specification Layout
author: Ghidra Developers Team
collector: Hornos3
collected_date: 20240826
link: https://github.com/NationalSecurityAgency/ghidra/tree/master/GhidraDocs/languages/html/sleigh_layout.html
---

::: {.navheader}
2. Basic Specification Layout
:::

[Prev](sleigh.html) 

 

 [Next](sleigh_preprocessing.html)

------------------------------------------------------------------------

::: {.sect1}
::: {.titlepage}
<div>

<div>

[]{#sleigh_layout}2. Basic Specification Layout {#basic-specification-layout .title style="clear: both"}
-----------------------------------------------

</div>

</div>
:::

A SLEIGH specification is typically contained in a single file, although
see [Section 3.1, "Including
Files"](sleigh_preprocessing.html#sleigh_including_files "3.1. Including Files"){.xref}.
The file must follow a specific format as parsed by the SLEIGH compiler.
In this section, we list the basic formatting rules for this file as
enforced by the compiler.

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#sleigh_comments}2.1. Comments {#comments .title}

</div>

</div>
:::

Comments start with the '\#' character and continue to the end of the
line. Comments can appear anywhere except the [*display
section*]{.emphasis} of a constructor (see [Section 7.3, "The Display
Section"](sleigh_constructors.html#sleigh_display_section "7.3. The Display Section"){.xref})
where the '\#' character will be interpreted as something that should be
printed in disassembly.
:::

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#sleigh_identifiers}2.2. Identifiers {#identifiers .title}

</div>

</div>
:::

Identifiers are made up of letters a-z, capitals A-Z, digits 0-9 and the
characters '.' and '\_'. An identifier can use these characters in any
order and for any length, but it must not start with a digit.
:::

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#sleigh_strings}2.3. Strings {#strings .title}

</div>

</div>
:::

String literals can be used, when specifying names and when specifying
how disassembly should be printed, so that special characters are
treated as literals. Strings are surrounded by the double quote
character '"' and all characters in between lose their special meaning.
:::

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#sleigh_integers}2.4. Integers {#integers .title}

</div>

</div>
:::

Integers are specified either in a decimal format or in a standard
[*C-style*]{.emphasis} hexadecimal format by prepending the number with
"0x". Alternately, a binary representation of an integer can be given by
prepending the string of \'0\' and \'1\' characters with \"0b\".

::: {.informalexample}
``` {.programlisting}
1006789
0xF5CC5
0xf5cc5
0b11110101110011000101
```
:::

Numbers are treated as unsigned except when used in patterns where they
are treated as signed (see [Section 7.4, "The Bit Pattern
Section"](sleigh_constructors.html#sleigh_bit_pattern "7.4. The Bit Pattern Section"){.xref}).
The number of bytes used to encode the integer when specifying the
semantics of an instruction is inferred from other parts of the syntax
(see [Section 7.3, "The Display
Section"](sleigh_constructors.html#sleigh_display_section "7.3. The Display Section"){.xref}).
Otherwise, integers should be thought of as having arbitrary precision.
Currently, SLEIGH stores integers internally with 64 bits of precision.
:::

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#sleigh_white_space}2.5. White Space {#white-space .title}

</div>

</div>
:::

White space characters include space, tab, line-feed, vertical
line-feed, and carriage-return (' ', '\\t', '\\r', '\\v', '\\n').
Variations in spacing have no effect on the parsing of the file except
in string literals.
:::
:::

::: {.navfooter}

------------------------------------------------------------------------

  ---------------------- --------------------- ------------------------------------
  [Prev](sleigh.html)                             [Next](sleigh_preprocessing.html)
  SLEIGH                  [Home](sleigh.html)                      3. Preprocessing
  ---------------------- --------------------- ------------------------------------
:::
