import type { GeneralGraph, BFSResult } from '../types';
export declare function bidirectionalBFS(graph: GeneralGraph, startId: string, endId: string): BFSResult;
export declare function findOptimalMultiGoalPath(graph: GeneralGraph, startId: string, goalIds: string[]): {
    optimalPath: string[];
    allPaths: Map<string, Map<string, string[]>>;
};
