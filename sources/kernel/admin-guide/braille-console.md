---
status: collected
title: "Linux Braille Console"
author: Linux Kernel Community
collector: tttturtle-russ
collected_date: 20240718
link: https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/admin-guide/braille-console.rst
---

# Linux Braille Console

To get early boot messages on a braille device (before userspace screen
readers can start), you first need to compile the support for the usual
serial console (see
`Documentation/admin-guide/serial-console.rst <serial_console>`{.interpreted-text
role="ref"}), and for braille device (in
`Device Drivers --> Accessibility support --> Console on braille device`{.interpreted-text
role="menuselection"}).

Then you need to specify a `console=brl`, option on the kernel command
line, the format is:

    console=brl,serial_options...

where `serial_options...` are the same as described in
`Documentation/admin-guide/serial-console.rst <serial_console>`{.interpreted-text
role="ref"}.

So for instance you can use `console=brl,ttyS0` if the braille device is
connected to the first serial port, and `console=brl,ttyS0,115200` to
override the baud rate to 115200, etc.

By default, the braille device will just show the last kernel message
(console mode). To review previous messages, press the Insert key to
switch to the VT review mode. In review mode, the arrow keys permit to
browse in the VT content, `PAGE-UP`{.interpreted-text
role="kbd"}/`PAGE-DOWN`{.interpreted-text role="kbd"} keys go at the
top/bottom of the screen, and the `HOME`{.interpreted-text role="kbd"}
key goes back to the cursor, hence providing very basic screen reviewing
facility.

Sound feedback can be obtained by adding the `braille_console.sound=1`
kernel parameter.

For simplicity, only one braille console can be enabled, other uses of
`console=brl,...` will be discarded. Also note that it does not
interfere with the console selection mechanism described in
`Documentation/admin-guide/serial-console.rst <serial_console>`{.interpreted-text
role="ref"}.

For now, only the VisioBraille device is supported.

Samuel Thibault \<<samuel.thibault@ens-lyon.org>\>
