---
status: collected
title: 4. Basic Definitions
author: Ghidra Developers Team
collector: Hornos3
collected_date: 20240826
link: https://github.com/NationalSecurityAgency/ghidra/tree/master/GhidraDocs/languages/html/sleigh_definitions.html
---

::: {.navheader}
4. Basic Definitions
:::

[Prev](sleigh_preprocessing.html) 

 

 [Next](sleigh_symbols.html)

------------------------------------------------------------------------

::: {.sect1}
::: {.titlepage}
<div>

<div>

[]{#sleigh_definitions}4. Basic Definitions {#basic-definitions .title style="clear: both"}
-------------------------------------------

</div>

</div>
:::

SLEIGH files must start with all the definitions needed by the rest of
the specification. All definition statements start with the keyword
[**define**]{.bold} and end with a semicolon ';'.

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#sleigh_endianness_definition}4.1. Endianness Definition {#endianness-definition .title}

</div>

</div>
:::

The first definition in any SLEIGH specification must be for endianness.
Either

::: {.informalexample}
``` {.programlisting}
define endian=big;            OR
define endian=little;
```
:::

This defines how the processor interprets contiguous sequences of bytes
as integers or other values and globally affects values across all
address spaces. It also affects how integer fields within an instruction
are interpreted, (see [Section 6.1, "Defining Tokens and
Fields"](sleigh_tokens.html#sleigh_defining_tokens "6.1. Defining Tokens and Fields"){.xref}),
although it is possible to override this setting in the rare case that
endianness is different for data versus instruction encoding. The
specification designer generally only needs to worry about endianness
when labeling instruction fields and when defining overlapping
registers, otherwise the specification language hides endianness issues.
:::

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#sleigh_alignment_definition}4.2. Alignment Definition {#alignment-definition .title}

</div>

</div>
:::

An alignment definition looks like

::: {.informalexample}
``` {.programlisting}
define alignment=integer;
```
:::

This specifies the byte alignment of instructions within their address
space. It defaults to 1 or no alignment. When disassembling an
instruction at a particular, the disassembler checks the alignment of
the address against this value and can opt to flag an unaligned
instruction as an error.
:::

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#sleigh_space_definitions}4.3. Space Definitions {#space-definitions .title}

</div>

</div>
:::

The definition of an address space looks like

::: {.informalexample}
``` {.programlisting}
define space spacename attributes ;
```
:::

The [*spacename*]{.emphasis} is the name of the new space, and
[*attributes*]{.emphasis} looks like zero or more of the following
lines:

::: {.informalexample}
``` {.programlisting}
type=(ram_space|rom_space|register_space)
size=integer
default
wordsize=integer
```
:::

The only required attribute is [**size**]{.bold} which specifies the
number of bytes needed to address any byte within the space, for example
a 32-bit address space has size 4.

A space of type [**ram\_space**]{.bold} is defined as follows:

::: {.informalexample}
::: {.itemizedlist}
-   It is read/write.
-   It is part of the standard memory map of the processor.
-   It is addressable in the sense that the processor may load and store
    from dynamic pointers into the space.
:::
:::

A space of type [**register\_space**]{.bold} is intended to model the
processor's general-purpose registers. In terms of accessing and
manipulating data within the space, SLEIGH and p-code make no
distinction between the type [**ram\_space**]{.bold} or the type
[**register\_space**]{.bold}. But there are still some distinguishing
properties of a space labeled with [**register\_space**]{.bold}.

::: {.informalexample}
::: {.itemizedlist}
-   It is read/write.
-   It is [*not*]{.emphasis} part of the standard memory map of the
    processor.
-   In terms of GHIDRA, there will not be separate windows for the space
    and references into the space will not be stored.
-   Named symbols within the space will have Register objects associated
    with them in GHIDRA.
-   It is [*not*]{.emphasis} addressable. Data-flow analysis will assume
    that data within the space cannot be manipulated indirectly via
    pointer, so there is no pointer aliasing. Make sure this is true!
:::
:::

A space of type [**rom\_space**]{.bold} has seen little use so far but
is intended to be the same as a [**ram\_space**]{.bold} that is not
writable.

At least one space needs to be labeled with the [**default**]{.bold}
attribute. This should be the space that the processor accesses with its
main address bus. In terms of the rest of the specification file, this
sets the default space referred to by the '\*' operator (see
[Section 7.7.1.2, "The \'\*\'
Operator"](sleigh_constructors.html#sleigh_star_operator "7.7.1.2. The '*' Operator"){.xref}).
It also has meaning to GHIDRA.

The average 32-bit processor requires only the following two space
definitions.

::: {.informalexample}
``` {.programlisting}
define space ram type=ram_space size=4 default;
define space register type=register_space size=4;
```
:::

The [**wordsize**]{.bold} attribute can be used to specify the size of
the memory location referred to with a single address. If a space has
[**wordsize**]{.bold} two, then each address of the space refers to 16
bits of data, rather than 8 bits. If the space has [**size**]{.bold}
two, then there are still 2^16^ different addresses, but since each
address accesses two bytes, there are twice as many bytes, 2^17^, in the
space. If the [**wordsize**]{.bold} attribute is not specified, the size
of a memory location defaults to one byte (8 bits).
:::

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#sleigh_naming_registers}4.4. Naming Registers {#naming-registers .title}

</div>

</div>
:::

The general purpose registers of the processors can be named with the
following define syntax:

::: {.informalexample}
``` {.programlisting}
define spacename offset=integer size=integer stringlist ;
```
:::

A [*stringlist*]{.emphasis} is either a single string or a white space
separated list of strings in square brackets '\[' and '\]'. A string of
just "\_" indicates a skip in the sequence for that definition. The
offset corresponding to that position in the list of names will not have
a varnode defined at it.

This defines specific varnodes within the indicated address space. Each
name in the list is assigned to a varnode in turn starting at the
indicated offset within the space. Each varnode occupies the indicated
number of bytes in size. There is no restriction on size, and by reusing
the same offset in different [**define**]{.bold} statements, overlapping
varnodes are allowed. This is most often used to give registers their
standard names but could be used to label any semantic variable that
might need to be accessed globally by the processor. Overlapping
register sequences like the x86 EAX/AX/AL can be easily modeled with
overlapping varnode definitions.

Here is a typical example of register definition:

::: {.informalexample}
``` {.programlisting}
define register offset=0 size=4
    [EAX ECX EDX EBX ESP EBP ESI EDI ];
define register offset=0 size=2
    [AX _ CX _ DX _ BX _ SP _ BP _ SI _ DI];
define register offset=0 size=1
    [AL AH _ _ CL CH _ _ DL DH _ _ BL BH ];
```
:::
:::

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#sleigh_bitrange_registers}4.5. Bit Range Registers {#bit-range-registers .title}

</div>

</div>
:::

Many processors define registers that either consist of a single bit or
otherwise don\'t use an integral number of bytes. A recurring example in
many processors is the status register which is further subdivided into
the overflow and result flags for the arithmetic instructions. These
flags are typically have labels like ZF for the zero flag or CF for the
carry flag and can be considered logical registers contained within the
status register. SLEIGH allows registers to be defined like this using
the [**define bitrange**]{.bold} statement, but there are some important
caveats with its use. A bit register like this is problematic for the
underlying p-code instructions that SLEIGH models because the smallest
object they can manipulate directly is a byte. In order to manipulate
single bits, p-code must use a combination of bitwise logical,
extension, and truncation operations. So a register defined as a bit
range is not really a varnode as described in [Section 1.2,
"Varnodes"](sleigh.html#sleigh_varnodes "1.2. Varnodes"){.xref}, but is
really just a signal to the SLEIGH compiler to fill in the proper
operators to simulate the bit manipulation. Using this feature may
greatly increase the complexity of the compiled specification with
little indication within the specification file itself.

::: {.informalexample}
``` {.programlisting}
define register offset=0x180 size=4 [ statusreg ];
define bitrange zf=statusreg[10,1]
                cf=statusreg[11,1]
                sf=statusreg[12,1];
```
:::

A bit range register must be defined on top of another normal register.
In this example, [*statusreg*]{.emphasis} is defined first as a 4 byte
register, and the bit registers themselves are built by the following
[**define bitrange**]{.bold} statement. A single bit register definition
consists of an identifier for the register, followed by '=', then the
name of the register containing the bits, and finally a pair of numbers
in square brackets. The first number indicates the lowest significant
bit in the containing register of the bit range, where bit 0 is the
least significant bit. The second number indicates the number of bits in
the new register. Multiple definitions can be included in a single
[**define bitrange**]{.bold} statement, and the command is finally
terminated with a semicolon. In the example, three new registers are
defined on top of [*statusreg*]{.emphasis}, each made up of 1 bit. The
new registers [*zf*]{.emphasis}, [*cf*]{.emphasis}, and
[*sf*]{.emphasis} represent the tenth, eleventh, and twelfth bit of
[*statusreg*]{.emphasis} respectively.

The syntax for defining a new bit register is consistent with the pseudo
bit range operator, described in [Section 7.7.1.5, "Bit Range
Operator"](sleigh_constructors.html#sleigh_bitrange_operator "7.7.1.5. Bit Range Operator"){.xref},
and the resulting symbol is really just a placeholder for this operator.
Whenever SLEIGH sees this symbol it generates p-code precisely as if the
designer had used the bit range operator instead. [Section 7.7.1.5, "Bit
Range
Operator"](sleigh_constructors.html#sleigh_bitrange_operator "7.7.1.5. Bit Range Operator"){.xref},
provides some additional details about how p-code is generated, which
apply to the use of bit range registers.

If a defined bit range happens to fall on byte boundaries, the new
symbol will in fact be a normal varnode, so the [**define
bitrange**]{.bold} statement can be used as an alternate syntax for
defining overlapping registers.
:::

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#sleigh_userdefined_operations}4.6. User-Defined Operations {#user-defined-operations .title}

</div>

</div>
:::

The specification designer can define new p-code operations using a
[**define pcodeop**]{.bold} statement. This statement automatically
reserves an internal form for the new p-code operation and associates an
identifier with it. This identifier can then be used in semantic
expressions (see [Section 7.7.1.8, "User-Defined
Operations"](sleigh_constructors.html#sleigh_userdef_op "7.7.1.8. User-Defined Operations"){.xref}).
The following example defines a new p-code operation
[*arctan*]{.emphasis}.

::: {.informalexample}
``` {.programlisting}
define pcodeop arctan;
```
:::

This construction should be used sparingly. The definition does not
specify how the new operation is supposed to actually manipulate data,
and any analysis routines cannot know what the specification designer
intended. The operation will be treated as a black box. It will hold its
place in syntax trees, and the routines will understand how data flows
into and out of it. But, no other analysis will be possible.

New operations should be defined only after considering the above points
and the general philosophy of p-code. The designer should have a
detailed description of the new operation in mind, even though this
cannot be put in the specification. If it all possible, the operation
should be atomic, with specific inputs and outputs, and with no
side-effects. The most common use of a new operation is to encapsulate
actions that are too esoteric or too complicated to implement.
:::
:::

::: {.navfooter}

------------------------------------------------------------------------

  ------------------------------------ --------------------- ------------------------------
  [Prev](sleigh_preprocessing.html)                             [Next](sleigh_symbols.html)
  3. Preprocessing                      [Home](sleigh.html)      5. Introduction to Symbols
  ------------------------------------ --------------------- ------------------------------
:::
