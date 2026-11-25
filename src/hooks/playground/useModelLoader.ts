import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { loadLiteRt, CompiledModel } from '@litertjs/core';
import { compileModel, gpuName, type Accelerator } from '@/lib/inference/accelerator';
import type { LoadedPipeline } from '@/lib/inference/pipeline/run';
import { AiModel, ModelMetadata } from '@/types/playground';

/**
 * Hook to manage the lifecycle of an AI Model in the Playground.
 * Fetches the model's DB record and its metadata.json from the CDN, plays a cosmetic boot log,
 * then initializes the LiteRT runtime and compiles the model on WebGPU when the browser has a usable
 * GPU, otherwise on WASM. Add `?accel=wasm` to the playground URL to force WASM (for comparisons).
 * A metadata.json with `pipeline` loads every stage's model and the pipeline assets into `pipelineRef`
 * instead of `compiledModelRef` (which then stays null, so the single-model loop does nothing).
 * 
 * @param modelId The ID of the model to load
 * @param setLogs State setter to push system boot logs to the terminal
 */
export function useModelLoader(
  modelId: string,
  setLogs: Dispatch<SetStateAction<string[]>>
) {
  const [model, setModel] = useState<AiModel | null>(null);
  const [loading, setLoading] = useState(true);
  // Why the model could not be loaded: it does not exist, or the request failed (network / server error).
  const [loadError, setLoadError] = useState<"not_found" | "failed" | null>(null);
  const [booting, setBooting] = useState(true);
  
  const compiledModelRef = useRef<CompiledModel | null>(null);
  const pipelineRef = useRef<LoadedPipeline | null>(null);
  const [compiledModelReady, setCompiledModelReady] = useState(false);
  const [accelerator, setAccelerator] = useState<Accelerator | null>(null);
  
  // Load only once per mount (also absorbs React StrictMode's double effect run in dev).
  const initialized = useRef(false);

  /** Cosmetic: prints fake boot lines, then starts the real LiteRT init. */
  function simulateBootSequence(loadedModelData: AiModel) {
    const sequence = [
      "> ALLOCATING TENSORS...",
      "> LOADING WEIGHTS...",
      "> WARMING UP NEURAL ENGINE...",
      "> RUNTIME ESTABLISHED. STANDBY."
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLogs(prev => [...prev, sequence[i]]);
      i++;
      if (i >= sequence.length) {
        clearInterval(interval);
        setTimeout(() => {
          setBooting(false);
          initLiteRtModel(loadedModelData);
        }, 500);
      }
    }, 600);
  };

  async function initLiteRtModel(modelData: AiModel) {
    try {
      setLogs(prev => [...prev, "> INITIALIZING LiteRT RUNTIME..."]);
      try {
        await loadLiteRt("https://cdn.jsdelivr.net/npm/@litertjs/core@2.5.3/wasm/");
      } catch (error: unknown) {
        // The runtime is global: it may already be loaded by an earlier model in this tab. That's fine.
        if (error instanceof Error && !error.message?.includes("already loading") && !error.message?.includes("already loaded")) {
           throw error;
        }
      }
      
      setLogs(prev => [...prev, "> DOWNLOADING MODEL DATA..."]);
      
      const prefer: Accelerator = new URLSearchParams(window.location.search).get("accel") === "wasm" ? "wasm" : "webgpu";
      const describe = (used: Accelerator, fallbackReason?: string) =>
        used === "webgpu"
          ? `WEBGPU${gpuName() ? ` (${gpuName()!.toUpperCase()})` : ""}`
          : `WASM (CPU)${fallbackReason ? ` - ${fallbackReason}` : ""}`;

      const pipeline = modelData.metadata?.pipeline;
      if (pipeline) {
        // Several models chained together: compile every stage, then load the text assets.
        const models: LoadedPipeline["models"] = {};
        let allGpu = true;
        for (const stage of pipeline.stages) {
          setLogs(prev => [...prev, `> COMPILING STAGE ${stage.id.toUpperCase()}...`]);
          const { model: m, accelerator: used, fallbackReason } = await compileModel(stage.model_url, prefer, stage.model_url_webgpu);
          models[stage.id] = m;
          if (used !== "webgpu") allGpu = false;
          setLogs(prev => [...prev, `> STAGE ${stage.id.toUpperCase()}: ${describe(used, fallbackReason)}`]);
        }
        const assets: LoadedPipeline["assets"] = {};
        for (const [key, url] of Object.entries(pipeline.assets ?? {})) {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Asset "${key}" failed to load (HTTP ${res.status})`);
          assets[key] = await res.text();
        }
        pipelineRef.current = { config: pipeline, models, assets };
        setAccelerator(allGpu ? "webgpu" : "wasm");
        setCompiledModelReady(true);
        setLogs(prev => [...prev, `> PIPELINE READY: ${pipeline.stages.length} MODELS.`]);
        return;
      }

      // Where the .tflite lives is declared only in metadata.json (`model_url`).
      const modelUrl = modelData.metadata?.model_url;
      if (!modelUrl) throw new Error("No model_url in metadata.json");
      const { model: loadedModel, accelerator: used, fallbackReason } = await compileModel(modelUrl, prefer);
      compiledModelRef.current = loadedModel;
      setAccelerator(used);
      setCompiledModelReady(true);

      setLogs(prev => [...prev, "> MODEL COMPILED SUCCESSFULLY.", `> ACCELERATOR: ${describe(used, fallbackReason)}`]);
    } catch (error: unknown) {
      console.error(error);
      setLogs(prev => [...prev, "> ERROR: LiteRT COMPILE FAILED."]);
    }
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    fetch(`/api/v1/models/${modelId}`)
      .then(res => {
        if (res.status === 404) throw new Error("not_found");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(async data => {
        const modelData = data.data;
        if (modelData.metadata_url) {
          try {
            const metaRes = await fetch(modelData.metadata_url);

            const metaJson = await metaRes.json();
            modelData.metadata = metaJson as ModelMetadata;
          } catch (error) {
            console.warn("Failed to fetch metadata.json from CDN", error);
            modelData.metadata = null;
          }
        } else {
            modelData.metadata = null;
        }
        setModel(modelData);
        setLoading(false);
        simulateBootSequence(modelData);
      })
      .catch(error => {
        console.error(error);
        setLogs(prev => [...prev, "> ERROR: FAILED TO FETCH MODEL MATRIX."]);
        setLoadError(error instanceof Error && error.message === "not_found" ? "not_found" : "failed");
        setLoading(false);
      });
  // The helpers above are recreated every render; the `initialized` guard makes this run once anyway.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId]);



  // Pipelines free their own models on unmount (the single model is freed by useInference).
  useEffect(() => {
    return () => {
      const p = pipelineRef.current;
      if (!p) return;
      for (const m of Object.values(p.models)) {
        try { m.delete(); } catch { /* already freed */ }
      }
      pipelineRef.current = null;
    };
  }, []);

  return { model, loading, loadError, booting, compiledModelRef, pipelineRef, compiledModelReady, accelerator };
}
