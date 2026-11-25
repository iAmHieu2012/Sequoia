/// <reference types="@webgpu/types" />
import { loadAndCompile, isWebGPUSupported, getWebGpuDevice, setWebGpuDevice, type CompiledModel } from '@litertjs/core';

export type Accelerator = 'webgpu' | 'wasm';

let webGpuReady: Promise<boolean> | null = null;

/**
 * Makes WebGPU available to LiteRT.js if this browser can use it.
 * LiteRT.js only picks WebGPU when a GPU device has been registered with setWebGpuDevice();
 * it never requests one itself. Resolves to false (use WASM) when there is no WebGPU or no usable GPU,
 * which is common on Linux and many phones. Runs once per tab.
 */
export function ensureWebGpu(): Promise<boolean> {
  webGpuReady ??= (async () => {
    try {
      if (!isWebGPUSupported()) return false;
      if (getWebGpuDevice()) return true;
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) return false;
      setWebGpuDevice(await adapter.requestDevice());
      return true;
    } catch (error) {
      console.warn('WebGPU unavailable, using WASM:', error);
      return false;
    }
  })();
  return webGpuReady;
}

/** A short name for the GPU in use, for logs ("intel gen-9"), or null. */
export function gpuName(): string | null {
  const info = getWebGpuDevice()?.adapterInfo;
  if (!info) return null;
  return [info.vendor, info.architecture].filter(Boolean).join(' ') || info.description || null;
}

async function download(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Model download failed (HTTP ${res.status})`);
  return new Uint8Array(await res.arrayBuffer());
}

/**
 * Compiles a .tflite on WebGPU when available, otherwise on WASM.
 * If WebGPU compilation fails (an op the GPU backend does not support), it falls back to WASM.
 * `prefer: 'wasm'` skips WebGPU (used by the ?accel=wasm switch).
 * `webgpuUrl`: a build of the same model tuned for WebGPU, used instead of `url` on WebGPU.
 * The file is downloaded once when the same file serves both attempts.
 */
export async function compileModel(
  url: string,
  prefer: Accelerator = 'webgpu',
  webgpuUrl?: string,
): Promise<{ model: CompiledModel; accelerator: Accelerator; fallbackReason?: string }> {
  let bytes: Uint8Array | null = null;
  let fallbackReason: string | undefined;

  if (prefer === 'webgpu') {
    if (await ensureWebGpu()) {
      try {
        const gpuBytes = await download(webgpuUrl ?? url);
        if (!webgpuUrl) bytes = gpuBytes;
        // slice(): compiling may take ownership of the buffer; keep the original for the WASM fallback.
        const model = await loadAndCompile(gpuBytes.slice(), { accelerator: 'webgpu' });
        return { model, accelerator: 'webgpu' };
      } catch (error) {
        console.warn('WebGPU compile failed, falling back to WASM:', error);
        fallbackReason = 'WEBGPU COMPILE FAILED';
      }
    } else {
      fallbackReason = 'NO WEBGPU';
    }
  }

  const model = await loadAndCompile(bytes ?? (await download(url)), { accelerator: 'wasm' });
  return { model, accelerator: 'wasm', fallbackReason };
}
