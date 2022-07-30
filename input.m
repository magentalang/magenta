cd("thisPathDoesNotExist")
!> "notExist" : tty.writeln("invalid path"); return
!> "toFile"   : tty.writeln("cannot navigate into file"); return
!> default    | tty.writef("%s λ ", $)
