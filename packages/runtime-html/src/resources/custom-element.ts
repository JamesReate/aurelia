import {
  DI,
  Registration,
  mergeArrays,
  fromDefinitionOrDefault,
  pascalCase,
  fromAnnotationOrTypeOrDefault,
  fromAnnotationOrDefinitionOrTypeOrDefault,
  emptyArray,
} from '@aurelia/kernel';
import { registerAliases } from '@aurelia/runtime';
import { Bindable } from '../bindable.js';
import { getEffectiveParentNode, getRef } from '../dom.js';
import { Children } from '../templating/children.js';
import { Watch } from '../watch.js';
import { DefinitionType } from './resources-shared.js';
import { appendResourceKey, defineMetadata, getAnnotationKeyFor, getOwnMetadata, getResourceKeyFor, hasOwnMetadata } from '../shared.js';

import type {
  Constructable,
  IContainer,
  IResourceKind,
  ResourceType,
  PartialResourceDefinition,
  Key,
  ResourceDefinition,
  Injectable,
  IResolver,
  Writable,
} from '@aurelia/kernel';
import type { BindableDefinition, PartialBindableDefinition } from '../bindable.js';
import type { INode } from '../dom.js';
import type { PartialChildrenDefinition, ChildrenDefinition } from '../templating/children.js';
import type { Controller, ICustomElementViewModel, ICustomElementController } from '../templating/controller.js';
import type { IPlatform } from '../platform.js';
import type { IInstruction } from '../renderer.js';
import type { IWatchDefinition } from '../watch.js';

declare module '@aurelia/kernel' {
  interface IContainer {
    find<T extends ICustomElementViewModel>(kind: CustomElementKind, name: string): CustomElementDefinition<Constructable<T>> | null;
  }
}

export type PartialCustomElementDefinition = PartialResourceDefinition<{
  readonly cache?: '*' | number;
  readonly template?: null | string | Node;
  readonly instructions?: readonly (readonly IInstruction[])[];
  readonly dependencies?: readonly Key[];
  readonly injectable?: InjectableToken | null;
  readonly needsCompile?: boolean;
  readonly surrogates?: readonly IInstruction[];
  readonly bindables?: Record<string, PartialBindableDefinition> | readonly string[];
  readonly childrenObservers?: Record<string, PartialChildrenDefinition>;
  readonly containerless?: boolean;
  readonly isStrictBinding?: boolean;
  readonly shadowOptions?: { mode: 'open' | 'closed' } | null;
  readonly hasSlots?: boolean;
  readonly enhance?: boolean;
  readonly watches?: IWatchDefinition[];
  readonly processContent?: ProcessContentHook | null;
}>;

