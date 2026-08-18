import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { loadLiteRt, loadAndCompile, CompiledModel } from '@litertjs/core';
import { AiModel, ModelMetadata } from '@/types/playground';

export function useModelLoader(
  modelId: string,
  setLogs: Dispatch<SetStateAction<string[]>>
) {
  const [model, setModel] = useState<AiModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [booting, setBooting] = useState(true);
  
  const compiledModelRef = useRef<CompiledModel | null>(null);
  const [compiledModelReady, setCompiledModelReady] = useState(false);
  
  const initialized = useRef(false);

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
        if (error instanceof Error && !error.message?.includes("already loading") && !error.message?.includes("already loaded")) {
           throw error;
        }
      }
      
      setLogs(prev => [...prev, "> DOWNLOADING MODEL DATA..."]);
      
      const loadedModel = await loadAndCompile(modelData.file_url);
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
      .then(res => res.json())
      .then(async data => {
        const modelData = data.data;
        if (modelData.metadata_url) {
          try {
            // const metaRes = await fetch(`${modelData.metadata_url}?t=${Date.now()}`);
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
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId]);



  return { model, loading, booting, compiledModelRef, compiledModelReady };
}
