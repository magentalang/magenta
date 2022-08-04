import * as _fs from "fs";
import * as util from "util";
import { lex } from "./lib/lexer.js";
import { parse } from "./lib/parser.js";

const fs = {
	readFile: util.promisify(_fs.readFile),
}

let err = false;
// todo:
// - allow specifying input file via. cli
// - read and lex all included libraries preliminarily
fs.readFile("input.m", "utf8").then((data) => {
	let [ tokens, lexerErrors ] = lex(data);
	console.log("lex →", tokens);

	let [ ast, parserErrors ] = parse(tokens);
	console.log("\nast →", ast);
	err = help(lexerErrors.concat(parserErrors));
	if (err) return;

	// compile
}).catch(console.error);

function help(errors) {
	errors.sort((a, b) => a.row - b.row).forEach(e => {
		console.log(`${e.fatal ? "\x1b[31;1m" : "\x1b[93;1m"}[${e.row}, ${e.col}] ${e.msg} \x1b[m`);
		console.log("\t" + e.source.replace(/\n/g, "\n\t"));
	})

	return errors.length > 0;
}
