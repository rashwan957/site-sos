let output = document.getElementById("output");
output.value = "p∧¬q";
let displayTable = document.getElementById("truth-table");
let backspaceBtn = document.getElementById("back");
let clearBtn = document.getElementById("clear");
let buildBtn = document.getElementById("build");
let charBtns = document.getElementsByClassName("char-btn");
let exerciseSelect = document.getElementById("exercise-select");

let operatorRegex = /[∧∨⇒⇔⊕¬]/gimu;
let dualOperatorRegex = /[∧∨⇒⇔⊕]/gimu;
let dualOperatorCapturingRegex = /([∧∨⇒⇔⊕])/gimu;
let variableRegex = /[pqr]/gimu;
let globalElseRegex = /[^¬∧∨⇒⇔⊕pqr\(\)]/gimu;

for (let i = 0; i < charBtns.length; i++) {
	charBtns[i].addEventListener("click", function(event) {
		output.value += event.target.textContent;
		displayTable.classList.add("hidden");
	});
}

backspaceBtn.addEventListener("click", function(event) {
	output.value = output.value.substr(0, output.value.length - 1);
	displayTable.classList.add("hidden");
});

clearBtn.addEventListener("click", function(event) {
	output.value = "";
	displayTable.classList.add("hidden");
});

buildBtn.addEventListener("click", function(event) {
	BuildTruthTable(output.value);
});

exerciseSelect.addEventListener("input", function(event) {
	output.value = event.target.value;
	displayTable.classList.add("hidden");
});

window.addEventListener(
	"keyup",
	function(event) {
		if (event.defaultPrevented) {
			return;
		}
		displayTable.classList.add("hidden");
		switch (event.key) {
			case "Enter":
				BuildTruthTable(output.value);
				output.value = "";
				break;
			case "Backspace":
			case "Undo":
				output.value = output.value.substr(0, output.value.length - 1);
				break;
			case "^":
				output.value += "∧";
				break;
			case "!":
			case "~":
				output.value += "¬";
				break;
			case "V":
			case "v":
				output.value += "∨";
				break;
			case "(":
				output.value += "(";
				break;
			case ")":
				output.value += ")";
				break;
			case "=":
				if (output.value[output.value.length - 1] == "<") {
					output.value = output.value.substr(0, output.value.length - 1);
					output.value += "⇔";
				} else {
					output.value += "=";
				}
				break;
			case ">":
				if (output.value[output.value.length - 1] == "=") {
					output.value = output.value.substr(0, output.value.length - 1);
					output.value += "⇒";
				}
				break;
			case "<":
				output.value += "<";
				break;
			case "X":
			case "x":
				output.value += "⊕";
				break;
			case "p":
				output.value += "p";
				break;
			case "q":
				output.value += "q";
				break;
			case "r":
				output.value += "r";
				break;
			default:
				return;
		}
		event.preventDefault();
	},
	true
);

function BuildTruthTable(expression) {
	if (ValidateExpression(expression)) {
		console.log(`Building truth table for expression "${expression}"...`);
		let state = {
			expression: expression,
			statements: [],
			values: [],
			output: []
		};
		ExtractVariables(state);
		CompileOutputs(state);
		EvaluateStatements(state);
		DisplayTruthTable(state);
	}
}

function CheckIfEqualParentheses(expression) {
	if (expression.includes("(") || expression.includes(")")) {
		if (
			expression.match(/\(/gm) &&
			expression.match(/\)/gm) &&
			expression.match(/\(/gm).length == expression.match(/\)/gm).length
		) {
			return true;
		} else {
			return false;
		}
	} else {
		return true;
	}
}

function CheckIfProperNot(expression) {
	if (expression.includes("¬")) {
		if (
			expression.indexOf("¬") + 1 < expression.length &&
			(expression[expression.indexOf("¬") + 1].match(variableRegex) ||
				expression[expression.indexOf("¬") + 1] == "(")
		) {
			return true;
		} else {
			return false;
		}
	} else {
		return true;
	}
}

function CheckIfProperOperators(expression) {
	let tempArray;
	let operatorRegexObject = RegExp("[∧∨⇒⇔⊕]", "gmiu");
	let varParenRegexObject = RegExp("[¬pqr()]", "gmiu");
	let results = [];
	let improper = false;
	while ((tempArray = operatorRegexObject.exec(expression)) !== null) {
		results.push({
			match: tempArray[0],
			index: operatorRegexObject.lastIndex - 1
		});
	}
	for (let i = 0; i < results.length; i++) {
		if (results[i].index + 1 >= expression.length) {
			improper = true;
		} else {
			let prevChar = expression[results[i].index - 1];
			let nextChar = expression[results[i].index + 1];
			if (
				!(varParenRegexObject.test(prevChar) && !varParenRegexObject.test(nextChar))
			) {
				improper = true;
			}
		}
	}
	return !improper;
}

