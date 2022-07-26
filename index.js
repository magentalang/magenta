import * as _fs from "fs";
import * as util from "util";
import { lex } from "./lib/lexer.js";
import { parse } from "./lib/parser.js";
import { optimize } from "./lib/optimizer.js";
import { run } from "./lib/vm.js";

const fs = {
	readFile: util.promisify(_fs.readFile),
}

let err = false;
fs.readFile("input.m", "utf8").then((data) => {
	let [ tokens, lexerWarnings, lexerErrors ] = lex(data);
	err = help(lexerWarnings, lexerErrors);
	console.log(tokens);
	if (err) return;

	// let [ ast, parserWarnings, parserErrors ] = parse(tokens);
	// err = help(parserWarnings, parserErrors);
	// if (err) return;

	// let bytecode = optimize(ast);
	// run(bytecode);
}).catch(console.error);

function help(warnings, errors) {
	// output parser warnings
	warnings.forEach(w => {
		console.log(`\x1b[93;1m[${w.row}, ${w.col}] ${w.msg} \x1b[m`);
		console.log("\t" + w.source.replace(/\n/g, "\n\t"));
	});

	// output parser errors
	errors.forEach(e => {
		console.log(`\x1b[31;1m[${e.row}, ${e.col}] ${e.msg} \x1b[m`);
		console.log("\t" + e.source.replace(/\n/g, "\n\t"));
	});

	return errors.length > 0
}
