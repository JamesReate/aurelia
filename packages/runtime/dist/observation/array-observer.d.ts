import { LifecycleFlags, AccessorType } from '../observation.js';
import { CollectionLengthObserver } from './collection-length-observer.js';
import type { CollectionKind, ICollectionObserver, ICollectionIndexObserver, ILifecycle, IndexMap, ISubscriber } from '../observation.js';
export declare function enableArrayObservation(): void;
export declare function disableArrayObservation(): void;
export interface ArrayObserver extends ICollectionObserver<CollectionKind.array> {
}
export declare class ArrayObserver {
    inBatch: boolean;
    type: AccessorType;
    private readonly indexObservers;
    constructor(array: unknown[]);
    notify(): void;
    getLengthObserver(): CollectionLengthObserver;
    getIndexObserver(index: number): ICollectionIndexObserver;
    flushBatch(flags: LifecycleFlags): void;
}
export interface ArrayIndexObserver extends ICollectionIndexObserver {
}
export declare class ArrayIndexObserver implements ICollectionIndexObserver {
    readonly owner: ArrayObserver;
    readonly index: number;
    value: unknown;
    private subCount;
    constructor(owner: ArrayObserver, index: number);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
    /**
     * From interface `ICollectionSubscriber`
     */
    handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void;
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
}
export declare function getArrayObserver(array: unknown[], lifecycle: ILifecycle | null): ArrayObserver;
/**
 * Applies offsets to the non-negative indices in the IndexMap
 * based on added and deleted items relative to those indices.
 *
 * e.g. turn `[-2, 0, 1]` into `[-2, 1, 2]`, allowing the values at the indices to be
 * used for sorting/reordering items if needed
 */
export declare function applyMutationsToIndices(indexMap: IndexMap): void;
/**
 * After `applyMutationsToIndices`, this function can be used to reorder items in a derived
 * array (e.g.  the items in the `views` in the repeater are derived from the `items` property)
 */
export declare function synchronizeIndices<T>(items: T[], indexMap: IndexMap): void;
//# sourceMappingURL=array-observer.d.ts.map