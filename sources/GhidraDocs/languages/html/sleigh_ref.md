---
status: collected
title: 9. P-code Tables
author: Ghidra Developers Team
collector: Hornos3
collected_date: 20240826
link: https://github.com/NationalSecurityAgency/ghidra/tree/master/GhidraDocs/languages/html/sleigh_ref.html
---

::: {.navheader}
9. P-code Tables
:::

[Prev](sleigh_context.html) 

 

 

------------------------------------------------------------------------

::: {.sect1}
::: {.titlepage}
<div>

<div>

[]{#sleigh_ref}9. P-code Tables {#p-code-tables .title style="clear: both"}
-------------------------------

</div>

</div>
:::

We list all the p-code operations by name along with the syntax for
invoking them within the semantic section of a constructor definition
(see [Section 7.7, "The Semantic
Section"](sleigh_constructors.html#sleigh_semantic_section "7.7. The Semantic Section"){.xref}),
and with a description of the operator. The terms [*v0*]{.emphasis} and
[*v1*]{.emphasis} represent identifiers of individual input varnodes to
the operation. In terms of syntax, [*v0*]{.emphasis} and
[*v1*]{.emphasis} can be replaced with any semantic expression, in which
case the final output varnode of the expression becomes the input to the
operator. The term [*spc*]{.emphasis} represents the identifier of an
address space, which is a special input to the [*LOAD*]{.emphasis} and
[*STORE*]{.emphasis} operations. The identifier of any address space can
be used.

This table lists all the operators for building semantic expressions.
The operators are listed in order of precedence, highest to lowest.

::: {.informalexample}
::: {.table}
[]{#syntaxref.htmltable}

**Table 5. Semantic Expression Operators and Syntax**

::: {.table-contents}
+-----------------+-----------------+-----------------------------------+
| [**P-code       | [**SLEIGH       | [**Description**]{.bold}          |
| Name**]{.bold}  | S               |                                   |
|                 | yntax**]{.bold} |                                   |
+=================+=================+===================================+
| `S              | ::: {           | The least significant n bytes of  |
| UBPIECE`{.code} | .informaltable} | v0. Truncate least significant n  |
|                 | []{#subpiec     | bytes of v0. Most significant     |
|                 | eref.htmltable} | bytes may be truncated depending  |
|                 |                 | on result size.                   |
|                 |   -             |                                   |
|                 | --------------- |                                   |
|                 |   `v0:2`{.code} |                                   |
|                 |                 |                                   |
|                 |  `v0(2)`{.code} |                                   |
|                 |   -             |                                   |
|                 | --------------- |                                   |
|                 | :::             |                                   |
+-----------------+-----------------+-----------------------------------+
| `P              | `popco          | Count the number of 1 bits in v0. |
| OPCOUNT`{.code} | unt(v0)`{.code} |                                   |
+-----------------+-----------------+-----------------------------------+
| `               | `lzco           | Count the number of leading 0     |
| LZCOUNT`{.code} | unt(v0)`{.code} | bits in v0.                       |
+-----------------+-----------------+-----------------------------------+
| `(sim           | `               | Extract a range of bits from v0,  |
| ulated)`{.code} | v0[6,1]`{.code} | putting result in a minimum       |
|                 |                 | number of bytes. The bracketed    |
|                 |                 | numbers give respectively, the    |
|                 |                 | least significant bit and the     |
|                 |                 | number of bits in the range.      |
+-----------------+-----------------+-----------------------------------+
| `LOAD`{.code}   | ::: {           | Dereference v1 as pointer into    |
|                 | .informaltable} | default space. Optionally specify |
|                 | []{#loa         | space to load from and size of    |
|                 | dref.htmltable} | data in bytes.                    |
|                 |                 |                                   |
|                 |   -------       |                                   |
|                 | --------------- |                                   |
|                 |   `* v1`{.code} |                                   |
|                 |   `*            |                                   |
|                 | [spc]v1`{.code} |                                   |
|                 |                 |                                   |
|                 | `*:2 v1`{.code} |                                   |
|                 |   `*[sp         |                                   |
|                 | c]:2 v1`{.code} |                                   |
|                 |   -------       |                                   |
|                 | --------------- |                                   |
|                 | :::             |                                   |
+-----------------+-----------------+-----------------------------------+
| `BOOL           | `!v0`{.code}    | Negation of boolean value v0.     |
| _NEGATE`{.code} |                 |                                   |
+-----------------+-----------------+-----------------------------------+
| `INT            | `~v0`{.code}    | Bitwise negation of v0.           |
| _NEGATE`{.code} |                 |                                   |
+-----------------+-----------------+-----------------------------------+
| `IN             | `-v0`{.code}    | Twos complement of v0.            |
| T_2COMP`{.code} |                 |                                   |
+-----------------+-----------------+-----------------------------------+
| `FL             | `f- v0`{.code}  | Additive inverse of v0 as a       |
| OAT_NEG`{.code} |                 | floating-point number.            |
+-----------------+-----------------+-----------------------------------+
| `I              | `               | Integer multiplication of v0 and  |
| NT_MULT`{.code} | v0 * v1`{.code} | v1.                               |
+-----------------+-----------------+-----------------------------------+
| `               | `               | Unsigned division of v0 by v1.    |
| INT_DIV`{.code} | v0 / v1`{.code} |                                   |
+-----------------+-----------------+-----------------------------------+
| `I              | `v              | Signed division of v0 by v1.      |
| NT_SDIV`{.code} | 0 s/ v1`{.code} |                                   |
+-----------------+-----------------+-----------------------------------+
| `               | `               | Unsigned remainder of v0 modulo   |
| INT_REM`{.code} | v0 % v1`{.code} | v1.                               |
+-----------------+-----------------+-----------------------------------+
| `I              | `v              | Signed remainder of v0 modulo v1. |
| NT_SREM`{.code} | 0 s% v1`{.code} |                                   |
+-----------------+-----------------+-----------------------------------+
| `FL             | `v              | Division of v0 by v1 as           |
| OAT_DIV`{.code} | 0 f/ v1`{.code} | floating-point numbers.           |
+-----------------+-----------------+-----------------------------------+
| `FLO            | `v              | Multiplication of v0 and v1 as    |
| AT_MULT`{.code} | 0 f* v1`{.code} | floating-point numbers.           |
+-----------------+-----------------+-----------------------------------+
| `               | `               | Addition of v0 and v1 as          |
| INT_ADD`{.code} | v0 + v1`{.code} | integers.                         |
+-----------------+-----------------+-----------------------------------+
| `               | `               | Subtraction of v1 from v0 as      |
| INT_SUB`{.code} | v0 - v1`{.code} | integers.                         |
+-----------------+-----------------+-----------------------------------+
| `FL             | `v              | Addition of v0 and v1 as          |
| OAT_ADD`{.code} | 0 f+ v1`{.code} | floating-point numbers.           |
+-----------------+-----------------+-----------------------------------+
| `FL             | `v              | Subtraction of v1 from v0 as      |
| OAT_SUB`{.code} | 0 f- v1`{.code} | floating-point numbers.           |
+-----------------+-----------------+-----------------------------------+
| `I              | `v              | Left shift of v0 by v1 bits.      |
| NT_LEFT`{.code} | 0 << v1`{.code} |                                   |
+-----------------+-----------------+-----------------------------------+
| `IN             | `v              | Unsigned (logical) right shift of |
| T_RIGHT`{.code} | 0 >> v1`{.code} | v0 by v1 bits.                    |
+-----------------+-----------------+-----------------------------------+
| `INT            | `v0             | Signed (arithmetic) right shift   |
| _SRIGHT`{.code} |  s>> v1`{.code} | of v0 by b1 bits.                 |
+-----------------+-----------------+-----------------------------------+
| `IN             | ::: {           | True if v0 is less than v1 as a   |
| T_SLESS`{.code} | .informaltable} | signed integer.                   |
|                 | []{#sles        |                                   |
|                 | sref.htmltable} |                                   |
|                 |                 |                                   |
|                 |   ----          |                                   |
|                 | --------------- |                                   |
|                 |   `v            |                                   |
|                 | 0 s< v1`{.code} |                                   |
|                 |   `v            |                                   |
|                 | 1 s> v0`{.code} |                                   |
|                 |   ----          |                                   |
|                 | --------------- |                                   |
|                 | :::             |                                   |
+-----------------+-----------------+-----------------------------------+
| `INT_SLE        | ::: {           | True if v0 is less than or equal  |
| SSEQUAL`{.code} | .informaltable} | to v1 as a signed integer.        |
|                 | []{#slessequa   |                                   |
|                 | lref.htmltable} |                                   |
|                 |                 |                                   |
|                 |   -----         |                                   |
|                 | --------------- |                                   |
|                 |   `v0           |                                   |
|                 |  s<= v1`{.code} |                                   |
|                 |   `v1           |                                   |
|                 |  s>= v0`{.code} |                                   |
|                 |   -----         |                                   |
|                 | --------------- |                                   |
|                 | :::             |                                   |
+-----------------+-----------------+-----------------------------------+
| `I              | ::: {           | True if v0 is less than v1 as an  |
| NT_LESS`{.code} | .informaltable} | unsigned integer.                 |
|                 | []{#les         |                                   |
|                 | sref.htmltable} |                                   |
|                 |                 |                                   |
|                 |   ---           |                                   |
|                 | --------------- |                                   |
|                 |   `             |                                   |
|                 | v0 < v1`{.code} |                                   |
|                 |   `             |                                   |
|                 | v1 > v0`{.code} |                                   |
|                 |   ---           |                                   |
|                 | --------------- |                                   |
|                 | :::             |                                   |
+-----------------+-----------------+-----------------------------------+
| `INT_LE         | ::: {           | True if v0 is less than or equal  |
| SSEQUAL`{.code} | .informaltable} | to v1 as an unsigned integer.     |
|                 | []{#lessequa    |                                   |
|                 | lref.htmltable} |                                   |
|                 |                 |                                   |
|                 |   ----          |                                   |
|                 | --------------- |                                   |
|                 |   `v            |                                   |
|                 | 0 <= v1`{.code} |                                   |
|                 |   `v            |                                   |
|                 | 1 >= v0`{.code} |                                   |
|                 |   ----          |                                   |
|                 | --------------- |                                   |
|                 | :::             |                                   |
+-----------------+-----------------+-----------------------------------+
| `FLO            | ::: {           | True if v0 is less than v1 viewed |
| AT_LESS`{.code} | .informaltable} | as floating-point numbers.        |
|                 | []{#fles        |                                   |
|                 | sref.htmltable} |                                   |
|                 |                 |                                   |
|                 |   ----          |                                   |
|                 | --------------- |                                   |
|                 |   `v            |                                   |
|                 | 0 f< v1`{.code} |                                   |
|                 |   `v            |                                   |
|                 | 1 f> v0`{.code} |                                   |
|                 |   ----          |                                   |
|                 | --------------- |                                   |
|                 | :::             |                                   |
+-----------------+-----------------+-----------------------------------+
| `FLOAT_LE       | ::: {           | True if v0 is less than or equal  |
| SSEQUAL`{.code} | .informaltable} | to v1 as floating-point.          |
|                 | []{#flessequa   |                                   |
|                 | lref.htmltable} |                                   |
|                 |                 |                                   |
|                 |   -----         |                                   |
|                 | --------------- |                                   |
|                 |   `v0           |                                   |
|                 |  f<= v1`{.code} |                                   |
|                 |   `v1           |                                   |
|                 |  f>= v0`{.code} |                                   |
|                 |   -----         |                                   |
|                 | --------------- |                                   |
|                 | :::             |                                   |
+-----------------+-----------------+-----------------------------------+
| `IN             | `v              | True if v0 equals v1.             |
| T_EQUAL`{.code} | 0 == v1`{.code} |                                   |
+-----------------+-----------------+-----------------------------------+
| `INT_N          | `v              | True if v0 does not equal v1.     |
| OTEQUAL`{.code} | 0 != v1`{.code} |                                   |
+-----------------+-----------------+-----------------------------------+
| `FLOA           | `v0             | True if v0 equals v1 viewed as    |
| T_EQUAL`{.code} |  f== v1`{.code} | floating-point numbers.           |
+-----------------+-----------------+-----------------------------------+
| `FLOAT_N        | `v0             | True if v0 does not equal v1      |
| OTEQUAL`{.code} |  f!= v1`{.code} | viewed as floating-point numbers. |
+-----------------+-----------------+-----------------------------------+
| `               | `               | Bitwise Logical And of v0 with    |
| INT_AND`{.code} | v0 & v1`{.code} | v1.                               |
+-----------------+-----------------+-----------------------------------+
| `               | `               | Bitwise Exclusive Or of v0 with   |
| INT_XOR`{.code} | v0 ^ v1`{.code} | v1.                               |
+-----------------+-----------------+-----------------------------------+
| `INT_OR`{.code} | `               | Bitwise Logical Or of v0 with v1. |
|                 | v0 | v1`{.code} |                                   |
+-----------------+-----------------+-----------------------------------+
| `B              | `v              | Exclusive-Or of booleans v0 and   |
| OOL_XOR`{.code} | 0 ^^ v1`{.code} | v1.                               |
+-----------------+-----------------+-----------------------------------+
| `B              | `v              | Logical-And of booleans v0 and    |
| OOL_AND`{.code} | 0 && v1`{.code} | v1.                               |
+-----------------+-----------------+-----------------------------------+
| `               | `v              | Logical-Or of booleans v0 and v1. |
| BOOL_OR`{.code} | 0 || v1`{.code} |                                   |
+-----------------+-----------------+-----------------------------------+
| `I              | `z              | Zero extension of v0.             |
| NT_ZEXT`{.code} | ext(v0)`{.code} |                                   |
+-----------------+-----------------+-----------------------------------+
| `I              | `s              | Sign extension of v0.             |
| NT_SEXT`{.code} | ext(v0)`{.code} |                                   |
+-----------------+-----------------+-----------------------------------+
| `IN             | `carry          | True if adding v0 and v1 would    |
| T_CARRY`{.code} | (v0,v1)`{.code} | produce an unsigned carry.        |
+-----------------+-----------------+-----------------------------------+
| `INT            | `scarry         | True if adding v0 and v1 would    |
| _SCARRY`{.code} | (v0,v1)`{.code} | produce a signed carry.           |
+-----------------+-----------------+-----------------------------------+
| `INT_           | `sborrow        | True if subtracting v1 from v0    |
| SBORROW`{.code} | (v0,v1)`{.code} | would produce a signed borrow.    |
+-----------------+-----------------+-----------------------------------+
| `FL             | `               | True if v0 is not a valid         |
| OAT_NAN`{.code} | nan(v0)`{.code} | floating-point number (NaN).      |
+-----------------+-----------------+-----------------------------------+
| `FL             | `               | Absolute value of v0 as floating  |
| OAT_ABS`{.code} | abs(v0)`{.code} | point number.                     |
+-----------------+-----------------+-----------------------------------+
| `FLO            | `s              | Square root of v0 as              |
| AT_SQRT`{.code} | qrt(v0)`{.code} | floating-point number.            |
+-----------------+-----------------+-----------------------------------+
| `IN             | `int2fl         | Floating-point representation of  |
| T2FLOAT`{.code} | oat(v0)`{.code} | v0 viewed as an integer.          |
+-----------------+-----------------+-----------------------------------+
| `FLOA           | `float2fl       | Copy of floating-point number v0  |
| T2FLOAT`{.code} | oat(v0)`{.code} | with more or less precision.      |
+-----------------+-----------------+-----------------------------------+
| `TRUNC`{.code}  | `tr             | Signed integer obtained by        |
|                 | unc(v0)`{.code} | truncating v0.                    |
+-----------------+-----------------+-----------------------------------+
| `FLO            | `c              | Nearest integer greater than v0.  |
| AT_CEIL`{.code} | eil(v0)`{.code} |                                   |
+-----------------+-----------------+-----------------------------------+
| `FLOA           | `fl             | Nearest integer less than v0.     |
| T_FLOOR`{.code} | oor(v0)`{.code} |                                   |
+-----------------+-----------------+-----------------------------------+
| `FLOA           | `ro             | Nearest integer to v0.            |
| T_ROUND`{.code} | und(v0)`{.code} |                                   |
+-----------------+-----------------+-----------------------------------+
| `C              | `cpool(         | Access value from the constant    |
| POOLREF`{.code} | v0,...)`{.code} | pool.                             |
+-----------------+-----------------+-----------------------------------+
| `NEW`{.code}    | `newobj         | Allocate object of type described |
|                 | ect(v0)`{.code} | by v0.                            |
+-----------------+-----------------+-----------------------------------+
| `USER_          | `ident(         | User defined operator             |
| DEFINED`{.code} | v0,...)`{.code} | [*ident*]{.emphasis}, with        |
|                 |                 | functional syntax.                |
+-----------------+-----------------+-----------------------------------+
:::
:::

\
:::

The following table lists the basic forms of a semantic statement.

::: {.informalexample}
::: {.table}
[]{#statementref.htmltable}

**Table 6. Basic Statements and Associated Operators**

::: {.table-contents}
+-----------------+-----------------+-----------------------------------+
| [**P-code       | [**SLEIGH       | [**Description**]{.bold}          |
| Name**]{.bold}  | S               |                                   |
|                 | yntax**]{.bold} |                                   |
+=================+=================+===================================+
| `COPY           | `v              | Assignment of v1 to v0.           |
| , other`{.code} | 0 = v1;`{.code} |                                   |
+-----------------+-----------------+-----------------------------------+
| `STORE`{.code}  | ::: {           | Store v1 in default space using   |
|                 | .informaltable} | v0 As pointer. Optionally specify |
|                 | []{#stor        | space to store in and size of     |
|                 | eref.htmltable} | data in bytes.                    |
|                 |                 |                                   |
|                 |   ------------- |                                   |
|                 | --------------- |                                   |
|                 |   `*            |                                   |
|                 | v0 = v1`{.code} |                                   |
|                 |   `*[spc]v      |                                   |
|                 | 0 = v1;`{.code} |                                   |
|                 |   `*:4 v        |                                   |
|                 | 0 = v1;`{.code} |                                   |
|                 |   `*[spc]:4 v   |                                   |
|                 | 0 = v1;`{.code} |                                   |
|                 |   ------------- |                                   |
|                 | --------------- |                                   |
|                 | :::             |                                   |
+-----------------+-----------------+-----------------------------------+
| `USER_          | `ident(v        | Invoke user-defined operation     |
| DEFINED`{.code} | 0,...);`{.code} | ident as a standalone statement,  |
|                 |                 | with no output.                   |
+-----------------+-----------------+-----------------------------------+
|                 | `v0[8,1         | Fill a bit range within v0 using  |
|                 | ] = v1;`{.code} | v1, leaving the rest of v0        |
|                 |                 | unchanged.                        |
+-----------------+-----------------+-----------------------------------+
|                 | `ident(v        | Invoke the macro named            |
|                 | 0,...);`{.code} | [*ident*]{.emphasis}.             |
+-----------------+-----------------+-----------------------------------+
|                 | `build          | Execute the p-code to build       |
|                 |  ident;`{.code} | operand [*ident*]{.emphasis}.     |
+-----------------+-----------------+-----------------------------------+
|                 | `delays         | Execute the p-code for the        |
|                 | lot(1);`{.code} | following instruction.            |
+-----------------+-----------------+-----------------------------------+
:::
:::

\
:::

The following table lists the branching operations and the statements
which invoke them.

::: {.informalexample}
::: {.table}
[]{#branchref.htmltable}

**Table 7. Branching Statements**

::: {.table-contents}
  ------------------------------------------------------------------------------------
  [**P-code            [**SLEIGH Syntax**]{.bold}  [**Description**]{.bold}
  Name**]{.bold}                                   
  -------------------- --------------------------- -----------------------------------
  `BRANCH`{.code}      `goto v0;`{.code}           Branch execution to address of v0.

  `CBRANCH`{.code}     `if (v0) goto v1;`{.code}   Branch execution to address of v1
                                                   if v0 equals 1 (true).

  `BRANCHIND`{.code}   `goto [v0];`{.code}         Branch execution to v0 viewed as an
                                                   offset in current space.

  `CALL`{.code}        `call v0;`{.code}           Branch execution to address of v0.
                                                   Hint that branch is subroutine
                                                   call.

  `CALLIND`{.code}     `call [v0];`{.code}         Branch execution to v0 viewed as an
                                                   offset in current space. Hint that
                                                   branch is subroutine call.

  `RETURN`{.code}      `return [v0];`{.code}       Branch execution to v0 viewed as an
                                                   offset in current space. Hint that
                                                   branch is a subroutine return.
  ------------------------------------------------------------------------------------
:::
:::

\
:::
:::

::: {.navfooter}

------------------------------------------------------------------------

  ------------------------------ --------------------- ---
  [Prev](sleigh_context.html)                             
  8. Using Context                [Home](sleigh.html)     
  ------------------------------ --------------------- ---
:::