function CheckIfVarsTooClose(expression) {
	let tempArray;
	let variableRegexObject = RegExp("[pqr]", "gmiu");
	let results = [];
	let tooClose = false;
	while ((tempArray = variableRegexObject.exec(expression)) !== null) {
		results.push({
			match: tempArray[0],
			index: variableRegexObject.lastIndex - 1
		});
	}
	for (let i = 1; i < results.length; i++) {
		if (results[i].index - 1 == results[i - 1].index) {
			tooClose = true;
		}
	}
	return !tooClose;
}

function CheckIfOperatorsTooClose(expression) {
	let tempArray;
	let operatorRegexObject = RegExp("[∧∨⇒⇔⊕]", "gmiu");
	let results = [];
	let tooClose = false;
	while ((tempArray = operatorRegexObject.exec(expression)) !== null) {
		results.push({
			match: tempArray[0],
			index: operatorRegexObject.lastIndex - 1
		});
	}
	for (let i = 1; i < results.length; i++) {
		if (results[i].index - 1 == results[i - 1].index) {
			tooClose = true;
		}
	}
	return !tooClose;
}

function CheckIfParenTooClose(expression) {
	let tempArray;
	let variableRegexObject = RegExp("[()]", "gmiu");
	let results = [];
	let tooClose = false;
	while ((tempArray = variableRegexObject.exec(expression)) !== null) {
		results.push({
			match: tempArray[0],
			index: variableRegexObject.lastIndex - 1
		});
	}
	for (let i = 1; i < results.length; i++) {
		if (
			results[i].match != results[i - 1].match &&
			results[i].index - 1 == results[i - 1].index
		) {
			tooClose = true;
		}
	}
	return !tooClose;
}

function CheckIfImproperCharactersExist(expression) {
	if (expression.match(globalElseRegex)) {
		return false;
	} else {
		return true;
	}
}

function ValidateExpression(expression) {
	console.log(`Validating expression "${expression}"...`);
	if (CheckIfEqualParentheses(expression)) {
		if (expression.match(variableRegex)) {
			if (expression.match(operatorRegex)) {
				if (CheckIfProperNot(expression)) {
					if (CheckIfProperOperators(expression)) {
						if (CheckIfVarsTooClose(expression)) {
							if (CheckIfOperatorsTooClose(expression)) {
								if (CheckIfParenTooClose(expression)) {
									if (CheckIfImproperCharactersExist(expression)) {
										console.log(`Expression "${expression}" is valid.`);
										return true;
									} else {
										alert("Non-supported characters detected in expression.");
										return false;
									}
								} else {
									alert("There is a set of parentheses with nothing in it.");
									return false;
								}
							} else {
								alert("Consecutive operators are not allowed.");
								return false;
							}
						} else {
							alert("Consecutive variables are not allowed.");
							return false;
						}
					} else {
						alert(
							"An operator exists that does not have proper values on both sides."
						);
						return false;
					}
				} else {
					alert("Improper use of the not (¬) operator.");
					return false;
				}
			} else {
				alert("No logical operators in expression.");
				return false;
			}
		} else {
			alert("No variables in expression.");
			return false;
		}
	} else {
		alert("Mismatch in number of opening and closing parentheses.");
		return false;
	}
}

function ExtractVariables(state) {
	let pExists = state.expression.includes("p");
	let qExists = state.expression.includes("q");
	let rExists = state.expression.includes("r");
	console.log(`Extracting variables from "${state.expression}"...`);
	if (pExists && qExists && rExists) {
		state.statements.push("p", "q", "r");
		state.values.push(["T", "T", "T", "T", "F", "F", "F", "F"]);
		state.values.push(["T", "T", "F", "F", "T", "T", "F", "F"]);
		state.values.push(["T", "F", "T", "F", "T", "F", "T", "F"]);
		console.log(`Extracted variables from "${state.expression}": p, q, r`);
	} else if (pExists && !qExists && !rExists) {
		state.statements.push("p");
		state.values.push(["T", "F"]);
		console.log(`Extracted variables from "${state.expression}": p`);
	} else if (!pExists && qExists && !rExists) {
		state.statements.push("q");
		state.values.push(["T", "F"]);
		console.log(`Extracted variables from "${state.expression}": q`);
	} else if (!pExists && !qExists && rExists) {
		state.statements.push("r");
		state.values.push(["T", "F"]);
		console.log(`Extracted variables from "${state.expression}": r`);
	} else if (pExists && qExists && !rExists) {
		state.statements.push("p", "q");
		state.values.push(["T", "T", "F", "F"]);
		state.values.push(["T", "F", "T", "F"]);
		console.log(`Extracted variables from "${state.expression}": p, q`);
	} else if (pExists && !qExists && rExists) {
		state.statements.push("p", "r");
		state.values.push(["T", "T", "F", "F"]);
		state.values.push(["T", "F", "T", "F"]);
		console.log(`Extracted variables from "${state.expression}": q, r`);
	} else if (!pExists && qExists && rExists) {
		state.statements.push("q", "r");
		state.values.push(["T", "T", "F", "F"]);
		state.values.push(["T", "F", "T", "F"]);
		console.log(`Extracted variables from "${state.expression}": p, r`);
	}
}

