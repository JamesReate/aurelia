import { Constructable, IContainer } from '@aurelia/kernel';
import { LifecycleFlags } from '@aurelia/runtime';
import { IPlatform } from '../../platform.js';
import { HydrateElementInstruction } from '../../renderer.js';
import { ICustomElementController, IHydratedController, ISyntheticView } from '../../templating/controller.js';
/**
 * An optional interface describing the dialog activate convention.
 */
export interface IDynamicComponentActivate<T> {
    /**
     * Implement this hook if you want to perform custom logic just before the component is is composed.
     * The returned value is not used.
     */
    activate?(model?: T): unknown | Promise<unknown>;
}
declare type MaybePromise<T> = T | Promise<T>;
declare type ChangeSource = 'view' | 'viewModel' | 'model' | 'scopeBehavior';
export declare class AuCompose {
    private readonly container;
    private readonly parent;
    private readonly host;
    private readonly p;
    private readonly instruction;
    private readonly contextFactory;
    view?: string | Promise<string>;
    viewModel?: Constructable | object | Promise<Constructable | object>;
    model?: unknown;
    scopeBehavior: 'auto' | 'scoped';
    private _p?;
    get pending(): Promise<void> | void;
    get composition(): ICompositionController | undefined;
    constructor(container: IContainer, parent: ISyntheticView | ICustomElementController, host: HTMLElement, p: IPlatform, instruction: HydrateElementInstruction, contextFactory: CompositionContextFactory);
    attaching(initiator: IHydratedController, parent: IHydratedController, flags: LifecycleFlags): void | Promise<void>;
    detaching(initiator: IHydratedController): void | Promise<void>;
}
export interface ICompositionController {
    readonly controller: IHydratedController;
    readonly context: CompositionContext;
    activate(): void | Promise<void>;
    deactivate(detachInitator?: IHydratedController): void | Promise<void>;
    update(model: unknown): void | Promise<void>;
}
declare class CompositionContextFactory {
    private id;
    isFirst(context: CompositionContext): boolean;
    isCurrent(context: CompositionContext): boolean;
    create(changes: ChangeInfo): MaybePromise<CompositionContext>;
    invalidate(): void;
}
declare class ChangeInfo {
    readonly view: MaybePromise<string> | undefined;
    readonly viewModel: MaybePromise<Constructable | object> | undefined;
    readonly model: unknown | undefined;
    readonly initiator: IHydratedController | undefined;
    readonly src: ChangeSource | undefined;
    constructor(view: MaybePromise<string> | undefined, viewModel: MaybePromise<Constructable | object> | undefined, model: unknown | undefined, initiator: IHydratedController | undefined, src: ChangeSource | undefined);
    load(): MaybePromise<LoadedChangeInfo>;
}
declare class LoadedChangeInfo {
    readonly view: string | undefined;
    readonly viewModel: Constructable | object | undefined;
    readonly model: unknown | undefined;
    readonly initiator: IHydratedController | undefined;
    readonly src: ChangeSource | undefined;
    constructor(view: string | undefined, viewModel: Constructable | object | undefined, model: unknown | undefined, initiator: IHydratedController | undefined, src: ChangeSource | undefined);
}
declare class CompositionContext {
    readonly id: number;
    readonly change: LoadedChangeInfo;
    constructor(id: number, change: LoadedChangeInfo);
}
export {};
//# sourceMappingURL=au-compose.d.ts.map