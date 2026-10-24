"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Terminal,
  Play,
  Square,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  Activity,
  Code2,
  Download,
  Cpu,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import CyberGrid from "@/components/ui/CyberGrid";
import CyberPanel from "@/components/ui/CyberPanel";
import CyberBadge from "@/components/ui/CyberBadge";
import UniversalHeader from "@/components/ui/UniversalHeader";

interface CodeTemplate {
  id: string;
  label: string;
  description: string;
  code: string;
}

const CODE_TEMPLATES: CodeTemplate[] = [
  {
    id: "scratchpad",
    label: "NEURAL_PERCEPTRON",
    description: "Single-layer perceptron forward pass & sigmoid activation.",
    code: `import math

def sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-x))

def forward_pass(inputs: list[float], weights: list[float], bias: float) -> float:
    z = sum(x * w for x, w in zip(inputs, weights)) + bias
    return sigmoid(z)

inputs = [0.8, -0.4, 1.2]
weights = [0.5, -0.9, 0.3]
bias = -0.1

output = forward_pass(inputs, weights, bias)
print(f"INPUT_VECTOR  : {inputs}")
print(f"WEIGHT_MATRIX : {weights}")
print(f"ACTIVATION    : {output:.6f}")
print(f"SIGNAL_LOCKED : {output > 0.5}")
`,
  },
  {
    id: "numpy_gd",
    label: "NUMPY_GRADIENT_DESCENT",
    description: "Linear regression optimization loop using NumPy tensors.",
    code: `import numpy as np

# Generate synthetic signal: y = 3.5 * x + 1.2 + noise
np.random.seed(42)
X = np.linspace(0, 2, 50)
y = 3.5 * X + 1.2 + np.random.normal(0, 0.15, size=X.shape)

# Initialize parameters
w, b = 0.0, 0.0
lr = 0.1
epochs = 80

for epoch in range(1, epochs + 1):
    y_pred = w * X + b
    error = y_pred - y
    loss = np.mean(error ** 2)
    
    dw = (2 / len(X)) * np.dot(error, X)
    db = (2 / len(X)) * np.sum(error)
    
    w -= lr * dw
    b -= lr * db
    
    if epoch % 20 == 0 or epoch == 1:
        print(f"EPOCH [{epoch:02d}/{epochs}] // MSE_LOSS: {loss:.5f} // w={w:.3f}, b={b:.3f}")

print(f"\\nCONVERGED_PARAMS -> w={w:.4f} (target 3.5), b={b:.4f} (target 1.2)")
`,
  },
  {
    id: "matplotlib_signal",
    label: "SIGNAL_SPECTRUM_PLOT",
    description: "Render a cyberpunk waveform & attention heatmap via Matplotlib.",
    code: `import numpy as np
import matplotlib.pyplot as plt

plt.style.use('dark_background')
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9, 3.6), facecolor='#050505')

# 1. Damped harmonic carrier signal
t = np.linspace(0, 4 * np.pi, 300)
carrier = np.sin(3 * t) * np.exp(-0.15 * t)
envelope = np.exp(-0.15 * t)

ax1.set_facecolor('#050505')
ax1.plot(t, carrier, color='#49aeae', linewidth=1.8, label='SIGNAL')
ax1.plot(t, envelope, color='#ffffff', linestyle='--', alpha=0.4, label='ENVELOPE')
ax1.plot(t, -envelope, color='#ffffff', linestyle='--', alpha=0.4)
ax1.set_title('WAVEFORM_TELEMETRY', fontfamily='monospace', fontsize=10)
ax1.grid(color='#ffffff', alpha=0.08)
ax1.legend(loc='upper right', fontsize=8)

# 2. Self-Attention score matrix
tokens = 8
scores = np.random.randn(tokens, tokens)
attn = np.exp(scores) / np.sum(np.exp(scores), axis=-1, keepdims=True)

ax2.set_facecolor('#050505')
im = ax2.imshow(attn, cmap='viridis', aspect='auto')
ax2.set_title('ATTENTION_WEIGHTS (8x8)', fontfamily='monospace', fontsize=10)
fig.colorbar(im, ax=ax2, fraction=0.046, pad=0.04)

plt.tight_layout()
plt.show()
print("PLOT_RENDERED: 2 subplots generated.")
`,
  },
  {
    id: "svd_pca",
    label: "SVD_EIGEN_DECOMP",
    description: "Singular Value Decomposition & explained variance via NumPy.",
    code: `import numpy as np

np.random.seed(7)
# Create a 100x5 feature matrix with correlated dimensions
base = np.random.randn(100, 2)
projection = np.array([[1.5, 0.8, -0.5, 2.0, -1.2],
                       [-0.7, 1.2, 1.8, -0.4, 0.9]])
X = base @ projection + np.random.normal(0, 0.1, (100, 5))

# Center data & compute SVD
X_centered = X - np.mean(X, axis=0)
U, S, Vt = np.linalg.svd(X_centered, full_matrices=False)

variance_ratio = (S ** 2) / np.sum(S ** 2)

print("SINGULAR_VALUES :", np.round(S, 3))
for idx, ratio in enumerate(variance_ratio):
    bar = "█" * int(ratio * 30)
    print(f"PC_{idx + 1} [{ratio * 100:5.2f}%] : {bar}")
`,
  },
];

