import type { GeneralGraph } from './types';
export interface GraphGeneratorOptions {
    nodeCount: number;
    avgDegree: number;
    seed?: number;
}
export declare function generateRandomGraph(options: GraphGeneratorOptions): GeneralGraph;
