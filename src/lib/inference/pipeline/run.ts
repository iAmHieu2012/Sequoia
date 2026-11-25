import { Tensor, type CompiledModel } from '@litertjs/core';
import type { ParsedResult, PipelineConfig, PipelineStage, PlaygroundParams } from '@/types/playground';
import { imageToInput, type Region } from './preprocess';
import { STEPS, type StepOutput } from './steps';

/** Compiled models (by stage id) and loaded assets (by key) for one pipeline. */
export interface LoadedPipeline {
  config: PipelineConfig;
  models: Record<string, CompiledModel>;
  assets: Record<string, string>;
}

/** Results of every stage: one output for a whole-image stage, one per region for a `for_each` stage. */
type StageResults = Record<string, { region: Region; output: StepOutput }[]>;

type Assembler = (results: StageResults, config: PipelineConfig) => ParsedResult;

/** How the stage results become the playground result, named by `pipeline.result`. */
const ASSEMBLERS: Record<string, Assembler> = {
  /** Text lines: regions of the first stage that has `for_each`, with their decoded text. */
  ocr: (results, config) => {
    const textStage = config.stages.find(s => s.for_each);
    const lines = textStage ? results[textStage.id] ?? [] : [];
    const texts = lines
      .filter(({ output }) => output.text)
      .map(({ region: r, output }) => ({
        polygon: [
          { x: r.x, y: r.y }, { x: r.x + r.w, y: r.y },
          { x: r.x + r.w, y: r.y + r.h }, { x: r.x, y: r.y + r.h },
        ],
        text: output.text!,
        conf: output.conf ?? 0,
      }));
    return { type: 'ocr', texts, count: texts.length };
  },
};

/** Step options: the stage's metadata `options`, overridden by numeric playground parameters of the same name. */
function optionsFor(stage: PipelineStage, params: PlaygroundParams): Record<string, number> {
  const options = { ...(stage.options ?? {}) };
  for (const key of Object.keys(options)) {
    const v = params[key];
    if (typeof v === 'number') options[key] = v;
  }
  return options;
}

async function runStage(
  model: CompiledModel,
  stage: PipelineStage,
  source: CanvasImageSource,
  region: Region,
  scratch: OffscreenCanvasRenderingContext2D,
) {
  const input = Tensor.fromTypedArray(imageToInput(source, region, stage, scratch), stage.input_size);
  try {
    const outputs = await model.run([input]);
    try {
      const data = (await outputs[0].data()) as Float32Array;
      return { data, shape: Array.from(outputs[0].type.layout.dimensions) };
    } finally {
      // LiteRT tensors are not garbage-collected.
      for (const out of outputs) out.delete();
    }
  } finally {
    input.delete();
  }
}

/**
 * Runs every stage in order on one image and returns the assembled result.
 * A stage with `for_each: "<id>"` runs once per region produced by that earlier stage,
 * on that region cut from the original image.
 */
export async function runPipeline(
  pipeline: LoadedPipeline,
  source: CanvasImageSource,
  imageWidth: number,
  imageHeight: number,
  params: PlaygroundParams,
): Promise<ParsedResult> {
  const { config, models, assets } = pipeline;
  const results: StageResults = {};
  const scratch = new OffscreenCanvas(1, 1).getContext('2d', { willReadFrequently: true })!;
  const whole: Region = { x: 0, y: 0, w: imageWidth, h: imageHeight };

  for (const stage of config.stages) {
    const step = STEPS[stage.then];
    if (!step) throw new Error(`Unknown pipeline step "${stage.then}" in stage "${stage.id}"`);
    const model = models[stage.id];
    const options = optionsFor(stage, params);

    let regions: Region[] = [whole];
    if (stage.for_each) {
      const from = results[stage.for_each];
      if (!from) throw new Error(`Stage "${stage.id}" runs for each "${stage.for_each}", which has not run`);
      regions = from.flatMap(r => r.output.regions ?? []);
    }

    results[stage.id] = [];
    for (const region of regions) {
      const { data, shape } = await runStage(model, stage, source, region, scratch);
      const output = step({ data, shape, imageWidth, imageHeight, options, assets });
      results[stage.id].push({ region, output });
    }
  }

  const assemble = ASSEMBLERS[config.result];
  if (!assemble) throw new Error(`Unknown pipeline result "${config.result}"`);
  return assemble(results, config);
}