const STORAGE_KEY = "sequoia_python_sandbox_code_v1";

const PYODIDE_WORKER_SOURCE = `
let pyodideReadyPromise = null;
let pendingInputResolve = null;

self.__sequoia_request_input = (promptText) => {
  self.postMessage({
    type: 'input_request',
    prompt: promptText ? String(promptText) : '',
  });
  return new Promise((resolve) => {
    pendingInputResolve = resolve;
  });
};

async function ensurePyodide() {
  if (!pyodideReadyPromise) {
    self.postMessage({ type: 'log', text: '> INITIALIZING PYODIDE WASM ENGINE (v0.27.3)...' });
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.3/full/pyodide.js');
    pyodideReadyPromise = loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.3/full/',
      stdout: (line) => self.postMessage({ type: 'stdout', text: line }),
      stderr: (line) => self.postMessage({ type: 'stderr', text: line }),
    });
    const pyodide = await pyodideReadyPromise;
    await pyodide.runPythonAsync(\`
import ast, builtins, sys
from js import __sequoia_request_input

async def __sequoia_input__(prompt=""):
    sys.stdout.flush()
    sys.stderr.flush()
    val = await __sequoia_request_input(str(prompt) if prompt is not None else "")
    return str(val)

builtins.__sequoia_input__ = __sequoia_input__

def __sequoia_prepare_code__(src: str) -> str:
    try:
        tree = ast.parse(src)
    except SyntaxError:
        return src

    for node in tree.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name == "input":
            return src

    has_input = False

    class InputCallTransformer(ast.NodeTransformer):
        def visit_Call(self, node):
            nonlocal has_input
            self.generic_visit(node)
            if isinstance(node.func, ast.Name) and node.func.id == "input":
                has_input = True
                new_call = ast.Call(
                    func=ast.Name(id="__sequoia_input__", ctx=ast.Load()),
                    args=node.args,
                    keywords=node.keywords,
                )
                return ast.Await(value=new_call)
            return node

    tree = InputCallTransformer().visit(tree)
    if not has_input:
        return src

    def has_direct_await(node):
        for child in ast.iter_child_nodes(node):
            if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.Lambda)):
                continue
            if isinstance(child, ast.Await) or has_direct_await(child):
                return True
        return False

    async_func_names = set()
    changed = True
    while changed:
        changed = False

        class AsyncPropagator(ast.NodeTransformer):
            def visit_FunctionDef(self, node):
                nonlocal changed
                self.generic_visit(node)
                if has_direct_await(node):
                    async_func_names.add(node.name)
                    changed = True
                    return ast.AsyncFunctionDef(
                        name=node.name,
                        args=node.args,
                        body=node.body,
                        decorator_list=node.decorator_list,
                        returns=node.returns,
                        type_comment=getattr(node, "type_comment", None),
                        type_params=getattr(node, "type_params", []),
                    )
                return node

            def visit_Await(self, node):
                if (
                    isinstance(node.value, ast.Call)
                    and isinstance(node.value.func, ast.Name)
                    and node.value.func.id in async_func_names
                ):
                    node.value.args = [self.visit(a) for a in node.value.args]
                    node.value.keywords = [self.visit(k) for k in node.value.keywords]
                    return node
                node.value = self.visit(node.value)
                return node

            def visit_Call(self, node):
                nonlocal changed
                self.generic_visit(node)
                if isinstance(node.func, ast.Name) and node.func.id in async_func_names:
                    changed = True
                    return ast.Await(value=node)
                return node

        tree = AsyncPropagator().visit(tree)

    ast.fix_missing_locations(tree)
    return ast.unparse(tree)

builtins.__sequoia_prepare_code__ = __sequoia_prepare_code__
\`);
    self.postMessage({ type: 'log', text: '> PYTHON ' + pyodide.version + ' RUNTIME ESTABLISHED.' });
  }
  return pyodideReadyPromise;
}

self.onmessage = async (event) => {
  const { type, code } = event.data;
  if (type === 'input_response') {
    if (pendingInputResolve) {
      const resolve = pendingInputResolve;
      pendingInputResolve = null;
      resolve(String(event.data.value ?? ''));
    }
    return;
  }

  if (type === 'init') {
    try {
      await ensurePyodide();
      self.postMessage({ type: 'ready' });
    } catch (err) {
      self.postMessage({ type: 'error', text: String(err && err.message ? err.message : err) });
    }
    return;
  }

  if (type === 'run') {
    const start = performance.now();
    try {
      const pyodide = await ensurePyodide();
      self.postMessage({ type: 'status', status: 'RESOLVING_IMPORTS' });

      // Detect and load required packages automatically
      await pyodide.loadPackagesFromImports(code, {
        messageCallback: (msg) => self.postMessage({ type: 'log', text: '> ' + msg.toUpperCase() }),
      });

      const loadedPackages = Object.keys(pyodide.loadedPackages || {});
      self.postMessage({ type: 'packages', packages: loadedPackages });

      // If matplotlib is loaded, configure non-interactive Agg backend
      if (loadedPackages.includes('matplotlib')) {
        await pyodide.runPythonAsync(\`
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
plt.close('all')
plt.show = lambda *args, **kwargs: None
\`);
      }

      self.postMessage({ type: 'status', status: 'EXECUTING' });
      const prepareFn = pyodide.globals.get('__sequoia_prepare_code__');
      const transformedCode = prepareFn ? prepareFn(code) : code;
      if (prepareFn && typeof prepareFn.destroy === 'function') {
        prepareFn.destroy();
      }
      const result = await pyodide.runPythonAsync(transformedCode);

      // Extract any generated matplotlib figures as base64 PNGs
      let plots = [];
      if (loadedPackages.includes('matplotlib')) {
        const extracted = await pyodide.runPythonAsync(\`
import io, base64
import matplotlib.pyplot as plt
_sequoia_plots = []
for _fig_num in plt.get_fignums():
    _buf = io.BytesIO()
    plt.figure(_fig_num).savefig(_buf, format='png', bbox_inches='tight', dpi=130)
    _buf.seek(0)
    _sequoia_plots.append(base64.b64encode(_buf.read()).decode('utf-8'))
plt.close('all')
_sequoia_plots
\`);
        if (extracted && typeof extracted.toJs === 'function') {
          plots = Array.from(extracted.toJs());
          extracted.destroy();
        }
      }

      let reprResult = null;
      if (result !== undefined && result !== null) {
        reprResult = String(result);
        if (typeof result === 'object' && typeof result.destroy === 'function') {
          result.destroy();
        }
      }

      const elapsed = Math.round(performance.now() - start);
      self.postMessage({
        type: 'done',
        execTimeMs: elapsed,
        result: reprResult,
        plots,
      });
    } catch (err) {
      const elapsed = Math.round(performance.now() - start);
      self.postMessage({
        type: 'exec_error',
        execTimeMs: elapsed,
        text: String(err && err.message ? err.message : err),
      });
    }
  }
};
`;

