export function parse(tokens) {
	// output
	let ast = []
	let errors = []
	const warn = (msg, i, fatal = false, length = 1) => errors.push({
		fatal,
		msg,
		row: tokens[i].row,
		col: tokens[i].col,
		source: tokens.slice(i, i + length).join("\n"),
	});

	return [ ast, errors ]
}
