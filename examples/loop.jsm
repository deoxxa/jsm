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