export type CustomElementType<C extends Constructable = Constructable> = ResourceType<C, ICustomElementViewModel & (C extends Constructable<infer P> ? P : {}), PartialCustomElementDefinition>;
export type CustomElementKind = IResourceKind<CustomElementType, CustomElementDefinition> & {
  /**
   * Returns the closest controller that is associated with either this node (if it is a custom element) or the first
   * parent node (including containerless) that is a custom element.
   *
   * As long as the provided node was directly or indirectly created by Aurelia, this method is guaranteed to return a controller.
   *
   * @param node - The node relative to which to get the closest controller.
   * @param searchParents - Also search the parent nodes (including containerless).
   * @returns The closest controller relative to the provided node.
   * @throws - If neither the node or any of its effective parent nodes host a custom element, an error will be thrown.
   */
  for<C extends ICustomElementViewModel = ICustomElementViewModel>(node: Node, opts: { searchParents: true }): ICustomElementController<C>;
  /**
   * Returns the controller that is associated with this node, if it is a custom element with the provided name.
   *
   * @param node - The node to retrieve the controller for, if it is a custom element with the provided name.
   * @returns The controller associated with the provided node, if it is a custom element with the provided name, or otherwise `undefined`.
   * @throws - If the node does not host a custom element, an error will be thrown.
   */
  for<C extends ICustomElementViewModel = ICustomElementViewModel>(node: Node, opts: { name: string }): ICustomElementController<C> | undefined;
  /**
   * Returns the closest controller that is associated with either this node (if it is a custom element) or the first
   * parent node (including containerless) that is a custom element with the provided name.
   *
   * @param node - The node relative to which to get the closest controller of a custom element with the provided name.
   * @param searchParents - Also search the parent nodes (including containerless).
   * @returns The closest controller of a custom element with the provided name, relative to the provided node, if one can be found, or otherwise `undefined`.
   * @throws - If neither the node or any of its effective parent nodes host a custom element, an error will be thrown.
   */
  for<C extends ICustomElementViewModel = ICustomElementViewModel>(node: Node, opts: { name: string; searchParents: true }): ICustomElementController<C> | undefined;
  /**
   * Returns the controller that is associated with this node, if it is a custom element.
   *
   * @param node - The node to retrieve the controller for, if it is a custom element.
   * @param optional - If `true`, do not throw if the provided node is not a custom element.
   * @returns The controller associated with the provided node, if it is a custom element
   * @throws - If the node does not host a custom element, an error will be thrown.
   */
  for<C extends ICustomElementViewModel = ICustomElementViewModel>(node: Node): ICustomElementController<C>;
  /**
   * Returns the controller that is associated with this node, if it is a custom element.
   *
   * @param node - The node to retrieve the controller for, if it is a custom element.
   * @param optional - If `true`, do not throw if the provided node is not a custom element.
   * @returns The controller associated with the provided node, if it is a custom element, otherwise `null`
   */
  for<C extends ICustomElementViewModel = ICustomElementViewModel>(node: Node, opts: { optional: true }): ICustomElementController<C> | null;
  isType<C>(value: C): value is (C extends Constructable ? CustomElementType<C> : never);
  define<C extends Constructable >(name: string, Type: C): CustomElementType<C>;
  define<C extends Constructable >(def: PartialCustomElementDefinition, Type: C): CustomElementType<C>;
  define<C extends Constructable >(def: PartialCustomElementDefinition, Type?: null): CustomElementType<C>;
  define<C extends Constructable >(nameOrDef: string | PartialCustomElementDefinition, Type: C): CustomElementType<C>;
  getDefinition<C extends Constructable>(Type: C): CustomElementDefinition<C>;
  // eslint-disable-next-line
  getDefinition<C extends Constructable>(Type: Function): CustomElementDefinition<C>;
  annotate<K extends keyof PartialCustomElementDefinition>(Type: Constructable, prop: K, value: PartialCustomElementDefinition[K]): void;
  getAnnotation<K extends keyof PartialCustomElementDefinition>(Type: Constructable, prop: K): PartialCustomElementDefinition[K];
  generateName(): string;
  createInjectable<T extends Key = Key>(): InjectableToken;
  generateType<P extends {} = {}>(
    name: string,
    proto?: P,
  ): CustomElementType<Constructable<P>>;
};

export type CustomElementDecorator = <T extends Constructable>(Type: T) => CustomElementType<T>;

/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
export function customElement(definition: PartialCustomElementDefinition): CustomElementDecorator;
export function customElement(name: string): CustomElementDecorator;
export function customElement(nameOrDef: string | PartialCustomElementDefinition): CustomElementDecorator;
export function customElement(nameOrDef: string | PartialCustomElementDefinition): CustomElementDecorator {
  return function (target) {
    return CustomElement.define(nameOrDef, target);
  };
}

type ShadowOptions = Pick<PartialCustomElementDefinition, 'shadowOptions'>['shadowOptions'];

/**
 * Decorator: Indicates that the custom element should render its view in ShadowDOM.
 */
export function useShadowDOM(options?: ShadowOptions): (target: Constructable) => void;
/**
 * Decorator: Indicates that the custom element should render its view in ShadowDOM.
 */
