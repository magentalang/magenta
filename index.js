import * as _fs from "fs";
import * as util from "util";

const fs = {
	readFile: util.promisify(_fs.readFile),
}

fs.readFile("input.m", "utf8").then((data) => {
	console.log(data);
}).catch(console.error);
