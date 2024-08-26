---
status: collected
title: Language Versioning and Migration
author: Ghidra Developers Team
collector: Hornos3
collected_date: 20240826
link: https://github.com/NationalSecurityAgency/ghidra/tree/master/GhidraDocs/languages/versioning.html
---

Language Versioning and Migration
=================================

This document discusses the mechanisms within Ghidra which mitigate the
impact of language modifications to existing user program files.  There
are two general classes of language modifications which can be supported
by the language translation capabilities within Ghidra :\

1.  [[Version Change]{style="font-weight: bold;"}](#versioning) - caused
    by modifications to a specific language implementation which
    necessitates a re-disassembly of a programs instructions.
2.  [[Forced Language
    Migration]{style="font-weight: bold;"}](#forcedMigration) - caused
    when an existing language implementation is completely replaced by a
    new implementation (language name must be different).  It is
    important that an \"old\" language file
    ([\*.lang]{style="font-style: italic;"}) be generated for a language
    before it is eliminated.   A simple or custom language translator is
    required to facilitate the forced migration.\

Any program opened within Ghidra whose language has had a version change
or has been replaced by a new implementation will be forced to upgrade. 
This will prevent such a program file from being opened as immutable and
will impose a delay due to the necessary re-disassembly of all
instructions.

In addition to a forced upgrade, Ghidra\'s [Set
Language]{style="font-style: italic;"} capability will allow a user to
make certain transitions between similar language implementations.  Such
transitions are generally facilitated via a default translator, although
certain limitations are imposed based upon address space sizes and
register mappings.

Any changes made to a Data Organization could impact the packing of
components within a structure or union. While such changes should be
avoided due to the possible fallout, any such change to a
[\*.cspec]{style="font-style: italic;"} should be made in conjunction
with a version change to all affected languages within the relevant
[\*.ldefs]{style="font-style: italic;"} files. The resulting program
upgrade will allow affected data types to be updated.\

[]{#versioning}Language Versioning
----------------------------------

A language\'s version is specified as a[
\<major\>]{style="font-style: italic;"}[.]{style="font-weight: bold; font-style: italic;"}[\<minor\>]{style="font-style: italic;"}
number pair (e.g., 1.0).  The decision to advance the major or minor
version number should be based upon the following criteria:\

1.  [Major Version Change]{style="font-weight: bold;"} - caused by
    modifications to a specific language implementation which changes
    register addressing or context register schema.  Addition of
    registers alone does not constitute a major or minor change.\
2.  [Minor Version Change]{style="font-weight: bold;"} - caused by
    modifications to a specific language implementation which changes
    existing instruction or subconstructor pattern matching.  Pcode
    changes and addition of new instructions alone does not constitute a
    major or minor change.

Anytime the major version number is advanced, the minor version number
should be reset to zero.\

Only major version changes utilize a [Language Translator](#translators)
to facilitate the language transition.\

[]{#forcedMigration}Forced Language Migration 
---------------------------------------------

When eliminating an old language the following must be accomplished:\

1.  Establish a replacement language
2.  Generate [old-language specification](#oldlang) file
    ([\*.lang]{style="font-style: italic;"})\
3.  Establish one and only one [Language Translator](#translators) from
    the final version of the eliminated language to its replacement
    language.\

Before eliminating a language a corresponding \"old\" language file must
be generated and stored somewhere within Ghidra\'s languages directory
([core/languages/old]{style="font-style: italic;"} directory has been
established for this purpose).   In addition, a simple or custom
[Language Translator](#translators) must be established to facilitate
the language migration to the replacement language. \

An old-language file may be generated automatically while the language
still exists using the [GenerateOldLanguagePlugin
]{style="font-style: italic; font-weight: bold;"}configured into
Ghidra\'s project window.  In addition, if appropriate, a draft simple
Language Translator specification can generated provided the replacement
language is also available.\

To generate an old-language file and optionally a draft simple
translator specification:\

-   Choose the menu item File\>Generate Old Language File\...
-   Select the language to be eliminated from the languages list and
    click [Generate\...]{style="font-weight: bold;"}
-   From the file chooser select the output directory, enter a suitable
    name for the file and click [Create]{style="font-weight: bold;"}
-   Once the old-language file is generated you will be asked if you
    would like to [Create a Simple
    Translator?]{style="font-weight: bold; font-style: italic;"}  If the
    replacement language is complete and available you can click [Yes
    ]{style="font-weight: bold;"}and specify an output file with the
    file chooser.

[]{#oldlang}Old Language Specification ([\*.lang]{style="font-style: italic;"})
-------------------------------------------------------------------------------

An old-language specification file is used to describe the essential
elements of a language needed to instantiate an old program using that
language and to facilitate translation to a replacement language.\

The specification file is an XML file which identifies a language\'s
description, address spaces and named registers.   Since it should be
generated using the
[GenerateOldLanguagePlugin]{style="font-style: italic; font-weight: bold;"},
its syntax is not defined here.

[Sample Old-Language Specification
File:]{style="font-style: italic; font-weight: bold;"}\

    <?xml version="1.0" encoding="UTF-8"?>
    <language version="1" endian="big">
        <description>
            <name>MyOldProcessorLanguage</name>
            <processor>MyOldProcessor</processor>
            <family>Motorola</family>
            <alias>MyOldProcessorLanguageAlias1</alias>
       <alias>MyOldProcessorLanguageAlias2</alias>
        </description>
        <spaces>
            <space name="ram" type="ram" size="4" default="yes" />
            <space name="register" type="register" size="4" />
            <space name="data" type="code" size="4" />
        </spaces>
        <registers>
       <context_register name="contextreg" offset="0x40" bitsize="8">
                <field name="ctxbit1" range="1,1" />
                <field name="ctxbit0" range="0,0" />
            </context_register>
            <register name="r0" offset="0x0" bitsize="32" />
            <register name="r1" offset="0x4" bitsize="32" />
            <register name="r2" offset="0x8" bitsize="32" />
            <register name="r3" offset="0xc" bitsize="32" />
            <register name="r4" offset="0x10" bitsize="32" />
        </registers>
    </language>

[]{#translators}Language Translators
------------------------------------

A language translator facilitates the renaming of address spaces, and
relocation/renaming of registers.  In addition, stored register values
can be transformed - although limited knowledge is available for
decision making.  Through the process of re-disassembly, language
changes in instruction and subconstructor pattern matching is handled. 
Three forms of  translators are supported:\

1.  [Default Translator]{style="font-weight: bold;"} - in the absence of
    a simple or custom translator, an attempt will be made to map all
    address spaces and registers.  Stored register values for unmapped
    registers will be discarded.  Forced language migration can not use
    a default translator since it is the presence of a translator with
    an old-language which specifies the migration path.\
2.  [Simple Translator]{style="font-weight: bold;"} - extends the
    behavior of the default translator allowing specific address space
    and register mappings to be specified via an XML file
    ([\*.trans]{style="font-style: italic;"}).  See sample [Simple
    Translator Specification](#transfile).\
3.  [Custom Translator]{style="font-weight: bold;"} - custom translators
    can be written as a Java class which extends
    [LanguageTranslatorAdapter]{style="font-weight: bold; font-style: italic;"}
    or implements
    [LanguageTranslator]{style="font-weight: bold; font-style: italic;"}. 
    This should generally be unnecessary but can provided additional
    flexibility.  The default constructor must be public and will be
    used for instantiation.  Extending [LanguageTranslatorAdapter
    ]{style="font-weight: bold; font-style: italic;"}will allow the
    default translator capabilities to be leveraged with minimal coding.

[[]{style="font-weight: bold;"}]{style="font-family: times new roman;"}

[]{#transfile}Sample Simple Translator Specification File:

    <?xml version="1.0" encoding="UTF-8"?>
    <language_translation>

        <from_language version="1">MyOldProcessorLanguage</from_language>  
        <to_language version="1">MyNewProcessorLanguage</to_language>

        <!--
            Obsolete space will be deleted with all code units in that space.
        -->
        <delete_space name="data" />

        <!--
            Spaces whose name has changed can be mapped over
        -->
        <map_space from="ram" to="ram" />

        <!--
            Registers whose name has changed can be mapped (size and offset changes are allowed)
            The map_register may include a size attribute although it is ignored. 
        --> 
        <map_register from="r0" to="cr0" />
        <map_register from="r1" to="cr1" />

        <!--
            All existing processor context can be cleared
        -->
        <clear_all_context/>

        <!--
            A specific context value can be painted across all of program memory
            NOTE: sets occur after clear_all_context
        -->
        <set_context name="ctxbit0" value="1"/>
        
        <!--
            Force a specific Java class which extends
              ghidra.program.util.LanguagePostUpgradeInstructionHandler
            to be invoked following translation and re-disassembly to allow for more
            complex instruction context transformations/repair.
        -->
        <post_upgrade_handler class="ghidra.program.language.MyOldNewProcessorInstructionRepair" />

    </language_translation>

Translator Limitations\

The current translation mechanism does not handle the potential need for
complete re-disassembly and associated auto-analysis.\
