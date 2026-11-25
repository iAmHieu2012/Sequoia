import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { loadLiteRt, loadAndCompile, CompiledModel } from '@litertjs/core';
import { AiModel, ModelMetadata } from '@/types/playground';

/**
 * Hook to manage the lifecycle of an AI Model in the Playground.
 * Fetches the model's DB record and its metadata.json from the CDN, plays a cosmetic boot log,
 * then initializes the LiteRT WebAssembly runtime and compiles the model.
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
  const [compiledModelReady, setCompiledModelReady] = useState(false);
  
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
      setLogs(prev => [...prev, "> INITIALIZING LiteRT WASM ENGINE..."]);
      try {
        await loadLiteRt("https://cdn.jsdelivr.net/npm/@litertjs/core@2.5.3/wasm/");
      } catch (error: unknown) {
        // The runtime is global: it may already be loaded by an earlier model in this tab. That's fine.
        if (error instanceof Error && !error.message?.includes("already loading") && !error.message?.includes("already loaded")) {
           throw error;
        }
      }
      
      setLogs(prev => [...prev, "> DOWNLOADING MODEL DATA..."]);
      
      // Where the .tflite lives is declared only in metadata.json (`model_url`).
      const modelUrl = modelData.metadata?.model_url;
      if (!modelUrl) throw new Error("No model_url in metadata.json");
      const loadedModel = await loadAndCompile(modelUrl);
      compiledModelRef.current = loadedModel;
      setCompiledModelReady(true);
      
      setLogs(prev => [...prev, "> MODEL COMPILED SUCCESSFULLY."]);
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



  return { model, loading, loadError, booting, compiledModelRef, compiledModelReady };
}
