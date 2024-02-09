import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { PyodideInterface } from "pyodide";

const { loadPyodide: loader } = require("pyodide");

let pyodide: null | PyodideInterface = null;

async function loadPyodide() {
  if (pyodide === null) {
    pyodide = await loader();
  }
  return pyodide as PyodideInterface;
}

// Function to execute Python code using Pyodide
async function runPythonCode(code: string) {
  const { runPython, setStdout } = await loadPyodide();
  let message = "";
  setStdout({batched: (msg) => {
    message += msg + "\n";
  }})
  runPython(code);

  return message;
}

loadPyodide();

export default function CodeEditor() {
  const [code, setCode] = useState("");
  const [consoleOutput, setConsoleOutput] = useState("");

  // Function to handle code execution
  async function handleRun() {
    try {
      const result = await runPythonCode(code);
      setConsoleOutput(result);
    } catch (error) {
      if (error instanceof Error) setConsoleOutput(`Error: ${error.message}`);
    }
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "10px",
        }}
      >
        <button onClick={handleRun}>Run</button>
      </div>
      <CodeMirror
        value={code}
        height="250px"
        extensions={[python()]}
        onChange={(value) => setCode(value)}
      />
      <div>
        <h3>Console Output:</h3>
        <pre>{consoleOutput}</pre>
      </div>
    </div>
  );
}
