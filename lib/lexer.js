/**
 * @param {string} _input
 */
export function lex(_input) {
	// cleanse input
	const input = _input.replace(/\r/g, "")

	// output
	let tokens = []
	let warnings = []
	let errors = []

	// modes
	const pushMode = (m) => { lastMode.push(mode); mode = m }
	const popMode = () => { mode = lastMode.pop() || 0 }
	const mode = {
		string: false,
		escape: false,
		args: false,
	}
	let lastMode = [];

	// temp values
	let temp = "";
	let tempFunc = {
		name: "",
		args: [], // token[]
	};

	for (let i = 0; i < input.length; i++) {
		const c = input.charAt(i);

		if (temp != "" && c == "(") {
			mode.args = true;
		} else if (mode.args == true && c == ")") {
			mode.args = false;
		}

		temp = temp + c;
	}

	tokens.push(temp);

	return [ tokens, warnings, errors ]
}