export function useShadowDOM(target: Constructable): void;
export function useShadowDOM(targetOrOptions?: Constructable | ShadowOptions): void | ((target: Constructable) => void) {
  if (targetOrOptions === void 0) {
    return function ($target: Constructable) {
      annotateElementMetadata($target, 'shadowOptions', { mode: 'open' });
    };
  }

  if (typeof targetOrOptions !== 'function') {
    return function ($target: Constructable) {
      annotateElementMetadata($target, 'shadowOptions', targetOrOptions);
    };
  }

  annotateElementMetadata(targetOrOptions, 'shadowOptions', { mode: 'open' });
}

/**
 * Decorator: Indicates that the custom element should be rendered without its element container.
 */
export function containerless(target: Constructable): void;
/**
 * Decorator: Indicates that the custom element should be rendered without its element container.
 */
export function containerless(): (target: Constructable) => void;
export function containerless(target?: Constructable): void | ((target: Constructable) => void) {
  if (target === void 0) {
    return function ($target: Constructable) {
      annotateElementMetadata($target, 'containerless', true);
    };
  }

  annotateElementMetadata(target, 'containerless', true);
}

/**
 * Decorator: Indicates that the custom element should be rendered with the strict binding option. undefined/null -> 0 or '' based on type
 */
export function strict(target: Constructable): void;
/**
 * Decorator: Indicates that the custom element should be rendered with the strict binding option. undefined/null -> 0 or '' based on type
 */
export function strict(): (target: Constructable) => void;
export function strict(target?: Constructable): void | ((target: Constructable) => void) {
  if (target === void 0) {
    return function ($target: Constructable) {
      annotateElementMetadata($target, 'isStrictBinding', true);
    };
  }

  annotateElementMetadata(target, 'isStrictBinding', true);
}

const definitionLookup = new WeakMap<PartialCustomElementDefinition, CustomElementDefinition>();

export class CustomElementDefinition<C extends Constructable = Constructable> implements ResourceDefinition<C, ICustomElementViewModel, PartialCustomElementDefinition> {
  public get type(): DefinitionType.Element { return DefinitionType.Element; }
  private constructor(
    public readonly Type: CustomElementType<C>,
    public readonly name: string,
    public readonly aliases: string[],
    public readonly key: string,
    public readonly cache: '*' | number,
    public readonly template: null | string | Node,
    public readonly instructions: readonly (readonly IInstruction[])[],
    public readonly dependencies: readonly Key[],
    public readonly injectable: InjectableToken<C> | null,
    public readonly needsCompile: boolean,
    public readonly surrogates: readonly IInstruction[],
    public readonly bindables: Record<string, BindableDefinition>,
    public readonly childrenObservers: Record<string, ChildrenDefinition>,
    public readonly containerless: boolean,
    public readonly isStrictBinding: boolean,
    public readonly shadowOptions: { mode: 'open' | 'closed' } | null,
    public readonly hasSlots: boolean,
    public readonly enhance: boolean,
    public readonly watches: IWatchDefinition[],
    public readonly processContent: ProcessContentHook | null,
  ) {}