interface OutputEntry {
  kind: "stdout" | "stderr" | "result" | "system";
  text: string;
}

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
  };
}

export default function SandboxClient() {
  const router = useRouter();

  const [activeTemplateId, setActiveTemplateId] = useState<string>("scratchpad");
  const [code, setCode] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) return saved;
    }
    return CODE_TEMPLATES[0].code;
  });

  const [runtimeStatus, setRuntimeStatus] = useState<
    | "STANDBY"
    | "INITIALIZING"
    | "RESOLVING_IMPORTS"
    | "EXECUTING"
    | "AWAITING_INPUT"
    | "READY"
    | "ERROR"
  >("STANDBY");
  const [logs, setLogs] = useState<string[]>([
    "> PYTHON SANDBOX INITIALIZED.",
    "> ENGINE: PYODIDE WASM (ON-DEMAND).",
    "> PRESS [ EXECUTE ] OR CTRL+ENTER TO RUN.",
  ]);
  const [outputs, setOutputs] = useState<OutputEntry[]>([]);
  const [plots, setPlots] = useState<string[]>([]);
  const [execTimeMs, setExecTimeMs] = useState<number | null>(null);
  const [loadedPackages, setLoadedPackages] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<"output" | "templates" | "logs">("output");
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");

  const workerRef = useRef<Worker | null>(null);
  const workerUrlRef = useRef<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const highlightWrapperRef = useRef<HTMLDivElement | null>(null);
  const lineNumbersRef = useRef<HTMLDivElement | null>(null);
  const logsBottomRef = useRef<HTMLDivElement | null>(null);
  const outputBottomRef = useRef<HTMLDivElement | null>(null);

  // Persist user code changes
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore storage quota errors */
    }
  }, [code]);

  // Auto-scroll logs and output
  useEffect(() => {
    logsBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    outputBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [outputs, plots]);

  const destroyWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (workerUrlRef.current) {
      URL.revokeObjectURL(workerUrlRef.current);
      workerUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      destroyWorker();
    };
  }, [destroyWorker]);

  const getOrCreateWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;

    const blob = new Blob([PYODIDE_WORKER_SOURCE], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    workerUrlRef.current = url;
    const worker = new Worker(url);

    worker.onmessage = (e) => {
      const data = e.data;
      switch (data.type) {
        case "log":
          setLogs((prev) => [...prev, data.text]);
          break;
        case "status":
          setRuntimeStatus(data.status);
          break;
        case "packages":
          setLoadedPackages(data.packages || []);
          break;
        case "stdout":
          setOutputs((prev) => [...prev, { kind: "stdout", text: data.text }]);
          break;
        case "stderr":
          setOutputs((prev) => [...prev, { kind: "stderr", text: data.text }]);
          break;
        case "input_request":
          setInputPrompt(data.prompt || "");
          setInputValue("");
          setRuntimeStatus("AWAITING_INPUT");
          setMobileTab("output");
          setLogs((prev) => [...prev, "> AWAITING OPERATOR STDIN INPUT..."]);
          break;
        case "ready":
          setRuntimeStatus("READY");
          break;
        case "done":
          setExecTimeMs(data.execTimeMs);
          if (data.result !== null && data.result !== undefined) {
            setOutputs((prev) => [...prev, { kind: "result", text: `Out: ${data.result}` }]);
          }
          if (data.plots && data.plots.length > 0) {
            setPlots(data.plots);
          }
          setRuntimeStatus("READY");
          setLogs((prev) => [...prev, `> EXECUTION COMPLETE [${data.execTimeMs}ms].`]);
          break;
        case "exec_error":
          setExecTimeMs(data.execTimeMs);
          setOutputs((prev) => [...prev, { kind: "stderr", text: data.text }]);
          setRuntimeStatus("ERROR");
          setLogs((prev) => [...prev, `> EXECUTION FAILED [${data.execTimeMs}ms].`]);
          break;
        case "error":
          setRuntimeStatus("ERROR");
          setLogs((prev) => [...prev, `> CRITICAL WASM ERROR: ${data.text}`]);
          break;
      }
    };

    workerRef.current = worker;
    return worker;
  }, []);

  const isRunning =
    runtimeStatus === "INITIALIZING" ||
    runtimeStatus === "RESOLVING_IMPORTS" ||
    runtimeStatus === "EXECUTING" ||
    runtimeStatus === "AWAITING_INPUT";

  const handleInputSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (runtimeStatus !== "AWAITING_INPUT" || !workerRef.current) return;
      const submitted = inputValue;
      setOutputs((prev) => [
        ...prev,
        { kind: "stdout", text: `${inputPrompt}${submitted}` },
      ]);
      setInputPrompt("");
      setInputValue("");
      setRuntimeStatus("EXECUTING");
      workerRef.current.postMessage({ type: "input_response", value: submitted });
    },
    [inputPrompt, inputValue, runtimeStatus]
  );

  const handleRun = useCallback(() => {
    if (isRunning) return;
    setOutputs([]);
    setPlots([]);
    setInputPrompt("");
    setInputValue("");
    setRuntimeStatus("INITIALIZING");
    setLogs((prev) => [...prev, "> DISPATCHING EXECUTION PAYLOAD..."]);
    setMobileTab("output");

    const worker = getOrCreateWorker();
    worker.postMessage({ type: "run", code });
  }, [code, getOrCreateWorker, isRunning]);

  const handleTerminate = useCallback(() => {
    destroyWorker();
    setRuntimeStatus("STANDBY");
    setInputPrompt("");
    setInputValue("");
    setLoadedPackages([]);
    setLogs((prev) => [...prev, "> WORKER TERMINATED BY OPERATOR. MEMORY FREED."]);
    setOutputs((prev) => [...prev, { kind: "system", text: "[PROCESS_TERMINATED_BY_USER]" }]);
  }, [destroyWorker]);

  const handleSelectTemplate = (tpl: CodeTemplate) => {
    setActiveTemplateId(tpl.id);
    setCode(tpl.code);
    setLogs((prev) => [...prev, `> LOADED TEMPLATE: ${tpl.label}`]);
  };

  const handleResetCode = () => {
    const current = CODE_TEMPLATES.find((t) => t.id === activeTemplateId) || CODE_TEMPLATES[0];
    setCode(current.code);
    setLogs((prev) => [...prev, `> BUFFER RESET TO ${current.label}.`]);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    if (highlightWrapperRef.current) {
      highlightWrapperRef.current.scrollTop = target.scrollTop;
      highlightWrapperRef.current.scrollLeft = target.scrollLeft;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = target.scrollTop;
    }
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRun();
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = code.substring(0, start) + "    " + code.substring(end);
      setCode(next);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      });
    }
  };

  const lineCount = code.split("\n").length;
  const memUsed =
    typeof performance !== "undefined" && (performance as PerformanceWithMemory).memory
      ? String(Math.round((performance as PerformanceWithMemory).memory!.usedJSHeapSize / 1048576))
      : "N/A";

  const runtimeBadge = (
    <div className="flex flex-col items-center">
      <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase mb-0.5">
        RUNTIME_ENV
      </span>
      <span className="text-xs font-mono text-white tracking-widest uppercase bg-white/10 px-2 py-0.5 border border-white/10">
        PYTHON 3.12 // WASM
      </span>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-space-bg text-text-main font-sans overflow-hidden flex flex-col relative select-none">
      <CyberGrid />

      <UniversalHeader
        onBack={() => router.push("/dashboard")}
        subtitle="NEURAL_SANDBOX"
        title="PYTHON_IDE"
        titleIcon={<Terminal className="w-4 h-4 text-white/40" />}
        statusLabel={runtimeStatus}
        statusActive={runtimeStatus !== "ERROR"}
        extraRight={runtimeBadge}
      />

      <div className="flex-1 flex flex-col lg:flex-row p-3 lg:p-6 gap-4 lg:gap-6 relative z-10 min-h-0">
        {/* DESKTOP LEFT COLUMN: Runtime Logs + Telemetry */}
        <div className="w-80 flex-col gap-4 shrink-0 hidden lg:flex min-h-0">
          {/* Runtime Logs */}
          <CyberPanel
            variant="outline"
            chamfer="tl-br"
            decorations="brackets"
            className="bg-transparent border-white/10 relative flex-1 flex flex-col min-h-0 p-4"
          >
            <div className="text-xs font-mono text-white/40 tracking-widest uppercase border-b border-white/10 pb-2 mb-3">
              RUNTIME_LOGS
            </div>
            <div className="flex-1 overflow-y-auto font-mono text-xs text-white/70 flex flex-col gap-2 leading-relaxed pr-2">
              {logs.map((log, i) => (
                <div key={i} className="animate-[fadeIn_0.2s_ease-out]">
                  {log}
                </div>
              ))}
              {isRunning && <div className="animate-pulse text-white">_</div>}
              <div ref={logsBottomRef} />
            </div>
          </CyberPanel>

          {/* Telemetry */}
          <CyberPanel
            variant="outline"
            chamfer="tl-br"
            decorations="brackets"
            className="bg-transparent border-white/10 relative p-4 flex flex-col gap-3 shrink-0"
          >
            <div className="text-xs font-mono text-white/40 tracking-widest uppercase border-b border-white/10 pb-2">
              TELEMETRY
            </div>
            <TelemetryRow
              label="STATUS"
              value={runtimeStatus}
              icon={<Activity className="w-3 h-3 text-white/40" />}
            />
            <TelemetryRow
              label="EXEC_TIME"
              value={execTimeMs !== null ? String(execTimeMs) : "--"}
              unit="ms"
            />
            <TelemetryRow label="SOURCE_LINES" value={String(lineCount)} />
            <TelemetryRow
              label="PACKAGES"
              value={loadedPackages.length > 0 ? String(loadedPackages.length) : "0"}
            />
            <TelemetryRow label="MEMORY" value={memUsed} unit="MB" />
          </CyberPanel>
        </div>

        {/* CENTER COLUMN: Code Editor + Desktop Output Console */}
        <div className="flex-1 flex flex-col gap-4 min-h-0 min-w-0">
          {/* Code Editor Panel */}
          <CyberPanel
            variant="outline"
            chamfer="none"
            decorations="brackets"
            padded={false}
            className="flex-1 bg-black/70 border-white/10 relative flex flex-col overflow-hidden min-h-[220px]"
          >
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/5 shrink-0 gap-2 flex-wrap">
              <div className="flex items-center gap-3">
                <CyberBadge variant="outline" className="opacity-70">
                  MAIN.PY
                </CyberBadge>
                <span className="hidden sm:inline text-xs font-mono text-white/40 tracking-widest uppercase">
                  [ CTRL + ENTER TO RUN ]
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1.5 border border-white/10 hover:border-white/40 text-white/60 hover:text-white font-mono text-xs tracking-widest uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy Code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-teal" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copied ? "COPIED" : "COPY"}</span>
                </button>

                <button
                  onClick={handleResetCode}
                  className="px-2.5 py-1.5 border border-white/10 hover:border-white/40 text-white/60 hover:text-white font-mono text-xs tracking-widest uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Reset Template"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">RESET</span>
                </button>

                {isRunning ? (
                  <button
                    onClick={handleTerminate}
                    className="px-4 py-1.5 border border-coral bg-coral/20 hover:bg-coral hover:text-black text-coral font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    TERMINATE
                  </button>
                ) : (
                  <button
                    onClick={handleRun}
                    className="px-4 py-1.5 bg-white text-space-bg hover:bg-gray-200 font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 transition-colors cursor-pointer clip-chamfer-tl-br"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    EXECUTE
                  </button>
                )}
              </div>
            </div>

            {/* Editor Workspace */}
            <div className="flex-1 relative flex min-h-0 overflow-hidden bg-[#050505]">
              {/* Line Numbers Gutter */}
              <div
                ref={lineNumbersRef}
                className="w-11 py-4 bg-white/[0.02] border-r border-white/10 text-right pr-3 font-mono text-[13px] leading-[1.6] text-white/25 select-none overflow-hidden shrink-0"
              >
                {Array.from({ length: lineCount }).map((_, idx) => (
                  <div key={idx}>{idx + 1}</div>
                ))}
              </div>

              {/* Syntax Highlighted Backdrop + Transparent Textarea */}
              <div className="flex-1 relative min-h-0 min-w-0 overflow-hidden">
                <div
                  ref={highlightWrapperRef}
                  aria-hidden="true"
                  className="absolute inset-0 overflow-hidden pointer-events-none p-4 font-mono text-[13px] leading-[1.6]"
                >
                  <SyntaxHighlighter
                    language="python"
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: 0,
                      background: "transparent",
                      fontSize: "13px",
                      lineHeight: "1.6",
                      fontFamily: "var(--font-mono), monospace",
                      overflow: "visible",
                    }}
                    codeTagProps={{
                      style: {
                        fontSize: "13px",
                        lineHeight: "1.6",
                        fontFamily: "var(--font-mono), monospace",
                      },
                    }}
                    PreTag="div"
                  >
                    {code + "\n"}
                  </SyntaxHighlighter>
                </div>

                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onScroll={handleEditorScroll}
                  onKeyDown={handleEditorKeyDown}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  wrap="off"
                  className="absolute inset-0 w-full h-full resize-none bg-transparent p-4 font-mono text-[13px] leading-[1.6] text-transparent caret-white selection:bg-white/20 focus:outline-none overflow-auto whitespace-pre"
                />
              </div>
            </div>
          </CyberPanel>

          {/* DESKTOP Bottom Output Terminal */}
          <CyberPanel
            variant="outline"
            chamfer="none"
            decorations="brackets"
            padded={false}
            className="hidden lg:flex h-64 bg-black/80 border-white/10 relative flex-col overflow-hidden shrink-0"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <CyberBadge variant="outline" className="opacity-60">
                  TERMINAL_OUTPUT
                </CyberBadge>
                {loadedPackages.length > 0 && (
                  <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest">
                    MODULES: {loadedPackages.join(", ")}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setOutputs([]);
                  setPlots([]);
                }}
                className="text-xs font-mono text-white/40 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> CLEAR
              </button>
            </div>

            <OutputContent
              outputs={outputs}
              plots={plots}
              isRunning={isRunning}
              runtimeStatus={runtimeStatus}
              inputPrompt={inputPrompt}
              inputValue={inputValue}
              setInputValue={setInputValue}
              onInputSubmit={handleInputSubmit}
              outputBottomRef={outputBottomRef}
            />
          </CyberPanel>
        </div>

        {/* DESKTOP RIGHT COLUMN: Templates & Packages */}
        <CyberPanel
          variant="outline"
          chamfer="tl-br"
          decorations="brackets"
          className="w-72 bg-transparent border-white/10 relative hidden lg:flex flex-col p-4 shrink-0 min-h-0"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-4">
            <span className="text-xs font-mono text-white/40 tracking-widest uppercase">
              CODE_PRESETS
            </span>
            <Code2 className="w-3.5 h-3.5 text-white/40" />
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
            {CODE_TEMPLATES.map((tpl) => {
              const active = tpl.id === activeTemplateId;
              return (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`text-left p-3 border transition-all cursor-pointer relative group overflow-hidden ${
                    active
                      ? "border-white bg-white/10 text-white"
                      : "border-white/10 bg-black/40 text-white/60 hover:border-white/40 hover:text-white"
                  }`}
                >
                  <div
                    className={`absolute left-0 top-0 w-1 h-full bg-white transition-transform duration-200 ${
                      active ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
                    }`}
                  />
                  <div className="font-mono text-xs font-bold tracking-widest uppercase mb-1 pl-1">
                    {tpl.label}
                  </div>
                  <div className="font-mono text-[11px] text-white/40 leading-relaxed normal-case pl-1">
                    &gt; {tpl.description}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-white/40 leading-relaxed">
            <div className="text-white/60 uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Cpu className="w-3 h-3" /> AUTO-IMPORT PACKAGES:
            </div>
            numpy, scipy, scikit-learn, pandas, matplotlib
          </div>
        </CyberPanel>

        {/* MOBILE / TABLET BOTTOM TABS */}
        <div className="flex-1 flex flex-col lg:hidden min-h-0 bg-space-bg/80 border border-white/10">
          <div className="flex flex-shrink-0 border-b border-white/10 bg-space-bg">
            {[
              { id: "output", label: "OUTPUT" },
              { id: "templates", label: "PRESETS" },
              { id: "logs", label: "LOGS" },
            ].map((tab) => {
              const isActive = mobileTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMobileTab(tab.id as "output" | "templates" | "logs")}
                  className={`group relative z-10 flex-1 h-12 flex items-center justify-center px-3 transition-colors duration-200 cursor-pointer border-r border-white/10 last:border-r-0 bg-transparent overflow-hidden ${
                    isActive ? "text-space-bg" : "text-white/40 hover:text-white"
                  }`}
                >
                  <div
                    className={`absolute top-0 left-0 h-full w-full bg-white clip-mod-1 transition-transform duration-300 ease-out z-0 ${
                      isActive ? "translate-x-0" : "-translate-x-full group-hover:-translate-x-[95%]"
                    }`}
                  />
                  <span className="relative z-10 text-xs font-mono font-bold tracking-[0.12em] uppercase">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
            {mobileTab === "output" && (
              <OutputContent
                outputs={outputs}
                plots={plots}
                isRunning={isRunning}
                runtimeStatus={runtimeStatus}
                inputPrompt={inputPrompt}
                inputValue={inputValue}
                setInputValue={setInputValue}
                onInputSubmit={handleInputSubmit}
                outputBottomRef={outputBottomRef}
              />
            )}

            {mobileTab === "templates" && (
              <div className="p-3 flex flex-col gap-2">
                {CODE_TEMPLATES.map((tpl) => {
                  const active = tpl.id === activeTemplateId;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        handleSelectTemplate(tpl);
                        setMobileTab("output");
                      }}
                      className={`text-left p-3 border transition-all cursor-pointer ${
                        active
                          ? "border-white bg-white/10 text-white"
                          : "border-white/10 bg-black/40 text-white/60"
                      }`}
                    >
                      <div className="font-mono text-xs font-bold tracking-widest uppercase mb-1">
                        {tpl.label}
                      </div>
                      <div className="font-mono text-xs text-white/40 normal-case">
                        &gt; {tpl.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {mobileTab === "logs" && (
              <div className="p-3 font-mono text-xs text-white/70 flex flex-col gap-2">
                <div className="flex justify-between border-b border-white/10 pb-2 text-white/40">
                  <span>EXEC_TIME: {execTimeMs !== null ? `${execTimeMs}ms` : "--"}</span>
                  <span>MEM: {memUsed} MB</span>
                </div>
                {logs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OutputContent({
  outputs,
  plots,
  isRunning,
  runtimeStatus,
  inputPrompt,
  inputValue,
  setInputValue,
  onInputSubmit,
  outputBottomRef,
}: {
  outputs: OutputEntry[];
  plots: string[];
  isRunning: boolean;
  runtimeStatus: string;
  inputPrompt: string;
  inputValue: string;
  setInputValue: (val: string) => void;
  onInputSubmit: (e: React.FormEvent) => void;
  outputBottomRef: React.RefObject<HTMLDivElement | null>;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (runtimeStatus === "AWAITING_INPUT") {
      inputRef.current?.focus();
    }
  }, [runtimeStatus]);

  return (
    <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed select-text space-y-2">
      {outputs.length === 0 && plots.length === 0 && !isRunning && (
        <div className="text-white/30 tracking-widest uppercase">
          &gt; AWAITING_EXECUTION_STREAM...
        </div>
      )}

      {outputs.map((item, idx) => (
        <div
          key={idx}
          className={`whitespace-pre-wrap break-words ${
            item.kind === "stderr"
              ? "text-coral bg-coral/10 border-l-2 border-coral pl-3 py-1"
              : item.kind === "result"
              ? "text-teal font-bold"
              : item.kind === "system"
              ? "text-white/40 italic"
              : "text-white/90"
          }`}
        >
          {item.text}
        </div>
      ))}

      {runtimeStatus === "AWAITING_INPUT" && (
        <form
          onSubmit={onInputSubmit}
          className="flex items-center gap-2 bg-white/5 border border-teal/40 px-3 py-1.5"
        >
          <span className="text-teal font-bold shrink-0">&gt;</span>
          {inputPrompt && (
            <span className="text-white/90 whitespace-pre-wrap shrink-0">{inputPrompt}</span>
          )}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type input and press Enter..."
            autoFocus
            className="flex-1 min-w-[100px] bg-transparent font-mono text-xs text-white caret-teal focus:outline-none placeholder:text-white/25"
          />
          <button
            type="submit"
            className="px-2 py-0.5 bg-teal/20 border border-teal/50 hover:bg-teal hover:text-black text-teal font-mono text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer shrink-0"
          >
            ENTER
          </button>
        </form>
      )}

      {plots.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {plots.map((b64, idx) => (
            <div
              key={idx}
              className="border border-white/20 bg-black p-2 relative group flex flex-col items-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${b64}`}
                alt={`Plot ${idx + 1}`}
                className="max-h-52 w-auto object-contain"
              />
              <a
                href={`data:image/png;base64,${b64}`}
                download={`sequoia_plot_${idx + 1}.png`}
                className="absolute top-2 right-2 bg-black/80 border border-white/20 hover:border-white p-1.5 text-white/60 hover:text-white transition-colors"
                title="Download Plot"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}

      {isRunning && runtimeStatus !== "AWAITING_INPUT" && (
        <div className="text-white/60 animate-pulse tracking-widest uppercase">
          &gt; {runtimeStatus}...
        </div>
      )}

      <div ref={outputBottomRef} />
    </div>
  );
}

function TelemetryRow({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs font-mono text-white/40 tracking-widest">{label}</span>
      <span className="text-sm font-mono text-white tracking-widest flex items-center gap-1">
        {value} {unit && <span className="text-xs text-white/40">{unit}</span>} {icon}
      </span>
    </div>
  );
}
