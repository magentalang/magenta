// namespace that the current file belongs to
namespace main
// include libraries and namespaces
use tty
use err
use math
use arrays
use myUtility // eg. some other namespace in the project folder
// can be written in one neat line
use tty math arrays myUtility

// assignment
// num is set to 5, then 55
5 -> var num; num * 11 -> num
// piping
// calculates 58, which turns into "58" via int to ascii, and is written to console. num remains 55
num + 3 | math.itoa | tty.writeln
// piping an array to a function that doesn't take an array argument passes multiple arguments
// if it does take an array argument but you want to pass additional arguments, you must encapsulate that array in another array
[3, 2] | math.pow // 3^2 = 9
[[1, 2], [3, 4]] | arrays.concat // [1, 2, 3, 4]
// piping a value into a function that has arguments will cause the piped value(s) to be passed at the end of the function
[1, 0] | arrays.push([4, 3, 2]) // [4, 3, 2, 1, 0] typeof int[]
[[1, 0], [-1, -2]] | arrays.push([[4], [3], [2]]) // [[4], [3], [2], [1, 0], [-1, -2]] typeof int[][]

// one line conditional
potentiallyReturnsDefault() -> var result == default ?? tty.writeln("is default")

// multi line conditional/switch statement/switch pipe
// the result of the expression behind the |> is piped into each expression before each :
// if one such expression is true,
getInput("password") |>
"good"  : login(); stop 0
"short" : tty.writeln("too short")
else    : tty.writeln("otherwise invalid")

// the `return` statement stops the currently running function
// the `stop` statement breaks the current expression (be it a switch, a loop, top level of a function, etc)
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
	tty.readln() -> var input

	input |>
	== expected         : stop "good"
	len < len(expected) : stop "short"
	len > len(expected) : stop "long"

	// ending without an `return`/`stop`/`continue` is equivalent to `return default`
	// if last calculate expression is same as function's return type, return that instead of default
}

// error handling
enum FileStatus {"notExist" "file" "directory" "symlink"} 0
FileStatus stat(file string) { ... }
// error definition
// an error enum has to have an ok value, and it has to be the default value
enum NavigationError {"ok" "notExist" "toFile"} 0
string cd(path string) throws NavigationError {
	stat(path) -> var pathStat |>
	"notExist" : throw "notExist"
	"file"     : throw "toFile"

	... // return the new full current path
}
// error handling is done with a catching switch statement (!>)
// the entire catch switch is skipped if nothing is thrown
cd("thisPathDoesNotExist") !>
"notExist" : tty.writeln("invalid path"); return
"toFile"   : tty.writeln("cannot navigate into file"); return
// the default case in a catch switch is not required
// after the `default` case in the error handling switch magenta expects a pipe of some sort
// it can be a regular pipe (|) or a switch pipe (|>) or saved into a variable (->)
default | tty.writef("%s $ ")
// one liner error handling
// catches any errors and log it via. the err library, otherwise set var squareroot to result
math.sqrt(-1) !! err.log; return; -> var squareroot

// structs are self explainatory
struct Guy {
	name string = "guy", // default value for name
	age int,             // no default value, will be initialized with int's default (0)
	awesome bool,
	gay bool,
}
// methods
// a function where beginning with the name of a struct and a period
int Guy.setAge(newAge int) {
	// access to the
	age -> var oldAge
	newAge -> age
	// return is optional here but kept for clarity, last line could just be `oldAge`
	return oldAge
}
// usage
new Guy(name "lisa", age 27, awesome true) -> var lisa
lisa.setAge(29) | - lisa.age // 2
lisa.awesome // true
lisa.gay // false (default value of type bool)
