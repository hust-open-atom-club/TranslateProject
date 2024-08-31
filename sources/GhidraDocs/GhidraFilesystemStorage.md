---
status: collected
title: Ghidra Filesystem Storage
author: Ghidra Developers Team
collector: Hornos3
collected_date: 20240826
link: https://github.com/NationalSecurityAgency/ghidra/tree/master/GhidraDocs/GhidraFilesystemStorage.html
---

Ghidra Filesystem Storage
=========================

Introduction
------------

The purpose of this document is to provide technical details of the file
storage scheme(s) employed by both Ghidra projects and Ghidra Server
repositories. As of this writing Ghidra has employed two different local
filesystem storage schemes:

-   Indexed Filesystem (current)
-   Mangled Filesystem (legacy, pre-9.0 PUBLIC release)

In addition to providing details of each storage scheme, some details
are provided about how project/repository database files are stored
within each filesystem as well as some troubleshooting tips to aid in
any manual interventions which may be required.

At this point in time all filesystem implementations rely on the use of
a property file for each project defined file (*\*.prp*). For all
database type project files there will be a corresponding subdirectory
(*\~\*.db*) which is used to store all content related to a project file
database (e.g., ProgramDB). The naming and organization of these two
differ significantly between the two filesystem implementations.

### Name Mangling/Encoding

Ghidra uses the following name mangling/encoding for both Ghidra Server
project repository subdirectories as well as project folder and file
naming within the legacy Mangled Filesystem. The goal of this encoding
scheme is to preserve case-sensitive naming while allowing storage on a
single-case or case-insensitive native filesystem. This is achieved by
mutating the original name with the following character substitutions:

