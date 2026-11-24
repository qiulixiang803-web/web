const screen = document.querySelector("#screen");
const expr = document.querySelector("#expr");
const calculator = document.querySelector(".calculator");

const state = {
  current: "0",
  stored: null,
  operator: null,
  replace: false,
};

const operatorLabel = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
};

function render() {
  screen.textContent = state.current;
  expr.textContent = state.operator
    ? `${state.stored} ${operatorLabel[state.operator]}`
    : "";
}

function isError() {
  return state.current === "错误" || state.current === "不能除以 0";
}

function inputDigit(digit) {
  if (state.replace || state.current === "0" || isError()) {
    state.current = digit;
    state.replace = false;
    render();
    return;
  }

  if (state.current.replace("-", "").replace(".", "").length >= 12) return;
  state.current += digit;
  render();
}

function inputDecimal() {
  if (state.replace || isError()) {
    state.current = "0.";
    state.replace = false;
    render();
    return;
  }

  if (!state.current.includes(".")) state.current += ".";
  render();
}

function chooseOperator(operator) {
  if (isError()) return;

  if (state.operator && !state.replace) {
    evaluate();
    if (isError()) return;
  }

  state.stored = state.current;
  state.operator = operator;
  state.replace = true;
  render();
}

function evaluate() {
  if (!state.operator || state.stored === null || isError()) return;

  const left = Number(state.stored);
  const right = Number(state.current);
  let result;

  if (state.operator === "+") result = left + right;
  else if (state.operator === "-") result = left - right;
  else if (state.operator === "*") result = left * right;
  else if (state.operator === "/") {
    if (right === 0) {
      state.current = "不能除以 0";
      state.stored = null;
      state.operator = null;
      state.replace = true;
      render();
      return;
    }
    result = left / right;
  }

  state.current = formatResult(result);
  state.stored = null;
  state.operator = null;
  state.replace = true;
  render();
}

function formatResult(value) {
  if (!Number.isFinite(value)) return "错误";

  const rounded = Math.round(value * 1e10) / 1e10;
  let text = String(rounded);
  if (text.replace("-", "").length > 12) text = rounded.toExponential(6);
  return text;
}

function clearAll() {
  state.current = "0";
  state.stored = null;
  state.operator = null;
  state.replace = false;
  render();
}

function backspace() {
  if (state.replace || isError()) return;

  if (state.current.length <= 1 || (state.current.length === 2 && state.current.startsWith("-"))) {
    state.current = "0";
  } else {
    state.current = state.current.slice(0, -1);
  }
  render();
}

function percent() {
  if (isError()) return;
  state.current = formatResult(Number(state.current) / 100);
  state.replace = true;
  render();
}

function toggleSign() {
  if (state.current === "0" || isError()) return;
  state.current = state.current.startsWith("-") ? state.current.slice(1) : `-${state.current}`;
  render();
}

calculator.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const { action, value } = button.dataset;
  if (action === "digit") inputDigit(value);
  else if (action === "decimal") inputDecimal();
  else if (action === "operator") chooseOperator(value);
  else if (action === "equals") evaluate();
  else if (action === "clear") clearAll();
  else if (action === "percent") percent();
  else if (action === "sign") toggleSign();
});

document.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  const key = event.key;
  if (/^[0-9]$/.test(key)) inputDigit(key);
  else if (key === ".") inputDecimal();
  else if (key === "+" || key === "-" || key === "*" || key === "/") chooseOperator(key);
  else if (key === "Enter" || key === "=") {
    event.preventDefault();
    evaluate();
  } else if (key === "Escape") clearAll();
  else if (key === "Backspace") {
    event.preventDefault();
    backspace();
  } else if (key === "%") percent();
});

render();
