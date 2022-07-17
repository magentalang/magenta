// namespace that the current file belongs to
namespace main
// include libraries and namespaces
include tty
include err
include math
include loop
include arrays
include myUtility // eg. some other namespace in the project folder
// can be written in one neat line
include tty err math loop arrays myUtility
// you may alias a namespace, but then you cannot include any other namespaces in that line
// allows the use of the foo member of the namespace via myErrors.foo instead of myUtility.errors.foo
// can also be useful when writing inside a library eg. namespace myLib; include myLib.errors as errors
include myUtility.errors as myErrors

// assignment
// calculate 5, assign it to a new variable called num, then calculate 55 (num * 11) and assign that to num
// this implicitly types num as an int, you can be pedantic and assign to `var num int` but it has its place better on its own when you don't have anything to assign to the variable yet
5 -> var num; num * 11 -> num
var name string
"joe biven" -> name
// piping
// calculates 58, which turns into "58" via int to ascii, and is written to console. num remains 55
num + 3 | math.itoa | tty.writeln
// piping an array to a function that doesn't take an array argument passes multiple arguments
// if it does take an array argument but you want to pass additional arguments, you must encapsulate that array in another array
[3, 2] | math.pow // 3^2 = 9
[[1, 2], [3, 4]] | arrays.concat // [1, 2, 3, 4]
// piping a value into a function that has arguments will allow you to pass the arguments via the $
tty.readln() | math.atoi | math.pow($, 3) // puts user input to power of three
[1, 0] | arrays.push([4, 3, 2], $1, $2) // [4, 3, 2, 1, 0] typeof int[]
[[1, 0], [-1, -2]] | arrays.push([[4], [3], [2]], $) // [[4], [3], [2], [1, 0], [-1, -2]] typeof int[][]

// one line conditional
potentiallyReturnsDefault() -> var result == default ?? tty.writeln("is default")

// multi line conditional statement pipe
// the result of the expression behind the first |> is piped into each expression before each { or :
// { starts a block that expects a }> (else if) or } (end of the entire statement)
// : starts an expression list deliminated by semicolons that is broken by another |> (you cannot nest conditionals outside of blocks)
// if one such expression is true, the block after it is executed and none of the other ones are
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
// alternative conditional example with no blocks
isGay(new Guy())
|> true  : // yes
|> false : // no

// the `return` statement stops the currently running function
// the `break` statement breaks the current expression (be it a conditional, a loop, top level of a function, etc)
// the `continue` statement breaks the current expression and goes back to the top of the block
// all of these can take a ""return" value"
return 1

// enum EnumName {val1, val2, etc} defaultIndex
//                                 ^ required, corrosponds to the index of the enum's default value
// enums define a list of possible string literals in a situation
// unlike with other lists of things, you do not have to deliminate values by commas
// the default index is an index of one of the elements
enum GetInputResult {
	"good"
	"long"
	"short"
	"bad"
} 3
// can be written in one neat line
enum GetInputResult {"good" "long" "short" "bad"} 3

// T functionName(arg0 T, arg1 optionalT?, argRest T...)
//                                         ^ typeof T... is T[] but contains overflowing args
GetInputResult getInput(expected string, input string?) {
	// example of a conditional being used with complex comparisons
	tty.readln()
	|> == expected         : break "good"
	|> len < len(expected) : break "short"
	|> len > len(expected) : break "long"

	// ending without an `return`/`break`/`continue` is equivalent to `return default`
	// if last calculate expression is same as function's return type, return that instead of default
}

// error handling
enum FileStatus {"notExist" "file" "directory" "symlink"} 0
FileStatus stat(file string) { ... }
// error definition
// an error enum has to have an ok value, and it has to be the default value
enum NavigationError {"ok" "notExist" "toFile"} 0
string cd(path string) throws NavigationError {
	stat(path) -> var pathStat
	|> "notExist" : throw "notExist"
	|> "file"     : throw "toFile"

	... // return the new full current path
}
// error handling is done with a catching statement (!>)
// the entire catch is skipped if nothing is thrown
// unlike the conditional (|>) you cannot use blocks, you shouldn't need to anyway
cd("thisPathDoesNotExist")
!> "notExist" : tty.writeln("invalid path"); return
!> "toFile"   : tty.writeln("cannot navigate into file"); return
// the default case in a catch statement is not required
// after the `default` case in the catch statement magenta expects a pipe of some sort
// it can be a regular pipe (|) or a conditional statement (|>) or assignment (->)
!> default    | tty.writef("%s λ ", $)

// one liner error handling
// catches any errors and log it via. the err library and exits, otherwise set var squareroot to result
// a break/return statement is required at the end of the handling expression(s), as well as a semicolon
math.sqrt(-1) !! break err.log; -> var squareroot

// structs are self explainatory
struct Guy {
	name string = "guy", // default value for name
	age int,             // no default value, will be initialized with int's default (0)
	awesome bool,
	gay bool,
}
// methods
// a function beginning with the name of a struct and a period followed by the method name
int Guy.setAge(newAge int) {
	// access to the
	age -> var oldAge
	newAge -> age
	// return is optional here but kept for clarity, last line could just be `oldAge`
	return oldAge
}
// usage
new Guy(name "lisa", age 27, awesome true) -> var lisa
lisa.setAge(29) - lisa.age // 2
lisa.awesome // true
lisa.gay // false (default value of type bool)

// loops
// when there are brackets, magenta uses C style loops
for (0 -> var i; i < 10; i + 1 -> i) { ... }
// when there are no brackets, magenta uses Iterators
for returnsAnIterator() { ... }
// magenta generates an iterator and uses your custom variable name for the `in` keyword
for item in myArray { item; ... }
for item, index in myArray { myArray[index] == item... }
for key in myDict { dictionary[key]; ... }
for key, item in myDict { dictionary[key] == item; ... }
// loop library examples
for loop.to(10) // equiv to for (0 -> var i; i < 10; i + 1 -> i)
for loop.from(10) // equiv to for (10 -> var i; i > 0; i - 1 -> i)
for loop.between(10, 1) // equiv to for (10 -> var i; i > 1; i - 1 -> i)
for loop.between(6, 15, 3) // equiv to for (0 -> var i; i < 10; i + 1 -> i)
for loop.between(16, 8, 2) // equiv to for (0 -> var i; i < 10; i + 1 -> i)
// each one of these returns an iterator like
return new Iterator(
	a -> var i,
	a ♢ b,
	i ± step -> i)