-   All uppercase letters replaced with an underscore (\'\_\') followed
    by the lowercase letter, and
-   All underscore (\'\_\') characters are replaced with two underscores
    (\"\_\_\")

For a Ghidra Server repository named \"My\_Project\", the resulting
filesystem storage folder named \"\_my\_\_\_project\" would appear
within the server repositories directory.

### Ghidra Project Storage

Ghidra projects employ multiple filesystem storage directories within
the top-level project directory (*\*.rep*):

-   Local project file storage (*idata*) provides the primary storage
    area for non-versioned project files and for versioned files
    checked-out by the user.
-   Versioned project file storage (*versioned*) is present with private
    non-shared projects only and provides version control storage
    similar to a Ghidra Server repository.
-   User data storage (*user*) provides non-versioned storage of
    user-specific data associated with a specific project file.

### Ghidra Server Storage

The Ghidra Server employs a separate filesystem storage directory for
each project repository using a mangled name (see *Name
Mangling/Encoding* above). While all newly created project repositories
will use the latest Indexed Filesystem storage scheme Ghidra continues
to support the legacy Mangled Filesystem which may be in use by older
Ghidra Server installations. The *svrAdmin* command provides the ability
to migrate an older Mangled Filesystem to the current Index Filesystem
(see *server/serverREADME.html*).

Indexed Filesystem (current)
----------------------------

This filesystem overcomes the project file-path length limitations
inherent to the legacy Managled Filesystem and utilizes an index file to
store project file-paths and the corresponding 8-digit hexadecimal
identifier for each (e.g., *00001234.prp* / *\~00001234.db*). The
following files are used to manage the filesystem content and are
located at the root of the filesystem storage directory.

-   Index File (*\~index.dat*) - current index file**
-   Backup Index File (*\~index.bak*) - backup of current index file
-   Temporary Index File (*\~index.tmp*) - temporary index file created
    during update
-   Index Journal File (*\~journal.dat*) - journal or recent changes not
    yet reflected by index
-   Backup Journal File (*\~journal.bak*) - backup of journal file
    created during incremental update
-   Index Lock File (*\~index.lock*) - index lock used to coordinate
    index access and modification

**Index Rebuild** - If the index file becomes corrupt it may be easily
rebuilt while the associated project is closed or Ghidra Server stopped
to avoid file access during the repair process. While the filesystem is
not active/in-use all of the index related files mentioned above may be
manually deleted from the root of the appropriate filesystem storage
directory (see Ghidra Project Storage and Ghidra Server Storage above).
Once the filesystem store is started (e.g., project opened or Ghidra
Server started) the missing index will trigger an automatic rebuild of
the index based upon the details provided by each property file
contained within (*\*.prp*).

**Locating Project File Storage** - Locating individual project files on
disk requires interpretation of the index file (*\~index.dat*) and
traversing the numbered storage folders appropriately. When locating a
project file within the index it is important to know both the full
Ghidra project directory path and project filename. If project filename
are unique you can simply search for the filename within the index,
otherwise you will have to search for project folder path first. Sample
*\~index.dat* file:

       
    VERSION=1
    /
      00000003:myFile:a701ee4b1c71321380792951888
    /A
      00000100:anotherFile:a701ee4920f909328022843906
      00000105:yetAnotherFile:a701ee48743913628104779815
    /A/B
      00001234:myFile:a701ee48019210920546276045
      00001200:myFile.1:a701ee48491297248400412904
    /A/B/C
      00000004:someFile:a701ee4a23590324427866017
    NEXT-ID:1250
    MD5:d41d8cd98f00b204e9800998ecf8427e
            

Once the project file of interest has been located within the index file
and the corresponding 8-digit hex file number identified, the storage
subfolder name is derived from the 2nd and 3rd digits of the file
number. Example file number \"00001234\" will be contained with the
subfolder \"12\". Within this subfolder the \"00001234.prp\" file should
exist as will all other numbered files which have the same 2nd/3rd
digits. The storage hierarchy for the above index file would have the
following hierarchy:

    ./~index.dat
    ./00/
        00000003.prp
        ~00000003.db/
        00000004.prp
        ~00000004.db/
    ./01/
        00000100.prp
        ~00000100.db/
        00000105.prp
        ~00000105.db/
    ./12/
        00001200.prp
        ~00001200.db/
        00001234.prp      <-- /A/B/myFile property file
        ~00001234.db/     <-- /A/B/myFile database directory
            

Mangled Filesystem (legacy)
---------------------------

This filesystem utilizes mangled naming for all project folders and
files and follows the same hierarchy as the project. For example, a
project file with the path *\"/A\_1/B\_1/myFile\"* would be found stored
as *\"./\_a\_\_1/\_b\_\_1/my\_file.prp\"* and
*\"./\_a\_\_1/\_b\_\_1/\~my\_file.db/\"*. Due to file path-length
limitations of native filesystems the use of this storage scheme is no
longer used by default and has been retained only for backward
compatibility with older projects and repositories.

Removal of Corrupt Files
------------------------

If a project or Ghidra Server repository contains a corrupt file it may
not be possible to remove the file via the Ghidra GUI or API. While a
detailed triage of a corrupt file may be possible by the Ghidra
Development Team, such files may need to be removed after being copied
for triage. For a shared repository this will require stopping the
Ghidra Server and digging into the appropriate named repository
directory. For a local project simply ensure that the project is not in
use.

For the local project case it will be neccessary to isolate the storage
issue since it could be caused by the local project store
(*\*.rep/idata/*) or versioned repository (Ghidra Server or private
non-shared (*\*.rep/versioned/*). The Ghidra Server case can easily be
identified by creating another temporary shared project to the same
shared repository and check the behavior of the project file in
question. If the same behavior is observed the issue is likely on the
server. If you need assistance identifying the source of the bad
behavior or recommended resolution please submit a Ghidra trouble
ticket.

As discussed for each filesystem above, the specific *\*.prp* file and
*\~\*.db/* directory should be identified and copied for triage. Keep a
copy will enable triage and may enable restoring the file in the future
if poossible. Once this file and corresponding directory have been
copied they may be removed from the filesystem. For the indexed
filesystem case the index related files can be deleted which will
trigger a rebuild of the index (see Indexed Filesystem above).
