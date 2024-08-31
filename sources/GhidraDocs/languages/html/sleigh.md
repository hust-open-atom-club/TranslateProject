---
status: collected
title: SLEIGH
author: Ghidra Developers Team
collector: Hornos3
collected_date: 20240826
link: https://github.com/NationalSecurityAgency/ghidra/tree/master/GhidraDocs/languages/html/sleigh.html
---

::: {.navheader}
SLEIGH
:::

 

 

 [Next](sleigh_layout.html)

------------------------------------------------------------------------

::: {.article}
::: {.titlepage}
<div>

<div>

</div>

<div>

### *A Language for Rapid Processor Specification* {#a-language-for-rapid-processor-specification .subtitle}

</div>

<div>

Last updated October 31, 2023

</div>

<div>

Originally published December 16, 2005

</div>

</div>

------------------------------------------------------------------------
:::

::: {.toc}
**Table of Contents**

[[1. Introduction to P-Code](sleigh.html#sleigh_introduction)]{.sect1}

[[1.1. Address Spaces](sleigh.html#sleigh_address_spaces)]{.sect2}

[[1.2. Varnodes](sleigh.html#sleigh_varnodes)]{.sect2}

[[1.3. Operations](sleigh.html#sleigh_operations)]{.sect2}

[[2. Basic Specification Layout](sleigh_layout.html)]{.sect1}

[[2.1. Comments](sleigh_layout.html#sleigh_comments)]{.sect2}

[[2.2. Identifiers](sleigh_layout.html#sleigh_identifiers)]{.sect2}

[[2.3. Strings](sleigh_layout.html#sleigh_strings)]{.sect2}

[[2.4. Integers](sleigh_layout.html#sleigh_integers)]{.sect2}

[[2.5. White Space](sleigh_layout.html#sleigh_white_space)]{.sect2}

[[3. Preprocessing](sleigh_preprocessing.html)]{.sect1}

[[3.1. Including
Files](sleigh_preprocessing.html#sleigh_including_files)]{.sect2}

[[3.2. Preprocessor
Macros](sleigh_preprocessing.html#sleigh_preprocessor_macros)]{.sect2}

[[3.3. Conditional
Compilation](sleigh_preprocessing.html#sleigh_conditional_compilation)]{.sect2}

[[4. Basic Definitions](sleigh_definitions.html)]{.sect1}

[[4.1. Endianness
Definition](sleigh_definitions.html#sleigh_endianness_definition)]{.sect2}

[[4.2. Alignment
Definition](sleigh_definitions.html#sleigh_alignment_definition)]{.sect2}

[[4.3. Space
Definitions](sleigh_definitions.html#sleigh_space_definitions)]{.sect2}

[[4.4. Naming
Registers](sleigh_definitions.html#sleigh_naming_registers)]{.sect2}

[[4.5. Bit Range
Registers](sleigh_definitions.html#sleigh_bitrange_registers)]{.sect2}

[[4.6. User-Defined
Operations](sleigh_definitions.html#sleigh_userdefined_operations)]{.sect2}

[[5. Introduction to Symbols](sleigh_symbols.html)]{.sect1}

[[5.1. Notes on
Namespaces](sleigh_symbols.html#sleigh_notes_namespaces)]{.sect2}

[[5.2. Predefined
Symbols](sleigh_symbols.html#sleigh_predefined_symbols)]{.sect2}

[[6. Tokens and Fields](sleigh_tokens.html)]{.sect1}

[[6.1. Defining Tokens and
Fields](sleigh_tokens.html#sleigh_defining_tokens)]{.sect2}

[[6.2. Fields as Family
Symbols](sleigh_tokens.html#sleigh_fields_family)]{.sect2}

[[6.3. Attaching Alternate Meanings to
Fields](sleigh_tokens.html#sleigh_alternate_meanings)]{.sect2}

[[6.4. Context
Variables](sleigh_tokens.html#sleigh_context_variables)]{.sect2}

[[7. Constructors](sleigh_constructors.html)]{.sect1}

[[7.1. The Five Sections of a
Constructor](sleigh_constructors.html#sleigh_sections_constructor)]{.sect2}

[[7.2. The Table
Header](sleigh_constructors.html#sleigh_table_header)]{.sect2}

[[7.3. The Display
Section](sleigh_constructors.html#sleigh_display_section)]{.sect2}

[[7.4. The Bit Pattern
Section](sleigh_constructors.html#sleigh_bit_pattern)]{.sect2}

[[7.5. Disassembly Actions
Section](sleigh_constructors.html#sleigh_disassembly_actions)]{.sect2}

[[7.6. The With
Block](sleigh_constructors.html#sleigh_with_block)]{.sect2}

[[7.7. The Semantic
Section](sleigh_constructors.html#sleigh_semantic_section)]{.sect2}

[[7.8. Tables](sleigh_constructors.html#sleigh_tables)]{.sect2}

[[7.9. P-code Macros](sleigh_constructors.html#sleigh_macros)]{.sect2}

[[7.10. Build
Directives](sleigh_constructors.html#sleigh_build_directives)]{.sect2}

[[7.11. Delay Slot
Directives](sleigh_constructors.html#sleigh_delayslot_directives)]{.sect2}

[[8. Using Context](sleigh_context.html)]{.sect1}

[[8.1. Basic Use of Context
Variables](sleigh_context.html#sleigh_context_basic)]{.sect2}

[[8.2. Local Context
Change](sleigh_context.html#sleigh_local_change)]{.sect2}

[[8.3. Global Context
Change](sleigh_context.html#sleigh_global_change)]{.sect2}

[[9. P-code Tables](sleigh_ref.html)]{.sect1}
:::

::: {.simplesect}
::: {.titlepage}
<div>

<div>

[]{#sleigh_history}History {#history .title style="clear: both"}
--------------------------

</div>

</div>
:::

This document describes the syntax for the SLEIGH processor
specification language, which was developed for the GHIDRA project. The
language that is now called SLEIGH has undergone several redesign
iterations, but it can still trace its heritage from the language SLED,
from whom its name is derived. SLED, the "Specification Language for
Encoding and Decoding", was defined by Norman Ramsey and Mary F.
Fernández in [\[3\]](sleigh.html#Ramsey97){.xref} as a concise way to
define the translation, in both directions, between machine instructions
and their corresponding assembly statements. This facilitated the
development of architecture independent disassemblers and assemblers,
such as the New Jersey Machine-code Toolkit.

The direct predecessor of SLEIGH was an implementation of SLED for
GHIDRA, which concentrated on its reverse-engineering capabilities. The
main addition of SLEIGH is the ability to provide semantic descriptions
of instructions for data-flow and decompilation analysis. This piece of
SLEIGH borrowed ideas from the Semantic Syntax Language (SSL), a
specification language developed in
[\[2\]](sleigh.html#Cifuentes00){.xref} for the University of Queensland
Binary Translator (UQBT) project by Cristina Cifuentes, Mike Van Emmerik
and Norman Ramsey.

Dr. Cristina Cifuentes\' work, in general, was an important starting
point for the GHIDRA decompiler. Its design follows the basic structure
layed out in her 1994 thesis \"Reverse Compilation Techniques\":

::: {.informalexample}
::: {.itemizedlist}
-   Disassembly of machine instructions and translation to an
    intermediate representation (IR).
-   Transformation toward a high-level representation via
    ::: {.itemizedlist}
    -   Data-flow analysis, including dead code analysis and copy
        propagation.
    -   Control-flow analysis, using graph reducibility to achieve a
        structured representation.
    :::
-   Back-end code generation from the transformed representation.
:::
:::

In keeping with her philosophy of decompilation, SLEIGH is GHIDRA\'s
implementation of the first step. It efficiently couples disassembly of
machine instructions with the initial translation into an IR.

::: {.bibliolist}
**References**

::: {.biblioentry}
[]{#Cifuentes94}

\[1\] [[Cristina]{.firstname} [Cifuentes]{.surname}.
]{.authorgroup}[*Reverse Compilation Techniques*. ]{.title}[1994.
]{.pubdate}[[Ph.D. Dissertation. Queensland University of Technology.
]{.publishername}[[Brisbane City]{.city}, [QLD]{.state},
[Australia]{.country}. ]{.address}]{.publisher}
:::

::: {.biblioentry}
[]{#Cifuentes00}

\[2\] [[[Cristina]{.firstname} [Cifuentes]{.surname} and
[Mike]{.firstname} [Van Emmerik]{.surname}. ]{.authorgroup}"UQBT:
Adaptable Binary Translation at Low Cost". ]{.biblioset}[*Computer*.
[(Mar. 2000). ]{.date}[pp. 60-66. ]{.pagenums}]{.biblioset}
:::

::: {.biblioentry}
[]{#Ramsey97}

\[3\] [[[Norman]{.firstname} [Ramsey]{.surname} and [Mary
F.]{.firstname} [Fernández]{.surname}. ]{.authorgroup}"Specifying
Representations of Machine Instructions". ]{.biblioset}[*ACM Trans.
Programming Languages and Systems*. [(May 1997). ]{.date}[pp. 492-524.
]{.pagenums}]{.biblioset}
:::
:::
:::

::: {.simplesect}
::: {.titlepage}
<div>

<div>

[]{#sleigh_overview}Overview {#overview .title style="clear: both"}
----------------------------

</div>

</div>
:::

SLEIGH is a language for describing the instruction sets of general
purpose microprocessors, in order to facilitate the reverse engineering
of software written for them. SLEIGH was designed for the GHIDRA reverse
engineering platform and is used to describe microprocessors with enough
detail to facilitate two major components of GHIDRA, the disassembly and
decompilation engines. For disassembly, SLEIGH allows a concise
description of the translation from the bit encoding of machine
instructions to human-readable assembly language statements. Moreover,
it does this with enough detail to allow the disassembly engine to break
apart the statement into the mnemonic, operands, sub-operands, and
associated syntax. For decompilation, SLEIGH describes the translation
from machine instructions into [*p-code*]{.emphasis}. P-code is a
Register Transfer Language (RTL), distinct from SLEIGH, designed to
specify the [*semantics*]{.emphasis} of machine instructions. By
[*semantics*]{.emphasis}, we mean the detailed description of how an
instruction actually manipulates data, in registers and in RAM. This
provides the foundation for the data-flow analysis performed by the
decompiler.

A SLEIGH specification typically describes a single microprocessor and
is contained in a single file. The term [*processor*]{.emphasis} will
always refer to this target of the specification.

Italics are used when defining terms and for named entities. Bold is
used for SLEIGH keywords.
:::

::: {.sect1}
::: {.titlepage}
<div>

<div>

[]{#sleigh_introduction}1. Introduction to P-Code {#introduction-to-p-code .title style="clear: both"}
-------------------------------------------------

</div>

</div>
:::

Although p-code is a distinct language from SLEIGH, because a major
purpose of SLEIGH is to specify the translation from machine code to
p-code, this document serves as a primer for p-code. The key concepts
and terminology are presented in this section, and more detail is given
in [Section 7.7, "The Semantic
Section"](sleigh_constructors.html#sleigh_semantic_section "7.7. The Semantic Section"){.xref}.
There is also a complete set of tables which list syntax and
descriptions for p-code operations in the Appendix.

The design criteria for p-code was to have a language that looks much
like modern assembly instruction sets but capable of modeling any
general purpose processor. Code for different processors can be
translated in a straightforward manner into p-code, and then a single
suite of analysis software can be used to do data-flow analysis and
decompilation. In this way, the analysis software becomes
[*retargetable*]{.emphasis}, and it isn't necessary to redesign it for
each new processor being analyzed. It is only necessary to specify the
translation of the processor's instruction set into p-code.

So the key properties of p-code are

::: {.informalexample}
::: {.itemizedlist}
-   The language is machine independent.
-   The language is designed to model general purpose processors.
-   Instructions operate on user defined registers and address spaces.
-   All data is manipulated explicitly. Instructions have no indirect
    effects.
-   Individual p-code operations mirror typical processor tasks and
    concepts.
:::
:::

SLEIGH is the language which specifies the translation from a machine
instruction to p-code. It specifies both this translation and how to
display the instruction as an assembly statement.

A model for a particular processor is built out of three concepts: the
[*address space*]{.emphasis}, the [*varnode*]{.emphasis}, and the
[*operation*]{.emphasis}. These are generalizations of the computing
concepts of RAM, registers, and machine instructions respectively.

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#sleigh_address_spaces}1.1. Address Spaces {#address-spaces .title}

</div>

</div>
:::

An [*address*]{.emphasis} space for p-code is a generalization of the
indexed memory (RAM) that a typical processor has access to, and it is
defined simply as an indexed sequence of memory [*words*]{.emphasis}
that can be read and written by p-code. In almost all cases, a
[*word*]{.emphasis} of the space is a [*byte*]{.emphasis} (8 bits), and
we will usually use the term [*byte*]{.emphasis} instead of
[*word*]{.emphasis}. However, see the discussion of the
[**wordsize**]{.bold} attribute of address spaces below.

The defining characteristics of a space are its name and its size. The
size of a space indicates the number of distinct indices into the space
and is usually given as the number of bytes required to encode an
arbitrary index into the space. A space of size 4 requires a 32 bit
integer to specify all indices and contains 2^32^ bytes. The index of a
byte is usually referred to as the [*offset*]{.emphasis}, and the offset
together with the name of the space is called the [*address*]{.emphasis}
of the byte.

Any manipulation of data that p-code operations perform happens in some
address space. This includes the modeling of data stored in RAM but also
includes the modeling of processor registers. Registers must be modeled
as contiguous sequences of bytes at a specific offset (see the
definition of varnodes below), typically in their own distinct address
space. In order to facilitate the modeling of many different processors,
a SLEIGH specification provides complete control over what address
spaces are defined and where registers are located within them.

Typically, a processor can be modeled with only two spaces, a
[*ram*]{.emphasis} address space that represents the main memory
accessible to the processor via its data-bus, and a
[*register*]{.emphasis} address space that is used to implement the
processor's registers. However, the specification designer can define as
many address spaces as needed.

There is one address space that is automatically defined for a SLEIGH
specification. This space is used to allocate temporary storage when the
SLEIGH compiler breaks down the expressions describing processor
semantics into individual p-code operations. It is called the
[*unique*]{.emphasis} space. There is also a special address space,
called the [*const*]{.emphasis} space, used as a placeholder for
constant operands of p-code instructions. For the most part, a SLEIGH
specification doesn't need to be aware of this space, but it can be used
in certain situations to force values to be interpreted as constants.
:::

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#sleigh_varnodes}1.2. Varnodes {#varnodes .title}

</div>

</div>
:::

A [*varnode*]{.emphasis} is the unit of data manipulated by p-code. It
is simply a contiguous sequence of bytes in some address space. The two
defining characteristics of a varnode are

::: {.informalexample}
::: {.itemizedlist}
-   The address of the first byte.
-   The number of bytes (size).
:::
:::

With the possible exception of constants treated as varnodes, there is
never any distinction made between one varnode and another. They can
have any size, they can overlap, and any number of them can be defined.

Varnodes by themselves are typeless. An individual p-code operation
forces an interpretation on each varnode that it uses, as either an
integer, a floating-point number, or a boolean value. In the case of an
integer, the varnode is interpreted as having a big endian or little
endian encoding, depending on the specification (see [Section 4.1,
"Endianness
Definition"](sleigh_definitions.html#sleigh_endianness_definition "4.1. Endianness Definition"){.xref}).
Certain instructions also distinguish between signed and unsigned
interpretations. For a signed integer, the varnode is considered to have
a standard twos complement encoding. For a boolean interpretation, the
varnode must be a single byte in size. In this special case, the zero
encoding of the byte is considered a [*false*]{.emphasis} value and an
encoding of 1 is a [*true*]{.emphasis} value.

These interpretations only apply to the varnode for a particular
operation. A different operation can interpret the same varnode in a
different way. Any consistent meaning assigned to a particular varnode
must be provided and enforced by the specification designer.
:::

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#sleigh_operations}1.3. Operations {#operations .title}

</div>

</div>
:::

P-code is intended to emulate a target processor by substituting a
sequence of p-code operations for each machine instruction. Thus every
p-code operation is naturally associated with the address of a specific
machine instruction, but there is usually more than one p-code operation
associated with a single machine instruction. Except in the case of
branching, p-code operations have fall-through control flow, both within
and across machine instructions. For a single machine instruction, the
associated p-code operations execute from first to last. And if there is
no branching, execution picks up with the first operation corresponding
to the next machine instruction.

Every p-code operation can take one or more varnodes as input and can
optionally have one varnode as output. The operation can only make a
change to this [*output varnode*]{.emphasis}, which is always indicated
explicitly. Because of this rule, all manipulation of data is explicit.
The operations have no indirect effects. In general, there is absolutely
no restriction on what varnodes can be used as inputs and outputs to
p-code operations. The only exceptions to this are that constants cannot
be used as output varnodes and certain operations impose restrictions on
the [*size*]{.emphasis} of their varnode operands.

The actual operations should be familiar to anyone who has studied
general purpose processor instruction sets. They break up into groups.

::: {.informalexample}
::: {.table}
[]{#ops.htmltable}

**Table 1. P-code Operations**

::: {.table-contents}
  ---------------------------------------------------------------------------------------------------------------------------------------------------------
  [**Operation                 [**List of Operations**]{.bold}
  Category**]{.bold}           
  ---------------------------- ----------------------------------------------------------------------------------------------------------------------------
  Data Moving                  `COPY, LOAD, STORE`{.code}

  Arithmetic                   `INT_ADD, INT_SUB, INT_CARRY, INT_SCARRY, INT_SBORROW,   INT_2COMP, INT_MULT, INT_DIV, INT_SDIV, INT_REM, INT_SREM`{.code}

  Logical                      `INT_NEGATE, INT_XOR, INT_AND, INT_OR, INT_LEFT, INT_RIGHT, INT_SRIGHT,   POPCOUNT, LZCOUNT`{.code}

  Integer Comparison           `INT_EQUAL, INT_NOTEQUAL, INT_SLESS, INT_SLESSEQUAL, INT_LESS, INT_LESSEQUAL`{.code}

  Boolean                      `BOOL_NEGATE, BOOL_XOR, BOOL_AND, BOOL_OR`{.code}

  Floating Point               `FLOAT_ADD, FLOAT_SUB, FLOAT_MULT, FLOAT_DIV, FLOAT_NEG,   FLOAT_ABS, FLOAT_SQRT, FLOAT_NAN`{.code}

  Floating Point Compare       `FLOAT_EQUAL, FLOAT_NOTEQUAL, FLOAT_LESS, FLOAT_LESSEQUAL`{.code}

  Floating Point Conversion    `INT2FLOAT, FLOAT2FLOAT, TRUNC, CEIL, FLOOR, ROUND`{.code}

  Branching                    `BRANCH, CBRANCH, BRANCHIND, CALL, CALLIND, RETURN`{.code}

  Extension/Truncation         `INT_ZEXT, INT_SEXT, PIECE, SUBPIECE`{.code}

  Managed Code                 `CPOOLREF, NEW`{.code}
  ---------------------------------------------------------------------------------------------------------------------------------------------------------
:::
:::

\
:::

We postpone a full discussion of the individual operations until
[Section 7.7, "The Semantic
Section"](sleigh_constructors.html#sleigh_semantic_section "7.7. The Semantic Section"){.xref}.
:::
:::
:::

::: {.navfooter}

------------------------------------------------------------------------

  --- --- --------------------------------
                [Next](sleigh_layout.html)
             2. Basic Specification Layout
  --- --- --------------------------------
:::