  public static create<T extends Constructable = Constructable>(
    def: PartialCustomElementDefinition,
    Type?: null,
  ): CustomElementDefinition;
  public static create<T extends Constructable = Constructable>(
    name: string,
    Type: CustomElementType,
  ): CustomElementDefinition;
  public static create<T extends Constructable = Constructable>(
    nameOrDef: string | PartialCustomElementDefinition,
    Type?: CustomElementType | null,
  ): CustomElementDefinition;
  public static create<T extends Constructable = Constructable>(
    nameOrDef: string | PartialCustomElementDefinition,
    Type: CustomElementType | null = null,
  ): CustomElementDefinition {
    if (Type === null) {
      const def = nameOrDef;
      if (typeof def === 'string') {
        if (__DEV__)
          throw new Error(`Cannot create a custom element definition with only a name and no type: ${nameOrDef}`);
        else
          throw new Error(`AUR0761:${nameOrDef}`);
      }

      const name = fromDefinitionOrDefault('name', def, generateElementName);
      if (typeof (def as CustomElementDefinition).Type === 'function') {
        // This needs to be a clone (it will usually be the compiler calling this signature)

        // TODO: we need to make sure it's documented that passing in the type via the definition (while passing in null
        // as the "Type" parameter) effectively skips type analysis, so it should only be used this way for cloning purposes.
        Type = (def as CustomElementDefinition).Type as CustomElementType;
      } else {
        Type = CustomElement.generateType(pascalCase(name)) as CustomElementType;
      }

      return new CustomElementDefinition(
        Type,
        name,
        mergeArrays(def.aliases),
        fromDefinitionOrDefault('key', def as CustomElementDefinition, () => CustomElement.keyFrom(name)),
        fromDefinitionOrDefault('cache', def, returnZero),
        fromDefinitionOrDefault('template', def, returnNull),
        mergeArrays(def.instructions),
        mergeArrays(def.dependencies),
        fromDefinitionOrDefault('injectable', def, returnNull),
        fromDefinitionOrDefault('needsCompile', def, returnTrue),
        mergeArrays(def.surrogates),
        Bindable.from(def.bindables),
        Children.from(def.childrenObservers),
        fromDefinitionOrDefault('containerless', def, returnFalse),
        fromDefinitionOrDefault('isStrictBinding', def, returnFalse),
        fromDefinitionOrDefault('shadowOptions', def, returnNull),
        fromDefinitionOrDefault('hasSlots', def, returnFalse),
        fromDefinitionOrDefault('enhance', def, returnFalse),
        fromDefinitionOrDefault('watches', def as CustomElementDefinition, returnEmptyArray),
        fromAnnotationOrTypeOrDefault('processContent', Type, returnNull),
      );
    }

    // If a type is passed in, we ignore the Type property on the definition if it exists.
    // TODO: document this behavior

    if (typeof nameOrDef === 'string') {
      return new CustomElementDefinition(
        Type,
        nameOrDef,
        mergeArrays(getElementAnnotation(Type, 'aliases'), Type.aliases),
        CustomElement.keyFrom(nameOrDef),
        fromAnnotationOrTypeOrDefault('cache', Type, returnZero),
        fromAnnotationOrTypeOrDefault('template', Type, returnNull),
        mergeArrays(getElementAnnotation(Type, 'instructions'), Type.instructions),
        mergeArrays(getElementAnnotation(Type, 'dependencies'), Type.dependencies),
        fromAnnotationOrTypeOrDefault('injectable', Type, returnNull),
        fromAnnotationOrTypeOrDefault('needsCompile', Type, returnTrue),
        mergeArrays(getElementAnnotation(Type, 'surrogates'), Type.surrogates),
        Bindable.from(
          ...Bindable.getAll(Type),
          getElementAnnotation(Type, 'bindables'),
          Type.bindables,
        ),
        Children.from(
          ...Children.getAll(Type),
          getElementAnnotation(Type, 'childrenObservers'),
          Type.childrenObservers,
        ),
        fromAnnotationOrTypeOrDefault('containerless', Type, returnFalse),
        fromAnnotationOrTypeOrDefault('isStrictBinding', Type, returnFalse),
        fromAnnotationOrTypeOrDefault('shadowOptions', Type, returnNull),
        fromAnnotationOrTypeOrDefault('hasSlots', Type, returnFalse),
        fromAnnotationOrTypeOrDefault('enhance', Type, returnFalse),
        mergeArrays(Watch.getAnnotation(Type), Type.watches),
        fromAnnotationOrTypeOrDefault('processContent', Type, returnNull),
      );
    }

    // This is the typical default behavior, e.g. from regular CustomElement.define invocations or from @customElement deco
    // The ViewValueConverter also uses this signature and passes in a definition where everything except for the 'hooks'
    // property needs to be copied. So we have that exception for 'hooks', but we may need to revisit that default behavior
    // if this turns out to be too opinionated.

    const name = fromDefinitionOrDefault('name', nameOrDef, generateElementName);
    return new CustomElementDefinition(
      Type,
      name,
      mergeArrays(getElementAnnotation(Type, 'aliases'), nameOrDef.aliases, Type.aliases),
      CustomElement.keyFrom(name),
      fromAnnotationOrDefinitionOrTypeOrDefault('cache', nameOrDef, Type, returnZero),
      fromAnnotationOrDefinitionOrTypeOrDefault('template', nameOrDef, Type, returnNull),
      mergeArrays(getElementAnnotation(Type, 'instructions'), nameOrDef.instructions, Type.instructions),
      mergeArrays(getElementAnnotation(Type, 'dependencies'), nameOrDef.dependencies, Type.dependencies),
      fromAnnotationOrDefinitionOrTypeOrDefault('injectable', nameOrDef, Type, returnNull),
      fromAnnotationOrDefinitionOrTypeOrDefault('needsCompile', nameOrDef, Type, returnTrue),
      mergeArrays(getElementAnnotation(Type, 'surrogates'), nameOrDef.surrogates, Type.surrogates),
      Bindable.from(
        ...Bindable.getAll(Type),
        getElementAnnotation(Type, 'bindables'),
        Type.bindables,
        nameOrDef.bindables,
      ),
      Children.from(
        ...Children.getAll(Type),
        getElementAnnotation(Type, 'childrenObservers'),
        Type.childrenObservers,
        nameOrDef.childrenObservers,
      ),
      fromAnnotationOrDefinitionOrTypeOrDefault('containerless', nameOrDef, Type, returnFalse),
      fromAnnotationOrDefinitionOrTypeOrDefault('isStrictBinding', nameOrDef, Type, returnFalse),
      fromAnnotationOrDefinitionOrTypeOrDefault('shadowOptions', nameOrDef, Type, returnNull),
      fromAnnotationOrDefinitionOrTypeOrDefault('hasSlots', nameOrDef, Type, returnFalse),
      fromAnnotationOrDefinitionOrTypeOrDefault('enhance', nameOrDef, Type, returnFalse),
      mergeArrays(nameOrDef.watches, Watch.getAnnotation(Type), Type.watches),
      fromAnnotationOrDefinitionOrTypeOrDefault('processContent', nameOrDef, Type, returnNull),
    );
  }

