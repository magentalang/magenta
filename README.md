# magenta (prototype branch)
a quick and bad prototype of the magenta programming language's basic functionality before i move on to implement everything properly

## about javascript...
yes, the **prototype** is written in javascript, it is because it is the language i am most comfortable in and have never properly made a programmnig language before. **once** i get the basic concepts banged out i **will** move onto a **real language** to implement magenta in

# language design
inspired by the bourne shell, f#, typescript, and go. it is strongly typed, immutable where possible, does not allow null, and aims to keep code as short as possible whilst maintaining readability and not being absolutely ridiculous

see `target.m` for less detailed but comprehensive design documentation

## default values
there is no "null" or "undefined" in magenta, you are encouraged to assign to variables where they are defined, but if such is not possible the variable will be assigned its default value until the writer decides to assign to them later

```cs
// regular variable assignment, type in inferred
"lorem" -> var w // string ("lorem")

// "empty" variable assignment, type has to be specified
var x string // empty string ("")
var y int    // zero (0)
var z Guy    // the struct is initialized with default values of all of its members (new Guy())
```

## memory management
magenta is mostly immutable, and has no references. there is no manual memory management, and it implements escape analysis as its sole garbage collection mechanism

```cs
var globalHomer Guy

string getName() {
	// initializes a new Guy with name "lisa" into new variable 'guy'
	new Guy(name "lisa") -> var guy

	// creates a copy of guy into a new variable 'otherGuy'
	guy -> var otherGuy

	"homer" -> guy.name

	// copies the values of guy over 'globalHomer''s values
	guy -> globalHomer

	"asdf" -> guy.name

	// 'otherGuy' is unaffected by the modification of guy
	return otherGuy.name // "lisa"

	// upon end of the function, all allocated resources are cleared in bulk
	// where getName() is used the caller will not receive a reference to the name, but the actual string itself
}

// globalHomer has its default values
globalHomer.name | tty.println // ""

// getName is ran, returning the name of 'otherGuy'
// it also modifies the 'globalHomer' variable...
getName() | tty.println // "lisa"

// ...but the further modification of 'guy' is not propagated (as magenta has no references!!!)
globalHomer.name | tty.println // "homer"
```

## enums
magenta borrows the typescript way of doing enums

> typescript doesn't have enums exactly, but has equivalent functionality from typing something as a list of potential strings a value could have with the type syntax `"FOO" | "BAR" | "BAZ"`, then the compiler checks whether what a function is allowed to return, what you will get when calling a function, what a variable can be set to, etc. as well as giving you autocomplete in your editor

in magenta, you define enums as a list of strings, then you can use it as the type for functions returns/function arguments/variables/etc. enums present themselves as strings but may only have specific values, allowing comparisons with `x == "ENUM_VALUE"` instead of the longhand seen in other languages like `x == myEnum.enumValue` -- it acts the exact same way but is shorter and can be much

```cs
enum GetInputResult {
	"good"
	"long"
	"short"
	"bad"
} 3

// can be written in one neat line
enum GetInputResult {"good" "long" "short" "bad"} 3

"good" -> var x // infers the string type
x -> var inputResult GetInputResult // error :(

"good" -> var y GetInputResult // explicitly GetInputResult
y -> var inputResult GetInputResult // no error :)

"bad" -> z; z -> inputResult // errors as well!
"bad" -> inputResult // no error either!
```

you may not assign or return arbitrary strings to or from variable or functions that have a specific enum type. you must respect the type.

## piping
see lines 17-33 of `target.m`. i'm not writing all those examples out.

## conditionals
conditionals are magenta's `if` and `switch` statements, it acts by piping the result of the expression the conditional branches off of to all cases. it can be an `if` by having cases such as `|> len > len(y) :` where piping into a comparator or something will determine if the case will be ran, or it can be a `switch` by having cases such as `|> z :` where piping directly into another value will compare them.

there are two kinds of cases. a "single line case" written with a `case :` will expect a `|>` for the next case, but a "block case" written with a `case {` will expect a `}>` for the next case or `}` for the end of the entire statement. a "single line case" is not necessarily confined to a single line though -- it's just shorter and more appealing if you want to write short single line cases, the advantage of using a "block case" lies in the ability to nest conditionals

"switch" conditional with block cases and single line cases
```cs
getInput("password")
|> "good"  {
	login()
	return 0
}> "short" : tty.writeln("too short")
|> "long"  : tty.writeln("too long")
|> else    {
	tty.writeln("password is otherwise invalid")
	tty.writeln("man you really fucked up")
}
```

"if" conditional with single line cases
```cs
tty.readln()
|> == expected         : break "good"
|> len < len(expected) : break "short"
|> len > len(expected) : break "long"
```

i'm sure you can infer how an "if" condtional with block cases is written

a single line conditional also exists and uses `??`, it expects a boolean expression to its left and a list of expressions deliminated by semicolons to its right (it may only run expressions on the same line!)
```cs
potentiallyReturnsDefault() -> var result == default ?? tty.writeln("is default")
```

## errors and error handling
errors in magenta are defined as enums. an error enum must have an okay value and it must be the default
```cs
enum NavigationError {"ok" "notExist" "toFile"} 0
```

example function for the below example :)
```cs
enum FileStatus {"notExist" "file" "directory" "symlink"} 0
FileStatus stat(file string) { ... }
```

don't worry, magenta doesn't force you to handle errors like java! the `throws` keyword just assures you on which errors you are allowed to throw, and what errors a catch can expect, providing autocomplete and compile time checks just like how enums are typed!
```cs
string cd(path string) throws NavigationError {
	stat(path) -> var pathStat
	|> "notExist" : throw "notExist"
	|> "file"     : throw "toFile"

	... // return the new full current path
}
```

error handling is done with the catching statement (`!>`), and the whole thing is skipped if nothing is thrown. unlike the conditional you cannot use blocks, you shouldn't need to anyway.

the `default` case in a catch statement is not required, though allows you to make use of the actual value returned by the function. after it a pipe of some sort is expected; it can be a regular pipe (`|`) or a conditional statement (`|>`) or assignment (`->`)
```cs
cd("thisPathDoesNotExist")
!> "notExist" : tty.writeln("invalid path"); return
!> "toFile"   : tty.writeln("cannot navigate into file"); return
!> default    | tty.writef("%s λ ", $)
```

if you just want something to catch errors but no error in particular, you can use the single line catch `!!`. a break/return statement is required at the end of the handling expression(s), as well as a semicolon
```cs
// catches any errors and log it via. the err library and exits, otherwise set var squareroot to result
math.sqrt(-1) !! break err.log; -> var squareroot
```
