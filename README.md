# magenta (prototype branch)
a quick and bad prototype of the magenta programming language's basic functionality before i move on to implement everything properly

## about javascript...
yes, the **prototype** is written in javascript, it is because it is the language i am most comfortable in. I have never finished a proper programmnig language before, *once i get the basic concepts banged out* i **will** move onto a **real language** to implement magenta in

# language design
inspired by the bourne shell, f#, typescript, and go. it is strongly typed, immutable where convenient, does not have null, and aims to keep code as short as possible whilst maintaining not being absolutely ridiculous

## index
- [default values](#default-values)
- [constants](#constants)
- [memory management](#memory-management)
- [booleans](#booleans)
- [conditionals](#conditionals)
- [arithmetic](#arithmetic)
- [enums](#enums)
- [piping](#piping)
- [errors and error handling](#errors-and-error-handling)
- [structs](#structs)
- [loops](#loops)
- [namespacing](#namespacing)

## default values
assignment is done with the `->` operator instead of `=` in most languages, this is because it fits in well with *piping* which is explained later

there is no "null" or "undefined" in magenta, you are encouraged to assign to variables where they are defined, but if such is not possible the variable will be assigned its default value until the writer decides to assign to them later

```cs
// regular variable assignment, type is inferred
"lorem" -> var w // string ("lorem")

// "empty" variable assignment, type has to be specified
var x string // empty string ("")
var y int    // zero (0)
var z Guy    // the struct is initialized with default values of all of its members (new Guy())
```

## constants
the `let` keyword denotes contant values. they are useful ie. in implementations of mathematical calculations since the use of a value in multiple places can be optimized
```cs
// the compiler replaces all futher instances of 'a' with "ipsum"
"lorem" -> let a
// equivalent, but you can optionally specify a type if it makes it clearer for a maintainer in a certain situation
"lorem" -> let a string

// **not possible**, `const` is used in struct definitions only
"lorem" -> const a
"lorem" -> const a string
```

if you do not assign to a constant right away, you have a chance to assign to it only once more! optimized as to have
```cs
let a string
"lorem" -> a // no error, a is changed from its default type
"ipsum" -> a // errors, a has already been set
```

## memory management
magenta is somewhat immutable, and has no references. there is no manual memory management, and it implements escape analysis as its sole garbage collection mechanism

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

## booleans
a value of T\<bool\> can only be set to `true`, `false`, or something that returns T\<bool\> (which is `true` or `false`)

magenta's booleans are home to magenta's one unary operator, the `!` which is only allowed behind expressions typed `bool`
```cs
!false or false! // → true
!true  or true!  // → false
```

there is no "internal truthiness" that may be revealed with `!` as a shorthand either, the following all error
```cs
!""  or ""!
!"x" or "x"!
!0   or 0!
!1   or 1!
```

## conditionals
magenta has the following conditionals
```cs
bool == bool // → false
bool != bool // → true
bool && bool // → false
bool || bool // → true
```

as logical expressions are evaluated left to right, they are tested for possible "short-circuit" evaluation using the following rules
```cs
bool f(x int) {
	x == 0 ? false : true -> let r
	tty.writeln(r ? "true" : "false")
	return r
}

// `$` is stdout, `→` is return value
f(1) || f(0)                 // $ t         → t
f(1) && f(0)                 // $ t, f      → f
f(0) || f(1) || f(1)         // $ f, t      → t
f(1) && f(1) && f(0) && f(1) // $ t, t, f   → f
```

## arithmetic
magenta has the following math operators, which (except for `+`) can only be used for ints
```cs
x + y
x - y
x / y
x * y
x ^ y // power (xʸ)
x % y // remainder (of x⁄y)
```

they may be used for assignment, equivalent rules on typing
```cs
var x int; var y int;

x +-> y // y + x -> y
x --> y // y - x -> y
x /-> y // y / x -> y
x *-> y // y * x -> y
x ^-> y // y ^ x -> y (yˣ)
x %-> y // y % x -> y (r of y⁄x)
```

arithmetic in magenta is done left to right, there is no operator precedence
```cs
// Brackets, Indices, Multiply, Divide, Add, Subtract
100  +  30  * 3  // → 133
100  + (30  * 3) // → 133
(100 +  30) * 3  // → 390

// magenta
100  +  30  * 3  // → 390
100  + (30  * 3) // → 133
(100 +  30) * 3  // → 390
```

brackets do not get calculated first
```cs
Int a(x int) { tty.writeln("a"); x }
Int b(x int) { tty.writeln("b"); x }

a(100) + (b(30) * 3)

// Brackets, Indices, Multiply, Divide, Add, Subtract
b, a

// magenta
a, b
```

## enums
magenta borrows the typescript way of doing enums

> typescript doesn't have enums exactly, but has equivalent functionality from typing something as a list of potential strings a value could have with the type syntax `"FOO" | "BAR" | "BAZ"`, then the compiler checks whether what a function is allowed to return, what you will get when calling a function, what a variable can be set to, etc. as well as giving you autocomplete in your editor

in magenta, you define enums as a list of strings, then you can use it as the type for functions returns/function arguments/variables/etc. enums present themselves as strings but may only have specific values, allowing comparisons with `x == "ENUM_VALUE"` instead of the longhand seen in other languages like `x == myEnum.enumValue` -- it acts the exact same way but is shorter
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

## arrays
arrays are typed as other types with brackets on the end
```cs
var numbers int[]
var twoDimensional
```

## piping
a function without brackets is an expression that errors, unless you pass then into a location that accepts that kinda of function, *or* are piping a value to it.

the pipe character `|` pipes the expression on the left to the one on the right (`expr1 | expr2`), another pipe at the end of this entire line an expression to the left of that pipe (`expr1 | expr2 | expr 3` == `(expr1 | expr2) | expr 3`)
```cs
32 + 32 | math.sqrt // 8
32 + 32 | math.sqrt | math.itoa // "8"
```

piping an array into a function will allow you to pass multiple arguments all at once, if you want to pass an array to a function that takes array arguments, you must encapsulate that array in another array
```cs
[3, 2] | math.pow // 3^2 = 9
[[3, 2]] | math.sum // 5
```

if you pipe into a function with arguments and not just the name of a function, you can use the the dollar sign to pipe A) your argument into a single location, B) multiple arguments in a single location, C) multiple arguments across different locations. you can also use multiple `$`s or multiple of the same `$n`

in this example the output of `tty.readln` is passed into `math.atoi`, which is then put to the power of three
```cs
tty.readln() | math.atoi | math.pow($, 3)
```

a few more examples
```cs
[1, 0] | arrays.push([4, 3, 2], $)
// equivalent
[1, 0] | arrays.push([4, 3, 2], $1, $2)
→	push([4, 3, 2], 1, 2)
	→ return

// same as the second example above but uses
[["Hello,", "World!"]] | arrays.join($, " ") // "Hello, World!"

[[1, 0], [-1, -2]] | arrays.push([[4], [3], [2]], $)
→	push([[4], [3], [2]], [1, 0], [-1, -2])
	→	[[4], [3], [2], [1, 0], [-1, -2]] typeof int[][]
```

further examples
```cs
// all of these are equivalent or accomplish the same effect
 3 * 5
 3  | * 5
 3  | $ * 5
[3] | $ * 5
[3] | $1 * 5
// errors bc doing `3, 6 * 5` would not be valid syntax
[3, 6] | $ * 5
// errors bc doing `int[] * 5` would not be valid syntax (although it'd be neat, you should use `arrays.map` instead)
[[3, 6]] | $ * 5
```

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

error handling is done with the catching statement (`!>`), and the whole thing is skipped if nothing is thrown

the `default` case in a catch statement is not required, though allows you to make use of the actual value returned by the function. after it a pipe of some sort is expected; it can be a regular pipe (`|`) or a conditional statement (`|>`) or assignment (`->`)
```cs
cd("thisPathDoesNotExist")
!> "notExist" : tty.writeln("invalid path"); return
!> "toFile"   : tty.writeln("cannot navigate into file"); return
!> default    | tty.writef("%s λ ", $)
```

you can have blocks here as well
```cs
cd("thisPathDoesNotExist")
!> "notExist" :
	tty.writeln("invalid path")
	return
!> "toFile" {
	getFileParentFolder()
	!> ... : ... // conditionals and/or further errors possible in blocks
	return
}> default |> // it is cleaner to put the |> here
   ... : ...
|> ... { ...
}> ... { ...
}
```

if you just want something to catch errors but no error in particular, you can use the single line catch `!!`. a break/return statement is required at the end of the handling expression(s), as well as a semicolon
```cs
// catches any errors and log it via. the err library and exits, otherwise set var squareroot to result
math.sqrt(-1) !! break err.log; -> var squareroot
```

## structs
structs are self explainatory enough, their constant fields are defined by putting `const` behind the type, and required fields are defined by putting `required` behind the `type` or behind the `const` behind a type
```cs
struct Guy {
	name string = "guy", // defines string field 'name' with value "guy"
	name = "guy", // equivalent

	age int, // no default value, will be initialized with default value (0)
	gay bool, // same but with a boolean (false)

	normal const bool = false, // defines bool field 'normal' with value false
	normal const = false, // equivalent

	// **not possible**, use `required` instead for the behaviour you're expecting
	normal const bool,

	// **not possible**, use `const`
	normal let bool = false

	// defines field 'awesome' which much be assigned a value when created
	awesome required bool,
	// similar to the above, but cannot be changed after it is set
	awesome required const bool,
}
```

a method is defined as a function beginning with the name of a struct and a period followed by the method name
```cs
int Guy.setAge(newAge int) {
	// access to the
	age -> var oldAge
	newAge -> age
	// return is optional here but kept for clarity, last line could just be `oldAge`
	return oldAge
}
```

a constructor can be defined as a methods with only the name of a struct, cannot have arguments/overflows because of how magenta's `new` works
```cs
int Guy() {
	// for example if the struct is initialized with certain values, you have the option to initialize other values (eg. event handlers?) differently
	gay ?? doSomething()
}
```

a struct is initialized with the `new` keyword. the constructor is called after, with fields assigned to at will with the same syntax as arguments are typed in function definitions except the types are now the values

in this example the struct is allocated in memory and its fields `name`, `age`, and `awesome` are set. the initialization of `awesome` may not be omitted as it is a `required` value. `normal true` overrides the default value value of `normal`, which can't be done later since it is a `const`!
```cs
new Guy(name "lisa", age 27, awesome true, normal true) -> var lisa
```

a few examples using the `lisa` struct initialized above
```cs
lisa.setAge(29) - lisa.age // 2

lisa.awesome // true
lisa.gay // false (default value of type bool)

false -> lisa.awesome // error if it is a const as well as required

true -> lisa.normal // error
```

if a struct is inititalized into a constant, **none** of it's fields may be set directly, but can still be modified if done through a function (if is not `const`!)
```cs
new Guy(name "lisa", age 27) -> let lisa

29 -> lisa.age // errors

lisa.setAge(29) // no error
```

## loops
```cs
// when there are brackets, magenta uses C style loops
for (0 -> var i; i < 10; i + 1 -> i) { ... }

// when there are no brackets, magenta uses Iterators
for returnsAnIterator() { ... }

// magenta generates an iterator and uses your custom variable name for the `in` keyword
for item in myArray { item; ... }
for item, index in myArray { myArray[index] == item... }
for key in myDict { dictionary[key]; ... }
for key, item in myDict { dictionary[key] == item; ... }

// examples of for loops using the 'loop' library
for loop.while(() => expr)
→	for(; expr;)

for loop.to(10)
→	 for (0 -> var i; i < 10; i + 1 -> i)
for loop.from(10)
→	 for (10 -> var i; i > 0; i - 1 -> i)

for loop.between(10, 1)
→	 for (10 -> var i; i > 1; i - 1 -> i)
for loop.between(6, 15, 3)
→	 for (0 -> var i; i < 10; i + 1 -> i)
for loop.between(16, 8, 2)
→	 for (0 -> var i; i < 10; i + 1 -> i)

// each one of these returns an iterator like
return new Iterator(
	init () => a -> var i,
	test () => a ♢ b,
	final () => i ± step -> i,
)
```

## namespacing
at the top of each magenta source file, magenta expects a namespace. at compile time the working directory will be scanned for magenta files and the one in the namespace `main` will be chosen as the entry point. there may be multiple files belonging to a certain namespace, but only one file may be in the `main` namespace!
```cs
namespace main
```

then after the `namespace` decleration, you may include libraries
```cs
// include libraries and namespaces
include tty
include err
include math
include loop
include arrays
include myUtility // eg. some other namespace in the project folder

// can be written in one neat line
include tty err math loop arrays myUtility
```

you may alias an included namespace, but then you cannot include any other namespaces in that line
```cs
include myUtility.errors as myErrors

// these are equivalent
myUtility.errors.GayError
myErrors.GayError
```

it can also be useful when writing a library
```cs
namespace myLib
include myLib.errors as errors
```