  public static getOrCreate(partialDefinition: PartialCustomElementDefinition): CustomElementDefinition {
    if (partialDefinition instanceof CustomElementDefinition) {
      return partialDefinition;
    }

    if (definitionLookup.has(partialDefinition)) {
      return definitionLookup.get(partialDefinition)!;
    }

    const definition = CustomElementDefinition.create(partialDefinition);
    definitionLookup.set(partialDefinition, definition);
    // Make sure the full definition can be retrieved from dynamically created classes as well
    defineMetadata(ceBaseName, definition, definition.Type);
    return definition;
  }

  public register(container: IContainer): void {
    const { Type, key, aliases } = this;
    if (!container.has(key, false)) {
      Registration.transient(key, Type).register(container);
      Registration.aliasTo(key, Type).register(container);
      registerAliases(aliases, CustomElement, key, container);
    }
  }
}

export type InjectableToken<K = any> = (target: Injectable<K>, property: string, index: number) => void;
type InternalInjectableToken<K = any> = InjectableToken<K> & {
  register?(container: IContainer): IResolver<K>;
};

type ForOpts = {
  name?: string;
  searchParents?: boolean;
  optional?: boolean;
};
const defaultForOpts: ForOpts = {
  name: undefined,
  searchParents: false,
  optional: false,
};
const returnZero = () => 0;
const returnNull = <T>(): T | null | any => null;
const returnFalse = () => false;
const returnTrue = () => true;
const returnEmptyArray = () => emptyArray;

