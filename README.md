jsm
===

It's like ASM, but it's JavaScript underneath.

Overview
--------

I wanted to learn about how a CPU works. I figured the best way to do that was
to ignore all existing literature and just try to emulate one, based on the tiny
amount of assembly knowledge I have. This is the result.

Programs
--------

### jsm-assemble

**Usage:**

`$ jsm-assemble [source.jsm] [program.bin]`

**Description:**

Assembles a .jsm source file into a binary program image, ready for execution.

### jsm-execute

**Usage:**

`$ jsm-execute [program.bin]`

**Description:**

Executes a program image and dumps out the state of the CPU at the end.

CPU
---

The CPU is a really simple thing. It has a configurable number of registers (by
default 8,) one region of memory, an instruction pointer, a "running" flag, and
a counter of the number of ticks it has processed.

I stole inspiration from a bunch of difference places to put it together - most
of the terminology is gleaned from Wikipedia and early Intel specifications.

Opcodes
-------

These will probably change a lot as I mess with things. Deal with it.

### NOP [0x00]

**Long name:**

No operation

**Arguments:**

*none*

**Effects:**

*none*

### SET [0x01]

**Long name:**

Set register value

**Arguments:**

* register (number)
* value (number)

**Effects:**

Sets register *register* to value *value*.

### CPY [0x02]

**Long name:**

Copy register value

**Arguments:**

* from (number)
* to (number)

**Effects:**

Sets register *to* to the value of register *from*.

### DRB [0x03]

**Long name:**

Dynamic read byte

**Arguments:**

* target (number)
* reference (number)

**Effects:**

Sets register *target* to the value of the byte-sized region of memory pointed
to by register *reference*.

### DWB [0x04]

**Long name:**

Dynamic write byte

**Arguments:**

* source (number)
* reference (number)

**Effects:**

Sets the byte-sized region of memory pointed to by register *reference* to the
value of register *source*.

### SRB [0x05]

**Long name:**

Static read byte

**Arguments:**

* target (number)
* address (number)

**Effects:**

Sets register *target* to the value of the byte-sized region of memory at
*address*.

### SWB [0x06]

**Long name:**

Static write byte

**Arguments:**

* source (number)
* address (number)

**Effects:**

Sets the byte-sized region of memory *address* to the value of register
*source*.

### ADD [0x07]

**Long name:**

Add registers

**Arguments:**

* target (number)
* register a (number)
* register b (number)

**Effects:**

Sets register *target* to the sum of registers *register a* and *register b*.

### MUL [0x08]

**Long name:**

Multiply registers

**Arguments:**

* target (number)
* register a (number)
* register b (number)

**Effects:**

Sets register *target* to the product of registers *register a* and *register b*.

### AND [0x09]

**Long name:**

AND registers

**Arguments:**

* target (number)
* register a (number)
* register b (number)

**Effects:**

Sets register *target* to the AND of registers *register a* and *register b*.

### OR  [0x0a]

**Long name:**

OR registers

**Arguments:**

* target (number)
* register a (number)
* register b (number)

**Effects:**

Sets register *target* to the OR of registers *register a* and *register b*.

### XOR [0x0b]

**Long name:**

XOR registers

**Arguments:**

* target (number)
* register a (number)
* register b (number)

**Effects:**

Sets register *target* to the XOR of registers *register a* and *register b*.

### JMP [0x0c]

**Long name:**

Jump

**Arguments:**

* location (number)

**Effects:**

Sets the instruction pointer to *location*.

### JNE [0x0d]

**Long name:**

Jump if not equal

**Arguments:**

* register a (number)
* register b (number)
* location (number)

**Effects:**

Sets the instruction pointer to *location* if register *register a* is not equal
to register *register b*.

### END [0xff]

**Long name:**

End execution

**Arguments:**

*none*

**Effects:**

Tells the CPU to stop executing by setting the running flag to false.

Assembly Language
-----------------

The language I've cooked up is basically just the result of me stealing little
bits of syntax from Wikipedia and whatever popped up when I searched for
"assembly language" on the Google. It'll likely be in a quickly-changing state
until I'm happy with it.

The basic concept is that you have your operation on the left, and arguments
following it, separated by commas. Arguments can be either literal numbers (in
decimal or hex) or expressions, where expressions are composed of very basic
arithmetic. Inside expressions, labels will be expanded to refer to their
position in the program's image. Labels are specified by prefixing their name
with a colon. Comments are designated by a semicolon, and will eat up anything
right to the end of the line.

If you've read any assembly before, it should be familiar enough. This is how it
looks (you can find this code in [examples/loop.jsm](./examples/loop.jsm)):

```
; this is the entry point of our program. everything is just executed from start
; to finish. this means that if you go past the end of your code you start
; executing data. lol.

;
; this program is basically:
;
; for (i=0;i<10;++i) {
;   // do nothing
; }
;

:start

SET 0, 0x00 ; initial value
SET 1, 0x01 ; increment amount
SET 2, 0x0a ; target value (10)

:before_loop             ; do {
ADD 0, 0, 1              ;   r0 = r0 + r1;
JNE 0, 2, [:before_loop] ; } while (r0 != r2);
:after_loop

; at this point, registers 0 and 2 should be equal.

; this is the end of our code! when the CPU gets here, it'll stop. hopefully.

END
```

License
-------

3-clause BSD. A copy is included with the source.

Contact
-------

* GitHub ([deoxxa](http://github.com/deoxxa))
* Twitter ([@deoxxa](http://twitter.com/deoxxa))
* Email ([deoxxa@fknsrs.biz](mailto:deoxxa@fknsrs.biz))