function IsNestedParentheses(expression) {
	let isNested = false;
	for (let i = expression.indexOf("(") + 1; i < expression.length; i++) {
		if (expression[i] == "(") {
			isNested = true;
			break;
		} else if (expression[i] == ")") {
			break;
		}
	}
	return isNested;
}

function StripNestedParentheses(expression, state) {
	console.log(`Stripping nested parentheses from "${expression}"...`);
	let results = expression.split(/\(([\S]*)\)/gim);
	results.forEach(function(exp) {
		if (exp != "") {
			console.log(`Stripped parentheses from "${expression}", found "${exp}".`);
			if (exp.includes("(")) {
				console.log(
					`Expression "${exp}" still contains parentheses. Stripping again...`
				);
				if (IsNestedParentheses(state.expression)) {
					StripNestedParentheses(exp, state);
				} else {
					StripMultipleParentheses(exp, state);
				}
			} else {
				console.log(`Expression "${exp}" has no parentheses. Pushing to output...`);
				state.output.push(exp);
			}
		}
	});
}

function StripMultipleParentheses(expression, state) {
	console.log(`Stripping multiple parentheses from "${expression}"...`);
	let results = expression.split(/\(([\S]*?)\)/gim);
	results.forEach(function(exp) {
		if (exp != "") {
			console.log(`Stripped parentheses from "${expression}", found "${exp}".`);
			if (exp.includes("(")) {
				console.log(
					`Expression "${exp}" still contains parentheses. Stripping again...`
				);
				if (IsNestedParentheses(state.expression)) {
					StripNestedParentheses(exp, state);
				} else {
					StripMultipleParentheses(exp, state);
				}
			} else {
				console.log(`Expression "${exp}" has no parentheses. Pushing to output...`);
				state.output.push(exp);
			}
		}
	});
}

function CompileOutputs(state) {
	if (state.expression.includes("(")) {
		if (IsNestedParentheses(state.expression)) {
			StripNestedParentheses(state.expression, state);
		} else {
			StripMultipleParentheses(state.expression, state);
		}
	} else {
		state.output.push(state.expression);
	}
	state.output.forEach(function(statement) {
		ConvertToStatements(statement, state, state.output);
	});
	ValidateStatements(state);
	state.statements.sort(function(a, b) {
		return a.length - b.length;
	});
}

function ConvertToStatements(expression, state, prevMatches) {
	console.log(`Converting expression "${expression}" to a statement...`);
	let matchedOperators = expression.match(dualOperatorRegex);
	if (expression.length > 1) {
		if (matchedOperators) {
			console.log(`Expression "${expression}" needs to be split...`);
			let splitExpression = expression.split(dualOperatorCapturingRegex);
			splitExpression.forEach(function(exp) {
				ConvertToStatements(exp, state, splitExpression);
			});
		} else {
			state.statements.push(expression);
			console.log(
				`Expression "${expression}" is already a valid statement, pushed to statements.`
			);
		}
		if (!state.statements.includes(expression)) {
			console.log(
				`Pushing initial expression "${expression}" to statements after splitting...`
			);
			state.statements.push(expression);
		} else {
			console.log(`Expression "${expression}" already exists in statements.`);
		}
	} else {
		if (dualOperatorRegex.test(expression)) {
			console.log(
				`Expression "${expression}" is just an operator, constructing a statement...`
			);
			let operatorIndex = prevMatches.indexOf(expression);
			let statementA = "";
			if (prevMatches[operatorIndex - 1].length > 2) {
				statementA = "(" + prevMatches[operatorIndex - 1] + ")";
			} else {
				statementA = prevMatches[operatorIndex - 1];
			}
			let statementB = "";
			if (prevMatches[operatorIndex + 1].length > 2) {
				statementB = "(" + prevMatches[operatorIndex + 1] + ")";
			} else {
				statementB = prevMatches[operatorIndex + 1];
			}
			let newStatement =
				statementA +
				expression +
				statementB;
			console.log(
				`From expression "${expression}" was constructed statement "${newStatement}".`
			);
			state.statements.push(newStatement);
		} else {
			console.log(
				`Expression "${expression}" is too short and will be thrown out.`
			);
		}
	}
}

