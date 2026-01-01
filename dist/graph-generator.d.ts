import type { GeneralGraph } from './types';
export interface GraphGeneratorOptions {
    nodeCount: number;
    width?: number;
    height?: number;
    maxConnectionsPerNode?: number;
    connectionRadius?: number;
    minNodeDistance?: number;
    seed?: number;
}
export declare function generateRandomGraph(options: GraphGeneratorOptions): GeneralGraph;
export declare function findOppositeCornerNodes(graph: GeneralGraph): {
    topLeft: string;
    bottomRight: string;
};