const ceBaseName = getResourceKeyFor('custom-element');
const getElementKeyFrom = (name: string): string => `${ceBaseName}:${name}`;
const generateElementName = (() => {
  let id = 0;

  return () => `unnamed-${++id}`;
})();
const annotateElementMetadata = <K extends keyof PartialCustomElementDefinition>(Type: Constructable, prop: K, value: PartialCustomElementDefinition[K]): void => {
  defineMetadata(getAnnotationKeyFor(prop), value, Type);
};
const getElementAnnotation = <K extends keyof PartialCustomElementDefinition>(
  Type: Constructable,
  prop: K
): PartialCustomElementDefinition[K] => getOwnMetadata(getAnnotationKeyFor(prop), Type);

export const CustomElement = Object.freeze<CustomElementKind>({
  name: ceBaseName,
  keyFrom: getElementKeyFrom,
  isType<C>(value: C): value is (C extends Constructable ? CustomElementType<C> : never) {
    return typeof value === 'function' && hasOwnMetadata(ceBaseName, value);
  },
  for<C extends ICustomElementViewModel = ICustomElementViewModel>(node: Node, opts: ForOpts = defaultForOpts): ICustomElementController<C> {
    if (opts.name === void 0 && opts.searchParents !== true) {
      const controller = getRef(node, ceBaseName) as Controller<C> | null;
      if (controller === null) {
        if (opts.optional === true) {
          return null!;
        }
        if (__DEV__)
          throw new Error(`The provided node is not a custom element or containerless host.`);
        else
          throw new Error('AUR0762');
      }
      return controller as unknown as ICustomElementController<C>;
    }
    if (opts.name !== void 0) {
      if (opts.searchParents !== true) {
        const controller = getRef(node, ceBaseName) as Controller<C> | null;
        if (controller === null) {
          if (__DEV__)
            throw new Error(`The provided node is not a custom element or containerless host.`);
          else
            throw new Error('AUR0763');
        }

        if (controller.is(opts.name)) {
          return controller as unknown as ICustomElementController<C>;
        }

        return (void 0)!;
      }

      let cur = node as INode | null;
      let foundAController = false;
      while (cur !== null) {
        const controller = getRef(cur, ceBaseName) as Controller<C> | null;
        if (controller !== null) {
          foundAController = true;
          if (controller.is(opts.name)) {
            return controller as unknown as ICustomElementController<C>;
          }
        }

        cur = getEffectiveParentNode(cur);
      }

      if (foundAController) {
        return (void 0)!;
      }

      if (__DEV__)
        throw new Error(`The provided node does does not appear to be part of an Aurelia app DOM tree, or it was added to the DOM in a way that Aurelia cannot properly resolve its position in the component tree.`);
      else
        throw new Error('AUR0764');
    }

    let cur = node as INode | null;
    while (cur !== null) {
      const controller = getRef(cur, ceBaseName) as Controller<C> | null;
      if (controller !== null) {
        return controller as unknown as ICustomElementController<C>;
      }

      cur = getEffectiveParentNode(cur);
    }

    if (__DEV__)
      throw new Error(`The provided node does does not appear to be part of an Aurelia app DOM tree, or it was added to the DOM in a way that Aurelia cannot properly resolve its position in the component tree.`);
    else
      throw new Error('AUR0765');
  },
  define<C extends Constructable>(nameOrDef: string | PartialCustomElementDefinition, Type?: C | null): CustomElementType<C> {
    const definition = CustomElementDefinition.create(nameOrDef, Type as Constructable | null);
    defineMetadata(ceBaseName, definition, definition.Type);
    defineMetadata(ceBaseName, definition, definition);
    appendResourceKey(definition.Type, ceBaseName);

    return definition.Type as CustomElementType<C>;
  },
  getDefinition<C extends Constructable>(Type: C): CustomElementDefinition<C> {
    const def = getOwnMetadata(ceBaseName, Type) as CustomElementDefinition<C>;
    if (def === void 0) {
      if (__DEV__)
        throw new Error(`No definition found for type ${Type.name}`);
      else
        throw new Error(`AUR0760:${Type.name}`);
    }

    return def;
  },
  annotate: annotateElementMetadata,
  getAnnotation: getElementAnnotation,
  generateName: generateElementName,
  createInjectable<K extends Key = Key>(): InjectableToken<K> {
    const $injectable: InternalInjectableToken<K> = function (target, property, index): any {
      const annotationParamtypes = DI.getOrCreateAnnotationParamTypes(target);
      annotationParamtypes[index] = $injectable;
      return target;
    };

    $injectable.register = function (container) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return {
        resolve(container, requestor) {
          if (requestor.has($injectable, true)) {
            return requestor.get($injectable);
          } else {
            return null;
          }
        },
      } as IResolver;
    };

    return $injectable;
  },
  generateType: (function () {
    const nameDescriptor: PropertyDescriptor = {
      value: '',
      writable: false,
      enumerable: false,
      configurable: true,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defaultProto = {} as any;

    return function <P extends {} = {}> (
      name: string,
      proto: P = defaultProto,
    ): CustomElementType<Constructable<P>> {
      // Anonymous class ensures that minification cannot cause unintended side-effects, and keeps the class
      // looking similarly from the outside (when inspected via debugger, etc).
      const Type = class {} as CustomElementType<Constructable<P>>;

      // Define the name property so that Type.name can be used by end users / plugin authors if they really need to,
      // even when minified.
      nameDescriptor.value = name;
      Reflect.defineProperty(Type, 'name', nameDescriptor);

      // Assign anything from the prototype that was passed in
      if (proto !== defaultProto) {
        Object.assign(Type.prototype, proto);
      }

      return Type;
    };
  })(),
});

