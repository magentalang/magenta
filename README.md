# magenta (prototype branch)
a quick and bad prototype of the magenta programming language's basic functionality before i move on to implement everything properly

yes, the prototype is written in javascript, it is because it is the language i am most comfortable in and have never properly made a programmnig language before. once i get the basic concepts banged out i will move onto a real language to implement magenta in

## language design
inspired by the bourne shell, f#, typescript, and go. it is strongly typed, immutable where possible, does not allow null, and aims to keep code as short as possible whilst maintaining readability and not being absolutely ridiculous

see `target.m`

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
magenta is mostly immutable, and has no references. there is no manual memory management, and it implements RAII (resource acquisition is initialization) as its sole garbage collection mechanism

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
