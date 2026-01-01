import type { GeneralGraph, BFSResult, BFSStep } from '../types';
export declare function bidirectionalBFS(graph: GeneralGraph, startId: string, endId: string): BFSResult;
export declare function findOptimalMultiGoalPath(graph: GeneralGraph, startId: string, goalIds: string[]): {
    optimalPath: string[];
    allPaths: Map<string, Map<string, string[]>>;
    permutationSteps: BFSStep[];
    testedPermutations: Array<{
        path: string[];
        length: number;
        tour: string[];
    }>;
};
