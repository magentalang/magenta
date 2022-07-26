const types = ["bool", "string", "float", "double", "byte", "sbyte", "int", "uint", "int32", "uint32", "int64", "uint64"];

/**
 * @param {string} _input
 */
export function lex(_input) {
	// cleanse input
	const input = _input.replace(/\r/g, "")
	const _inputRows = input.split("\n");

	// output
	let tokens = []
	let warnings = []
	let errors = []
	const warn = (msg, i, fatal = false, length = 1) => {
		let p = findPos(input, i);
		(fatal ? errors : warnings).push({
			msg,
			row: p.row,
			col: p.col,
			source: _inputRows.slice(p.row - 1, p.row - 1 + length).join("\n"),
		});
	};

	/**
	 * @param {"selector" | "argDelim" | "exprDelim" | "bracketOpen" | "bracketClose" | "operator" | "number" | "string"} t type
	 * @param {character} c char
	 * @param {number} i index
	 */
	const pushToken = (t, c, i) => {
		const _push = (token, _type, opt) => {
			let type = _type;

			let index = i - (token.length == 1 ? 0 : token.length);
			if (token == "sum4") console.log(i, index, lastToken);

			if (type == "?") {
				if (/^[0-9]+$/mg.test(token))
					type = "number";
				else if (types.includes(token))
					type = "type";
				else if (token == "return") type = "return";
				else if (token == "break") type = "break";
				else if (token == "continue") type = "continue";
				else if (token == "enum") type = "const";
				else if (token == "var") type = "var";
				else if (token == "let") type = "let";
				else if (token == "const") type = "const";
				else if (token == "default") type = "default";
				else if (/^[a-zA-Z0-9_]+$/mg.test(token))
					type = "reference";
			}

			if (type == "string")
				index--;
			else if (type == "reference") {
				if (types.includes(token)) {
					if (!(["reference", "exprDelim"].includes(lastToken.type)))
						warn("unexpected type after " + lastToken.type, i - token.length, true)
				} else if (!(["bracketOpen", "selector", "argDelim", "exprDelim", "return", "break", "type", "operator"].includes(lastToken.type)))
					warn("unexpected reference after " + lastToken.type, i - token.length, true)
			}

			let { row, col } = findPos(input, index);
			lastToken = {_: token, type, row, col, index, ...opt}
			tokens.push(lastToken);
		}

		switch (t) {
			case "selector":
				if (temp != "") _push(temp, "reference");
				_push(c, t);
				break;
			case "argDelim":
				if (temp != "") _push(temp, "?");
				_push(c, t);
				break;
			case "exprDelim":
				if (temp != "") _push(temp, "expr");
				_push(c, t);
				break;
			case "string":
				_push(temp, t);
				break;
			case "number":
				_push(temp, t);
				break;
			case "operator":
				_push(c, t);
				break;

			case "bracketOpen":
				if (temp != "")
					if (c == "(")
						_push(temp, "func");
					else
						warn(`did not expect \`${c}\` here`, i, true);
				else if (c == "(" && lastToken.type == "reference")
					lastToken.type = "func";

				_push(c, t);
				break;

			case "bracketClose":
				if (temp != "")
					if (c == ")")
						_push(temp, "?");
					else
						warn(`did not expect \`${c}\` here`, i, true)

				_push(c, t);
				break;

			default: _push(temp, t);
		}

		temp = "";
	}
	let lastToken = {type: "exprDelim"}

	// modes
	const pushMode = (m) => { lastMode.push(mode); mode = m }
	const popMode = () => { mode = lastMode.pop() || 0 }
	const mode = {
		string: false,
		escape: false,
		number: false,
		comment: { expecting: false, multiline: false },
	}

	let temp = "";

	for (let i = 0; i < input.length; i++) {
		const c = input.charAt(i);

		// string mode
		if (mode.string) {
			if (mode.escape) {
				let add = "\\" + c;

				switch (c) {
					case "n": add = "\n"; break;
					case "t": add = "\t"; break;
					case "\\": add = "\\"; break;
					case "\"": add = "\""; break;
				}

				temp += add;

				mode.escape = false;
			} else {
				if (c == "\"") {
					mode.string = false;
					pushToken("string", c, i)
				} else if (c == "\\") {
					mode.escape = true;
				} else {
					temp += c;
				}
			}
		}

		// number mode
		else if (mode.number) {
			if (/[0-9]/.test(c)) {
				temp += c;
			} else {
				pushToken("number", c, i);
				mode.number = false;
				i--;
			}
		}

		else if (c == "\"") { // enter string mode
			if (temp != "" || !(["bracketOpen", "argDelim", "exprDelim", "operator"].includes(lastToken.type)))
				warn("did not expect string after " + lastToken.type, i, true);
			mode.string = true;
		} else if (/[0-9]/.test(c)) { // enter number mode
			if (temp == "") {
				temp = c;
				mode.number = true;
			} else {
				temp += c;
			}
		}

		else if (c == ";") { // semicolon
			pushToken("exprDelim", c, i);
		} else if (c == ",") { // comma
			if (["bracketOpen"].includes(lastToken.type))
				warn("did not expect `,` here", i, true);
			pushToken("argDelim", c, i);
		} else if (c == ".") { // period
			pushToken("selector", c, i);
		}

		else if (/[\+\-\*\/\^\%]/.test(c)) { // operations
			if (temp == "" && !(["bracketClose", "reference", "number", "string"].includes(lastToken.type)))
				warn("unexpected operator after " + lastToken.type, i, true)

			pushToken("operator", c, i);
		}

		else if (/[{\[\(]/.test(c)) { // opening brackets
			pushToken("bracketOpen", c, i);
		}else if (/[}\]\)]/.test(c)) { // closing brackets
			pushToken("bracketClose", c, i);
		}

		else if (/[a-zA-Z_]/.test(c)) { // regular characters
			temp += c;
		} else if (c == "\n") { // line break
			if (temp != "") pushToken("?", c, i);
			if (lastToken.type == "bracketClose") pushToken("exprDelim", c, i)
		} else if (temp != "") { // other
			pushToken("?", c, i);
		}
	}

	return [ tokens, warnings, errors ]
}

const findPos = (input, i) => {
	const lines = input.split("\n").map(x => x + "\n");
	let c = i, l = 0;

	while (l < lines.length) {
		const line = lines[l];
		const char = line[c];

		if (char)
			return { row: l + 1, col: c + 1 };

		c -= line.length;
		l++;
	}

	return { row: "?", col: "?" };
}
