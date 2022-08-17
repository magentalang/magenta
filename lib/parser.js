/** @param {token[]} inputTokens */
function parse(inputTokens) {
	let tokens = inputTokens;

	// output
	let ast = []
	let errors = []
	const warn = (msg, i, fatal = false, length = 1) => errors.push({
		fatal,
		msg,
		row: tokens[i].row,
		col: tokens[i].col,
		source: tokens.slice(i, i + length).map(x => x._).join(" ").replace(/\n /g, "\n"),
	});

	return [ ast, errors ]
}

module.exports = parse;
