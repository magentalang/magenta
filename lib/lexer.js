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
	 * @param {string} t type
	 * @param {character} c char
	 * @param {number} i index
	 */
	const pushToken = (t, c, i) => {
		const _push = (token, _type, opt) => {
			let type = _type;
			let index = i - (type != "string" && token.length == 1 ? 0 : token.length);

			// if type is unspecified then try to automagically get it
			if (type == "?" || !type) {
				if (/^[0-9]+$/mg.test(token))
					type = "number";
				else if (types.includes(token))
					type = "type";
				else if (["new", "true", "false", "default", "return", "break", "continue", "var", "let", "enum", "struct", "required", "const", "for", "in", "namespace", "include", "as"].includes(token))
					type = token;
				else if (/^[a-zA-Z0-9_]+$/mg.test(token))
					type = "reference";
			}

			if (type == "string")
				index--;
			else if (type == "type" && !(["comment", "reference", "exprDelim"].includes(lastToken.type)))
				warn("unexpected type after " + lastToken.type, index, true)

			let { row, col } = findPos(input, index);
			// update lastToken to newest token and add the newest token to the tokens list
			lastToken = {_: token, type, row, col, index, ...opt}
			tokens.push(lastToken);
		}

		switch (t) {
			case "period": case "selector": case "exprDelim": case "argDelim": case "ternary": case "case":
				if (temp != "") _push(temp, "?");
				_push(c, t);
				break;
			case "operator": case "lambda": case "string": case "number":
				_push(temp, t);
				break;

			case "comment":
				_push(temp.trim(), t);
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
		operator: { active: false, expectAssignEnd: false, },
		comment: { active: false, multiline: false, expectingEnd: false },
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

		// operator mode
		else if (mode.operator.active) {
			// enter comment mode
			if (temp == "/" && c == "/") {
				mode.comment.active = true;
				mode.operator.active = false;
				temp = "";
			} else if (temp == "/" && c == "*") {
				mode.comment.active = mode.comment.multiline = true;
				mode.operator.active = false;
				temp = "";
			}

			// conditionals
			else if ((temp == "&" && c == "&") ||
			         (temp == "|" && c == "|") ||
			         (c == "=" && ["=", "!", ">", "<"].includes(temp))) {
				temp += c;
				pushToken("operator", c, i);
				mode.operator.active = false;
			}

			// assignments
			else if (c == "-" && temp.length == 1) {
				if (!(["+", "-", "/", "*", "^", "%"].includes(temp))) {
					warn("unexpected assignment of operator " + temp, i, true);
					pushToken("operator", c, i);
					mode.operator.active = false;
					i--;
				} else {
					temp += c;
					mode.operator.expectAssignEnd = true;
				}
			} else if (c == ">" && (mode.operator.expectAssignEnd || temp == "-")) {
				temp += c;
				pushToken("assign", c, i);
				mode.operator.active = mode.operator.expectAssignEnd = false;
			}

			// pipes
			else if (c == ">" && (temp == "|" || temp == "!")) {
				temp += c;
				pushToken("pipe", c, i);
				mode.operator.active = false;
			} else if (c == "?" && temp == "?") {
				temp += c;
				pushToken("pipe", c, i);
				mode.operator.active = false;
			}

			else {
				if (temp == "&" || temp == "=")
					warn("invalid operator " + temp, i, true);

				pushToken(temp == "|" ? "pipe" : "operator", c, i);
				mode.operator.active = false;
				i--;
			}
		}

		// comment mode
		else if (mode.comment.active) {
			if (mode.comment.multiline) { // multiline comment
				if (mode.comment.expectingEnd && c == "/") {
					mode.comment.active = mode.comment.multiline = mode.comment.expectingEnd = false;
					pushToken("comment", c, i);
				} else if (mode.comment.expectingEnd) {
					temp += "*" + c;
					mode.comment.expectingEnd = false;
				} else if (c == "*") {
					mode.comment.expectingEnd = true;
				} else {
					temp += c;
				}
			} else { // single line comment
				if (c == "\n") {
					mode.comment.active = false;
					pushToken("comment", c, i);
				} else {
					temp += c;
				}
			}
		}

		else if (c == "\"") { // enter string mode
			if (temp != "")
				pushToken("?", c, i);

			if (!(["comment", "bracketOpen", "argDelim", "exprDelim", "return", "break", "pipe", "operator"].includes(lastToken.type)))
				warn("did not expect string after " + lastToken.type, i, true);

			mode.string = true;
		} else if (/[0-9]/.test(c)) { // enter number mode
			if (temp == "") {
				temp = c;
				mode.number = true;
			} else {
				temp += c;
			}
		} else if (/[-+*^%<>|&!=?\/]/.test(c)) { // enter operation mode
			if (temp != "")
				pushToken("?", c, i);
			if (c != "!" && !(["comment", "exprDelim", "pipe", "bracketClose", "reference", "true", "false", "default", "number", "string"].includes(lastToken.type)))
				warn("unexpected operator after " + lastToken.type, i, true)

			temp = c;
			mode.operator.active = true;
		}

		else if (c == ":") { // colon
			pushToken("case", c, i);
		} else if (c == ";") { // semicolon
			pushToken("exprDelim", c, i);
		} else if (c == ".") { // period
			pushToken("period", c, i);
		}else if (c == "$") { // selector
			pushToken("selector", c, i);
		} else if (c == ",") { // comma
			if (["bracketOpen"].includes(lastToken.type))
				warn("did not expect `,` here", i, true);
			pushToken("argDelim", c, i);
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
			if (lastToken.type != "comment" && (lastToken.type == "bracketClose" || lastToken.type != "exprDelim"))
				pushToken("exprDelim", c, i)
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