function ValidateStatements(state) {
	for (let i = 0; i < state.statements.length; i++) {
		console.log(`Validating statement "${state.statements[i]}"...`);
		if (state.statements[i].match(dualOperatorRegex)) {
			let tempArray, results = [];
			while ((tempArray = dualOperatorRegex.exec(state.statements[i])) !== null) {
				results.push({
					match: tempArray[0],
					index: dualOperatorRegex.lastIndex - 1
				});
			}
			if (results.length == 0) {
				console.log(`Statement "${state.statements[i]}" contains an operator with both ends, skipping...`);
			}
			for (let x = 0; x < results.length; x++) {
				if (results[x].index == state.statements[i].length - 1 || results[x].index == 0) {
					console.log(`Statement "${state.statements[i]}" contains an operator without one end, fixing...`);
					let originStatement = state.statements[i];
					if (results[x].index == state.statements[i].length - 1) {
						let nextStatementIndex = state.output.indexOf(state.statements[i]) + 1;
						state.statements[i] = state.statements[i] + "(" + state.output[nextStatementIndex] + ")";
					} else if (results[x].index == 0) {
						let prevStatementIndex = state.output.indexOf(state.statements[i]) - 1;
						state.statements[i] = "(" + state.output[prevStatementIndex] + ")" + state.statements[i];
					}
					console.log(`Statement "${originStatement}" became "${state.statements[i]}".`);
				}
			}
		} else {
			console.log(`Statement "${state.statements[i]}" does not contain an operator, skipping...`);
		}
	}
}

function EvaluateStatements(state) {
	let startIndex = state.values.length;
	for (let i = startIndex; i < state.statements.length; i++) {
		let values = [];
		console.log(`Evaluating statement "${state.statements[i]}"...`);
		for (let y = 0; y < state.values[0].length; y++) {
			let parsedStatement = state.statements[i];
			for (let x = i - 1; x >= 0; x--) {
				if (parsedStatement.includes(state.statements[x])) {
					console.log(`Statement "${parsedStatement}" includes previous substatement "${state.statements[x]}".`);
					console.log(`In expression "${parsedStatement}", replacing "${state.statements[x]}" with "${state.values[x][y]}"...`);
					parsedStatement = parsedStatement.replace(state.statements[x],	state.values[x][y]);
				}
			}
			parsedStatement = parsedStatement.replace(/¬/g, "!");
			parsedStatement = parsedStatement.replace(/∧/g, "&&");
			parsedStatement = parsedStatement.replace(/∨/g, "||");
			parsedStatement = parsedStatement.replace(/⊕/g, "!=");
			parsedStatement = parsedStatement.replace(/⇔/g, "===");
			parsedStatement = parsedStatement.replace(/T/g, "true");
			parsedStatement = parsedStatement.replace(/F/g, "false");
			if (parsedStatement.includes("⇒")) {
				let splitter = /([\S]*)⇒([\S]*)/gmiu;
				let splitStatement = splitter.exec(parsedStatement);
				parsedStatement = `if (${splitStatement[1]}) {${splitStatement[2]}} else {true}`;
			}
			console.log(`Statement "${state.statements[i]}" became "${parsedStatement}" after replacement.`);
			let evalResult = eval(parsedStatement);
			console.log(`"${parsedStatement}" became "${evalResult}" after eval, pushing to results...`);
			values.push(evalResult ? "T" : "F");
		}
		console.log(`Done evaluating statement "${state.statements[i]}", pushing results to values...`
		);
		state.values.push(values);
	}
}

function DisplayTruthTable(state) {
	console.log("Displaying truth table...");
	displayTable.classList.remove("hidden");
	displayTable.innerHTML = "";
	let tableHead = document.createElement("thead");
	let tableHeadRow = document.createElement("tr");
	for (let i = 0; i < state.statements.length; i++) {
		let columnHead = document.createElement("th");
		columnHead.innerHTML = state.statements[i];
		tableHeadRow.appendChild(columnHead);
	}
	tableHead.appendChild(tableHeadRow);
	displayTable.appendChild(tableHead);
	let tableBody = document.createElement("tbody");
	for (let x = 0; x < state.values[0].length; x++) {
		let tableRow = document.createElement("tr");
		for (let i = 0; i < state.values.length; i++) {
			let cell = document.createElement("td");
			cell.textContent = state.values[i][x];
			cell.classList.add(state.values[i][x]);
			tableRow.appendChild(cell);
		}
		tableBody.appendChild(tableRow);
	}
	displayTable.appendChild(tableBody);
	console.log("Built and displayed truth table.");
}
