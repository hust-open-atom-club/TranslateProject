---
status: collected
title: Additional P-CODE Operations
author: Ghidra Developers Team
collector: Hornos3
collected_date: 20240826
link: https://github.com/NationalSecurityAgency/ghidra/tree/master/GhidraDocs/languages/html/additionalpcode.html
---

::: {.navheader}
Additional P-CODE Operations
:::

[Prev](pseudo-ops.html) 

 

 [Next](reference.html)

------------------------------------------------------------------------

::: {.sect1}
::: {.titlepage}
<div>

<div>

[]{#additionalpcode}Additional P-CODE Operations {#additional-p-code-operations .title style="clear: both"}
------------------------------------------------

</div>

</div>
:::

The following opcodes are not generated as part of the raw translation
of a machine instruction into p-code operations, so none of them can be
used in a processor specification. But, they may be introduced at a
later stage by various analysis algorithms.

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#cpui_multiequal}MULTIEQUAL {#multiequal .title}

</div>

</div>
:::

::: {.informalexample}
::: {.table}
[]{#multiequal.htmltable}

[**Parameters**]{.bold}
:::
:::
:::
:::

[**Description**]{.bold}

input0

Varnode to merge from first basic block.

input1

Varnode to merge from second basic block.

\[\...\]

Varnodes to merge from additional basic blocks.

output

Merged varnode for basic block containing op.

[**Semantic statement**]{.bold}

[*Cannot be explicitly coded.*]{.emphasis}

This operation represents a copy from one or more possible locations.
From the compiler theory concept of Static Single Assignment form, this
is a [**phi-node**]{.bold}. Each input corresponds to a control-flow
path flowing into the basic block containing the
[**MULTIEQUAL**]{.bold}. The operator copies a particular input into the
output varnode depending on what path was last executed. All inputs and
outputs must be the same size.

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#cpui_indirect}INDIRECT {#indirect .title}

</div>

</div>
:::

::: {.informalexample}
::: {.table}
[]{#indirect.htmltable}

[**Parameters**]{.bold}
:::
:::
:::

[**Description**]{.bold}

input0

Varnode on which output may depend.

input1

([**special**]{.bold})

Code iop of instruction causing effect.

output

Varnode containing result of effect.

[**Semantic statement**]{.bold}

[*Cannot be explicitly coded.*]{.emphasis}

An [**INDIRECT**]{.bold} operator copies input0 into output, but the
value may be altered in an indirect way by the operation referred to by
input1. The varnode input1 is not part of the machine state but is
really an internal reference to a specific p-code operator that may be
affecting the value of the output varnode. A special address space
indicates input1\'s use as an internal reference encoding. An
[**INDIRECT**]{.bold} op is a placeholder for possible indirect effects
(such as pointer aliasing or missing code) when data-flow algorithms do
not have enough information to follow the data-flow directly. Like the
[**MULTIEQUAL**]{.bold}, this op is used for generating Static Single
Assignment form.

A constant varnode (zero) for input0 is used by analysis to indicate
that the output of the [**INDIRECT**]{.bold} is produced solely by the
p-code operation producing the indirect effect, and there is no
possibility that the value existing prior to the operation was used or
preserved.

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#cpui_ptradd}PTRADD {#ptradd .title}

</div>

</div>
:::

::: {.informalexample}
::: {.table}
[]{#ptradd.htmltable}

[**Parameters**]{.bold}
:::
:::
:::

[**Description**]{.bold}

input0

Varnode containing pointer to an array.

input1

Varnode containing integer index.

input2

([**constant**]{.bold})

Constant varnode indicating element size.

output

Varnode result containing pointer to indexed array entry.

[**Semantic statement**]{.bold}

[*Cannot be explicitly coded.*]{.emphasis}

This operator serves as a more compact representation of the pointer
calculation, input0 + input1 \* input2, but also indicates explicitly
that input0 is a reference to an array data-type. Input0 is a pointer to
the beginning of the array, input1 is an index into the array, and
input2 is a constant indicating the size of an element in the array. As
an operation, [**PTRADD**]{.bold} produces the pointer value of the
element at the indicated index in the array and stores it in output.

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#cpui_ptrsub}PTRSUB {#ptrsub .title}

</div>

</div>
:::

::: {.informalexample}
::: {.table}
[]{#ptrsub.htmltable}

[**Parameters**]{.bold}
:::
:::
:::

[**Description**]{.bold}

input0

Varnode containing pointer to structure.

input1

Varnode containing integer offset to a subcomponent.

output

Varnode result containing pointer to the subcomponent.

[**Semantic statement**]{.bold}

[*Cannot be explicitly coded.*]{.emphasis}

A [**PTRSUB**]{.bold} performs the simple pointer calculation, input0 +
input1, but also indicates explicitly that input0 is a reference to a
structured data-type and one of its subcomponents is being accessed.
Input0 is a pointer to the beginning of the structure, and input1 is a
byte offset to the subcomponent. As an operation, [**PTRSUB**]{.bold}
produces a pointer to the subcomponent and stores it in output.

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#cpui_cast}CAST {#cast .title}

</div>

</div>
:::

::: {.informalexample}
::: {.table}
[]{#cast.htmltable}

[**Parameters**]{.bold}
:::
:::
:::

[**Description**]{.bold}

input0

Varnode containing value to be copied.

output

Varnode result of copy.

[**Semantic statement**]{.bold}

[*Cannot be explicitly coded.*]{.emphasis}

A [**CAST**]{.bold} performs identically to the [**COPY**]{.bold}
operator but also indicates that there is a forced change in the
data-types associated with the varnodes at this point in the code. The
value input0 is strictly copied into output; it is not a conversion
cast. This operator is intended specifically for when the value doesn\'t
change but its interpretation as a data-type changes at this point.

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#cpui_insert}INSERT {#insert .title}

</div>

</div>
:::

::: {.informalexample}
::: {.table}
[]{#insert.htmltable}

[**Parameters**]{.bold}
:::
:::
:::

[**Description**]{.bold}

input0

Varnode where the value will be inserted.

input1

Integer varnode containing the value to insert.

position

([**constant**]{.bold})

Constant indicating the bit position to insert at.

size

([**constant**]{.bold})

Constant indicating the number of bits to insert.

output

Varnode result containing input0 with input1 inserted.

[**Semantic statement**]{.bold}

[*Cannot be explicitly coded.*]{.emphasis}

The values [*position*]{.emphasis} and [*size*]{.emphasis} must be
constants. The least significant [*size*]{.emphasis} bits from input1
are inserted into input0, overwriting a range of bits of the same size,
but leaving any other bits in input0 unchanged. The least significant
bit of the overwritten range is given by [*position*]{.emphasis}, where
bits in index0 are labeled from least significant to most significant,
starting at 0. The value obtained after this overwriting is returned as
output. Varnodes input0 and output must be the same size and are
intended to be the same varnode. The value [*size*]{.emphasis} must be
not be bigger than the varnode input1, and [*size*]{.emphasis} +
[*position*]{.emphasis} must not be bigger than the varnode input0.

This operation is never generated as raw p-code, even though it is
equivalent to SLEIGH [**bitrange**]{.bold} syntax such as input0\[10,1\]
= input1.

::: {.sect2}
::: {.titlepage}
<div>

<div>

### []{#cpui_extract}EXTRACT {#extract .title}

</div>

</div>
:::

::: {.informalexample}
::: {.table}
[]{#extract.htmltable}

[**Parameters**]{.bold}
:::
:::
:::

[**Description**]{.bold}

input0

Varnode to extract a value from.

position

([**constant**]{.bold})

Constant indicating the bit position to extract from.

size

([**constant**]{.bold})

Constant indicating the number of bits to extract.

output

Varnode result containing the extracted value.

[**Semantic statement**]{.bold}

[*Cannot be explicitly coded.*]{.emphasis}

The values [*position*]{.emphasis} and [*size*]{.emphasis} must be
constants. The operation extracts [*size*]{.emphasis} bits from input0
and returns it in output. The [*position*]{.emphasis} indicates the
least significant bit in the range being extracted, with the bits in
input0 labeled from least to most significant, starting at 0. The
varnodes input0 and output can be different sizes, and the extracted
value is zero extended into output. The value [*size*]{.emphasis} must
not be bigger than the varnode output, and [*size*]{.emphasis} +
[*position*]{.emphasis} must not be bigger than the varnode input0.

This operation is never generated as raw p-code, even though it is
equivalent to SLEIGH [**bitrange**]{.bold} syntax such as output =
input0\[10,1\].

::: {.navfooter}

------------------------------------------------------------------------

  --------------------------- ----------------------- -------------------------
  [Prev](pseudo-ops.html)                                [Next](reference.html)
  Pseudo P-CODE Operations     [Home](pcoderef.html)           Syntax Reference
  --------------------------- ----------------------- -------------------------
:::
