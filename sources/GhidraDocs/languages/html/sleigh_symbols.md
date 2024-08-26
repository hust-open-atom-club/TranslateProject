---
status: collected
title: 5. Introduction to Symbols
author: Ghidra Developers Team
collector: Hornos3
collected_date: 20240826
link: https://github.com/NationalSecurityAgency/ghidra/tree/master/GhidraDocs/languages/html/sleigh_symbols.html
---

::: {.navheader}
5. Introduction to Symbols
:::

[Prev](sleigh_definitions.html) 

 

 [Next](sleigh_tokens.html)

------------------------------------------------------------------------

::: {.sect1}
::: {.titlepage}
<div>

<div>

[]{#sleigh_symbols}5. Introduction to Symbols {#introduction-to-symbols .title style="clear: both"}
---------------------------------------------

</div>

</div>
:::

After the definition section, we are prepared to start writing the body
of the specification. This part of the specification shows how the bits
in an instruction break down into opcodes, operands, immediate values,
and the other pieces of an instruction. Then once this is figured out,
the specification must also describe exactly how the processor would
manipulate the data and operands if this particular instruction were
executed. All of SLEIGH revolves around these two major tasks of
disassembling and following semantics. It should come as no surprise
then that the primary symbols defined and manipulated in the
specification all have two key properties.

::: {.informalexample}
::: {.orderedlist}
1.  How does the symbol get displayed as part of the disassembly?
2.  What semantic variable is associated with the symbol, and how is it
    constructed?
:::
:::

Formally a [*Specific Symbol*]{.emphasis} is defined as an identifier
associated with

::: {.informalexample}
::: {.orderedlist}
1.  A string displayed in disassembly.
2.  varnode used in semantic actions, and any p-code used to construct
    that varnode.
:::
:::

The named registers that we defined earlier are the simplest examples of
specific symbols (see [Section 4.4, "Naming
Registers"](sleigh_definitions.html#sleigh_naming_registers "4.4. Naming Registers"){.xref}).
The symbol identifier itself is the string that will get printed in
disassembly and the varnode associated with the symbol is the one
constructed by the define statement.

The other crucial part of the specification is how to map from the bits
of a particular instruction to the specific symbols that apply. To this
end we have the [*Family Symbol*]{.emphasis}, which is defined as an
identifier associated with a map from machine instructions to specific
symbols.

::: {.informalexample}
[**Family Symbol:**]{.bold} Instruction Encodings =\> Specific Symbols
:::

The set of instruction encodings that map to a single specific symbol is
called an [*instruction pattern*]{.emphasis} and is described more fully
in [Section 7.4, "The Bit Pattern
Section"](sleigh_constructors.html#sleigh_bit_pattern "7.4. The Bit Pattern Section"){.xref}.
In most cases, this can be thought of as a mask on the bits of the
instruction and a value that the remaining unmasked bits must match. At
any rate, the family symbol identifier, when taken out of context,
represents the entire collection of specific symbols involved in this
map. But in the context of a specific instruction, the identifier
represents the one specific symbol associated with the encoding of that
instruction by the family symbol map.

Given these maps, the idea of the specification is to build up more and
more complicated family symbols until we have a single root symbol. This
gives us a single map from the bits of an instruction to the full
disassembly of it and to the sequence of p-code instructions that
simulate the instruction.

The symbol responsible for combining smaller family symbols is called a
[*table*]{.emphasis}, which is fully described in [Section 7.8,
"Tables"](sleigh_constructors.html#sleigh_tables "7.8. Tables"){.xref}.
Any [*table*]{.emphasis} symbol can be used in the definition of other
[*table*]{.emphasis} symbols until the root symbol is fully described.
The root symbol has the predefined identifier
[*instruction*]{.emphasis}.

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#sleigh_notes_namespaces}5.1. Notes on Namespaces {#notes-on-namespaces .title}

</div>

</div>
:::

Almost all identifiers live in the same global \"scope\". The global
scope includes

::: {.informalexample}
::: {.itemizedlist}
-   Names of address spaces
-   Names of tokens
-   Names of fields
-   Names of user-defined p-code ops
-   Names of registers
-   Names of macros (see [Section 7.9, "P-code
    Macros"](sleigh_constructors.html#sleigh_macros "7.9. P-code Macros"){.xref})
-   Names of tables (see [Section 7.8,
    "Tables"](sleigh_constructors.html#sleigh_tables "7.8. Tables"){.xref})
:::
:::

All of the names in this scope must be unique. Each individual
[*constructor*]{.emphasis} (defined in [Section 7,
"Constructors"](sleigh_constructors.html "7. Constructors"){.xref})
defines a local scope for operand names. As with most languages, a local
symbol with the same name as a global symbol [*hides*]{.emphasis} the
global symbol while that scope is in effect.
:::

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#sleigh_predefined_symbols}5.2. Predefined Symbols {#predefined-symbols .title}

</div>

</div>
:::

We list all of the symbols that are predefined by SLEIGH.

::: {.informalexample}
::: {.table}
[]{#predefine.htmltable}

**Table 2. Predefined Symbols**

::: {.table-contents}
  ---------------------------------------------------------------------------
  [**Identifier**]{.bold}   [**Meaning**]{.bold}
  ------------------------- -------------------------------------------------
  `instruction`{.code}      The root instruction table.

  `const`{.code}            Special address space for building constant
                            varnodes.

  `unique`{.code}           Address space for allocating temporary registers.

  `inst_start`{.code}       Offset of the address of the current instruction.

  `inst_next`{.code}        Offset of the address of the next instruction.

  `inst_next2`{.code}       Offset of the address of the instruction after
                            the next instruction.

  `epsilon`{.code}          A special identifier indicating an empty bit
                            pattern.
  ---------------------------------------------------------------------------
:::
:::

\
:::

The most important of these to be aware of are
[*inst\_start*]{.emphasis} and [*inst\_next*]{.emphasis}. These are
family symbols which map in the context of particular instruction to the
integer offset of either the address of the instruction or the address
of the next instruction respectively. These are used in any relative
branching situation. The [*inst\_next2*]{.emphasis} is intended for
conditional skip instruction situations. The remaining symbols are
rarely used. The [*const*]{.emphasis} and [*unique*]{.emphasis}
identifiers are address spaces. The [*epsilon*]{.emphasis} identifier is
inherited from SLED and is a specific symbol equivalent to the constant
zero. The [*instruction*]{.emphasis} identifier is the root instruction
table.
:::
:::

::: {.navfooter}

------------------------------------------------------------------------

  ---------------------------------- --------------------- -----------------------------
  [Prev](sleigh_definitions.html)                             [Next](sleigh_tokens.html)
  4. Basic Definitions                [Home](sleigh.html)           6. Tokens and Fields
  ---------------------------------- --------------------- -----------------------------
:::
