import { AccessorType, LifecycleFlags } from '@aurelia/runtime';
import type { IAccessor } from '@aurelia/runtime';
export declare class ClassAttributeAccessor implements IAccessor {
    readonly obj: HTMLElement;
    type: AccessorType;
    value: unknown;
    readonly doNotCache: true;
    constructor(obj: HTMLElement);
    getValue(): unknown;
    setValue(newValue: unknown, flags: LifecycleFlags): void;
}
export declare function getClassesToAdd(object: Record<string, unknown> | [] | string): string[];
//# sourceMappingURL=class-attribute-accessor.d.ts.map