type DecoratorFactoryMethod<TClass> = (target: Constructable<TClass>, propertyKey: string, descriptor: PropertyDescriptor) => void;
type ProcessContentHook = (node: INode, platform: IPlatform) => boolean | void;

const pcHookMetadataProperty = getAnnotationKeyFor('processContent');
export function processContent(hook: ProcessContentHook): CustomElementDecorator;
export function processContent<TClass>(): DecoratorFactoryMethod<TClass>;
export function processContent<TClass>(hook?: ProcessContentHook): CustomElementDecorator | DecoratorFactoryMethod<TClass> {
  return hook === void 0
    ? function (target: Constructable<TClass>, propertyKey: string, _descriptor: PropertyDescriptor) {
      defineMetadata(pcHookMetadataProperty, ensureHook(target, propertyKey), target);
    }
    : function (target: Constructable<TClass>) {
      hook = ensureHook(target, hook!);
      const def = getOwnMetadata(ceBaseName, target) as CustomElementDefinition<Constructable<TClass>>;
      if (def !== void 0) {
        (def as Writable<CustomElementDefinition<Constructable<TClass>>>).processContent = hook;
      } else {
        defineMetadata(pcHookMetadataProperty, hook, target);
      }
      return target;
    };
}

function ensureHook<TClass>(target: Constructable<TClass>, hook: string | ProcessContentHook): ProcessContentHook {
  if (typeof hook === 'string') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
    hook = (target as any)[hook] as ProcessContentHook;
  }

  const hookType = typeof hook;
  if (hookType !== 'function') {
    if (__DEV__)
      throw new Error(`Invalid @processContent hook. Expected the hook to be a function (when defined in a class, it needs to be a static function) but got a ${hookType}.`);
    else
      throw new Error(`AUR0766:${hookType}`);
  }
  return hook;
}
