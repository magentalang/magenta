#!/usr/bin/env node
const fs = require("fs");
const util = require("util");
const lex = require("./lib/lexer.js");
const parse = require("./lib/parser.js");
const info = require("./package.json");

const argv = process.argv.slice(process.argv[0] == "node" ? 3 : 2);

switch (argv[0]) {
	case "-v": case "--version":
		console.log(info.name, "v" + info.version);
		Object.keys(info.dependencies || {}).forEach(dependency =>
			console.log("→", dependency, require("./node_modules/" + dependency + "/package.json").version));
		break;

	case "-h": case "--help": case undefined:
		console.log("magenta <-v|-h> ...");
		console.log();
		console.log([
			["-v", "prints the command version"],
			["-h", "prints command help"],
			["...", "files/directories to target"],
			// todo: -o specify output for executable
		].map(x => " " + x[0] + "\t" + x[1]).join("\n"));
		break;

	default: {
		let targets = [];
		let scanArg = (arg) => {
			try {
				let r = fs.lstatSync(arg);
				if (r.isFile()) {
					targets.push(arg);
				} else if (r.isDirectory()) {
					let d = fs.readdirSync(arg);
					d.forEach(scanArg);
				}
			} catch (e) { return e; }
		}
		argv.forEach(scanArg);
		// remove duplicates
		targets = targets.filter((x, i) => i == targets.indexOf(x)).filter(x => x.endsWith(".m"));

		console.log(targets);
		if (targets.length == 0) return console.log("magenta: no .m files in target");

		let files = [];
		let errors = [];

		// read all files
		let readFiles = () => {
			targets.forEach((file, i) => {
				let x = 0;
				fs.readFile(file, "utf8", (err, data) => {
					if (err) return console.error(err);

					files.push({ data,
						filename: file,
						namespace: null,
						requires: null,
						tokens: null,
					});

					if (++x == targets.length) {
						getMeta();
					}
				});
			});
		}
		// extract namespace + includes from files
		let getMeta = () => {
			files.forEach((file, i) => {
				// extract namespace
				// extract includes
				// apply to file

				if (i == files.length - 1) {
						lexFiles();
				}
			});
		}
		// lex all files
		let lexFiles = () => {
			files.forEach((file, i) => {
				let [ tokens, lexerErrors ] = lex(file.data);
				file.tokens = tokens;
				errors = errors.concat(lexerErrors);

				console.log("lex →", file.tokens);

				if (i == files.length - 1) {
						parseAll();
				}
			});
		}
		// parse into ast
		let parseAll = () => {
			let [ ast, parserErrors ] = parse(files.map(x => x.tokens));
			console.log("\nast →", ast);
			let err = help(errors.concat(parserErrors));
			if (err) return;
		}

		readFiles();
	}
}

function help(errors) {
	errors.sort((a, b) => a.row - b.row).forEach(e => {
		console.log(`${e.fatal ? "\x1b[31;1m" : "\x1b[93;1m"}[${e.row}, ${e.col}] ${e.msg} \x1b[m`);
		console.log("\t" + e.source.replace(/\n/g, "\n\t"));
	})

	return errors.length > 0;
}
