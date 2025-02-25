import { DI, emptyArray, Protocol, Registration, all } from '@aurelia/kernel';
import { appendAnnotationKey, appendResourceKey, defineMetadata, getResourceKeyFor } from '../shared.js';
import type { Class, Constructable, IContainer, ResourceDefinition, ResourceType } from '@aurelia/kernel';

export interface AttributePatternDefinition {
  pattern: string;
  symbols: string;
}

/** @internal */
export interface ICharSpec {
  chars: string;
  repeat: boolean;
  isSymbol: boolean;
  isInverted: boolean;
  has(char: string): boolean;
  equals(other: ICharSpec): boolean;
}

export class CharSpec implements ICharSpec {
  public has: (char: string) => boolean;

  public constructor(
    public chars: string,
    public repeat: boolean,
    public isSymbol: boolean,
    public isInverted: boolean,
  ) {
    if (isInverted) {
      switch (chars.length) {
        case 0:
          this.has = this._hasOfNoneInverse;
          break;
        case 1:
          this.has = this._hasOfSingleInverse;
          break;
        default:
          this.has = this._hasOfMultipleInverse;
      }
    } else {
      switch (chars.length) {
        case 0:
          this.has = this._hasOfNone;
          break;
        case 1:
          this.has = this._hasOfSingle;
          break;
        default:
          this.has = this._hasOfMultiple;
      }
    }
  }

  public equals(other: ICharSpec): boolean {
    return this.chars === other.chars
      && this.repeat === other.repeat
      && this.isSymbol === other.isSymbol
      && this.isInverted === other.isInverted;
  }

  private _hasOfMultiple(char: string): boolean {
    return this.chars.includes(char);
  }

  private _hasOfSingle(char: string): boolean {
    return this.chars === char;
  }

  private _hasOfNone(char: string): boolean {
    return false;
  }

  private _hasOfMultipleInverse(char: string): boolean {
    return !this.chars.includes(char);
  }

  private _hasOfSingleInverse(char: string): boolean {
    return this.chars !== char;
  }

  private _hasOfNoneInverse(char: string): boolean {
    return true;
  }
}

export class Interpretation {
  public parts: readonly string[] = emptyArray;
  public get pattern(): string | null {
    const value = this._pattern;
    if (value === '') {
      return null;
    } else {
      return value;
    }
  }
  public set pattern(value: string | null) {
    if (value == null) {
      this._pattern = '';
      this.parts = emptyArray;
    } else {
      this._pattern = value;
      this.parts = this._partsRecord[value];
    }
  }
  /** @internal */
  private _pattern: string = '';
  /** @internal */
  private readonly _currentRecord: Record<string, string> = {};
  /** @internal */
  private readonly _partsRecord: Record<string, string[]> = {};

  public append(pattern: string, ch: string): void {
    const currentRecord = this._currentRecord;
    if (currentRecord[pattern] === undefined) {
      currentRecord[pattern] = ch;
    } else {
      currentRecord[pattern] += ch;
    }
  }

  public next(pattern: string): void {
    const currentRecord = this._currentRecord;
    let partsRecord: Interpretation['_partsRecord'];

    if (currentRecord[pattern] !== undefined) {
      partsRecord = this._partsRecord;
      if (partsRecord[pattern] === undefined) {
        partsRecord[pattern] = [currentRecord[pattern]];
      } else {
        partsRecord[pattern].push(currentRecord[pattern]);
      }
      currentRecord[pattern] = undefined!;
    }
  }
}

/** @internal */
export class State {
  public nextStates: State[] = [];
  public types: SegmentTypes | null = null;
  public patterns: string[];
  public isEndpoint: boolean = false;
  public get pattern(): string | null {
    return this.isEndpoint ? this.patterns[0] : null;
  }

  public constructor(
    public charSpec: ICharSpec,
    ...patterns: string[]
  ) {
    this.patterns = patterns;
  }

  public findChild(charSpec: ICharSpec): State {
    const nextStates = this.nextStates;
    const len = nextStates.length;
    let child: State = null!;
    let i = 0;
    for (; i < len; ++i) {
      child = nextStates[i];
      if (charSpec.equals(child.charSpec)) {
        return child;
      }
    }
    return null!;
  }

  public append(charSpec: ICharSpec, pattern: string): State {
    const patterns = this.patterns;
    if (!patterns.includes(pattern)) {
      patterns.push(pattern);
    }
    let state = this.findChild(charSpec);
    if (state == null) {
      state = new State(charSpec, pattern);
      this.nextStates.push(state);
      if (charSpec.repeat) {
        state.nextStates.push(state);
      }
    }
    return state;
  }

  public findMatches(ch: string, interpretation: Interpretation): State[] {
    // TODO: reuse preallocated arrays
    const results = [];
    const nextStates = this.nextStates;
    const len = nextStates.length;
    let childLen = 0;
    let child: State = null!;
    let i = 0;
    let j = 0;
    for (; i < len; ++i) {
      child = nextStates[i];
      if (child.charSpec.has(ch)) {
        results.push(child);
        childLen = child.patterns.length;
        j = 0;
        if (child.charSpec.isSymbol) {
          for (; j < childLen; ++j) {
            interpretation.next(child.patterns[j]);
          }
        } else {
          for (; j < childLen; ++j) {
            interpretation.append(child.patterns[j], ch);
          }
        }
      }
    }
    return results;
  }
}

/** @internal */
export interface ISegment {
  text: string;
  eachChar(callback: (spec: CharSpec) => void): void;
}

/** @internal */
export class StaticSegment implements ISegment {
  private readonly len: number;
  private readonly specs: CharSpec[];

  public constructor(
    public text: string,
  ) {
    const len = this.len = text.length;
    const specs = this.specs = [] as CharSpec[];
    let i = 0;
    for (; len > i; ++i) {
      specs.push(new CharSpec(text[i], false, false, false));
    }
  }

  public eachChar(callback: (spec: CharSpec) => void): void {
    const len = this.len;
    const specs = this.specs;
    let i = 0;
    for (; len > i; ++i) {
      callback(specs[i]);
    }
  }
}

/** @internal */
export class DynamicSegment implements ISegment {
  public text: string = 'PART';
  private readonly spec: CharSpec;

  public constructor(symbols: string) {
    this.spec = new CharSpec(symbols, true, false, true);
  }

  public eachChar(callback: (spec: CharSpec) => void): void {
    callback(this.spec);
  }
}

/** @internal */
export class SymbolSegment implements ISegment {
  private readonly spec: CharSpec;

  public constructor(
    public text: string,
  ) {
    this.spec = new CharSpec(text, false, true, false);
  }

  public eachChar(callback: (spec: CharSpec) => void): void {
    callback(this.spec);
  }
}

export class SegmentTypes {
  public statics: number = 0;
  public dynamics: number = 0;
  public symbols: number = 0;
}

export interface ISyntaxInterpreter extends SyntaxInterpreter {}
export const ISyntaxInterpreter = DI.createInterface<ISyntaxInterpreter>('ISyntaxInterpreter', x => x.singleton(SyntaxInterpreter));

export class SyntaxInterpreter {
  public rootState: State = new State(null!);
  private readonly initialStates: State[] = [this.rootState];

  // todo: this only works if this method is ever called only once
  public add(defs: AttributePatternDefinition[]): void {
    defs = defs.slice(0).sort((d1, d2) => d1.pattern > d2.pattern ? 1 : -1);
    const ii = defs.length;
    let currentState: State;
    let def: AttributePatternDefinition;
    let pattern: string;
    let types: SegmentTypes;
    let segments: ISegment[];
    let len: number;
    let charSpecCb: (ch: ICharSpec) => void;
    let i = 0;
    let j: number;
    while (ii > i) {
      currentState = this.rootState;
      def = defs[i];
      pattern = def.pattern;
      types = new SegmentTypes();
      segments = this.parse(def, types);
      len = segments.length;
      charSpecCb = (ch: ICharSpec) => {
        currentState = currentState.append(ch, pattern);
      };
      for (j = 0; len > j; ++j) {
        segments[j].eachChar(charSpecCb);
      }
      currentState.types = types;
      currentState.isEndpoint = true;
      ++i;
    }
  }

  public interpret(name: string): Interpretation {
    const interpretation = new Interpretation();
    const len = name.length;
    let states = this.initialStates;
    let i = 0;
    let state: State;
    for (; i < len; ++i) {
      states = this.getNextStates(states, name.charAt(i), interpretation);
      if (states.length === 0) {
        break;
      }
    }

    states = states.filter(isEndpoint);

    if (states.length > 0) {
      states.sort(sortEndpoint);
      state = states[0];
      if (!state.charSpec.isSymbol) {
        interpretation.next(state.pattern!);
      }
      interpretation.pattern = state.pattern;
    }
    return interpretation;
  }

  public getNextStates(states: State[], ch: string, interpretation: Interpretation): State[] {
    // TODO: reuse preallocated arrays
    const nextStates: State[] = [];
    let state: State = null!;
    const len = states.length;
    let i = 0;
    for (; i < len; ++i) {
      state = states[i];
      nextStates.push(...state.findMatches(ch, interpretation));
    }

    return nextStates;
  }

  private parse(def: AttributePatternDefinition, types: SegmentTypes): ISegment[] {
    const result = [];
    const pattern = def.pattern;
    const len = pattern.length;
    const symbols = def.symbols;
    let i = 0;
    let start = 0;
    let c = '';

    while (i < len) {
      c = pattern.charAt(i);
      if (symbols.length === 0 || !symbols.includes(c)) {
        if (i === start) {
          if (c === 'P' && pattern.slice(i, i + 4) === 'PART') {
            start = i = (i + 4);
            result.push(new DynamicSegment(symbols));
            ++types.dynamics;
          } else {
            ++i;
          }
        } else {
          ++i;
        }
      } else if (i !== start) {
        result.push(new StaticSegment(pattern.slice(start, i)));
        ++types.statics;
        start = i;
      } else {
        result.push(new SymbolSegment(pattern.slice(start, i + 1)));
        ++types.symbols;
        start = ++i;
      }
    }
    if (start !== i) {
      result.push(new StaticSegment(pattern.slice(start, i)));
      ++types.statics;
    }

    return result;
  }
}

function isEndpoint(a: State) {
  return a.isEndpoint;
}

function sortEndpoint(a: State, b: State) {
  // both a and b are endpoints
  // compare them based on the number of static, then dynamic & symbol fragments
  const aTypes = a.types!;
  const bTypes = b.types!;
  if (aTypes.statics !== bTypes.statics) {
    return bTypes.statics - aTypes.statics;
  }
  if (aTypes.dynamics !== bTypes.dynamics) {
    return bTypes.dynamics - aTypes.dynamics;
  }
  if (aTypes.symbols !== bTypes.symbols) {
    return bTypes.symbols - aTypes.symbols;
  }
  return 0;
}

export class AttrSyntax {
  public constructor(
    public rawName: string,
    public rawValue: string,
    public target: string,
    public command: string | null,
  ) {}
}

export interface IAttributePattern {
  [pattern: string]: (rawName: string, rawValue: string, parts: readonly string[]) => AttrSyntax;
}

export const IAttributePattern = DI.createInterface<IAttributePattern>('IAttributePattern');

export interface IAttributeParser extends AttributeParser {}
export const IAttributeParser = DI.createInterface<IAttributeParser>('IAttributeParser', x => x.singleton(AttributeParser));

export class AttributeParser {
  /** @internal */
  protected static inject = [ISyntaxInterpreter, all(IAttributePattern)];

  /** @internal */
  private readonly _cache: Record<string, Interpretation> = {};
  /**
   * A 2 level record with the same key on both levels.
   * Just a trick to maintain `this` + have simple lookup + support multi patterns per class definition
   *
   * @internal
   */
  private readonly _patterns: Record<string, IAttributePattern>;
  /** @internal */
  private readonly _interpreter: ISyntaxInterpreter;

  public constructor(
    interpreter: ISyntaxInterpreter,
    attrPatterns: IAttributePattern[],
  ) {
    this._interpreter = interpreter;
    const patterns: AttributeParser['_patterns'] = this._patterns = {};
    const allDefs = attrPatterns.reduce<AttributePatternDefinition[]>(
      (allDefs, attrPattern) => {
        const patternDefs = getAllPatternDefinitions(attrPattern.constructor as Constructable);
        patternDefs.forEach(def => patterns[def.pattern] = attrPattern);
        return allDefs.concat(patternDefs);
      },
      emptyArray
    );
    interpreter.add(allDefs);
  }

  public parse(name: string, value: string): AttrSyntax {
    let interpretation = this._cache[name];
    if (interpretation == null) {
      interpretation = this._cache[name] = this._interpreter.interpret(name);
    }
    const pattern = interpretation.pattern;
    if (pattern == null) {
      return new AttrSyntax(name, value, name, null);
    } else {
      return this._patterns[pattern][pattern](name, value, interpretation.parts);
    }
  }
}

type DecoratableAttributePattern<TProto, TClass> = Class<TProto & Partial<{} | IAttributePattern>, TClass>;
type DecoratedAttributePattern<TProto, TClass> = Class<TProto & IAttributePattern, TClass>;

type AttributePatternDecorator = <TProto, TClass>(target: DecoratableAttributePattern<TProto, TClass>) => DecoratedAttributePattern<TProto, TClass>;

export interface AttributePattern {
  readonly name: string;
  readonly definitionAnnotationKey: string;
  define<TProto, TClass>(patternDefs: AttributePatternDefinition[], Type: DecoratableAttributePattern<TProto, TClass>): DecoratedAttributePattern<TProto, TClass>;
  getPatternDefinitions<TProto, TClass>(Type: DecoratedAttributePattern<TProto, TClass>): AttributePatternDefinition[];
}

export function attributePattern(...patternDefs: AttributePatternDefinition[]): AttributePatternDecorator {
  return function decorator<TProto, TClass>(target: DecoratableAttributePattern<TProto, TClass>): DecoratedAttributePattern<TProto, TClass> {
    return AttributePattern.define(patternDefs, target);
  } as AttributePatternDecorator;
}

export class AttributePatternResourceDefinition implements ResourceDefinition<Constructable, IAttributePattern> {
  public name: string = (void 0)!;

  public constructor(
    public Type: ResourceType<Constructable, Partial<IAttributePattern>>,
  ) { }

  public register(container: IContainer): void {
    Registration.singleton(IAttributePattern, this.Type).register(container);
  }
}

const apBaseName = getResourceKeyFor('attribute-pattern');
const annotationKey = 'attribute-pattern-definitions';
const getAllPatternDefinitions = <TProto, TClass>(Type: DecoratedAttributePattern<TProto, TClass>) =>
  Protocol.annotation.get(Type, annotationKey) as AttributePatternDefinition[];

export const AttributePattern = Object.freeze<AttributePattern>({
  name: apBaseName,
  definitionAnnotationKey: annotationKey,
  define<TProto, TClass>(
    patternDefs: AttributePatternDefinition[],
    Type: DecoratableAttributePattern<TProto, TClass>,
  ) {
    const definition = new AttributePatternResourceDefinition(Type);
    defineMetadata(apBaseName, definition, Type);
    appendResourceKey(Type, apBaseName);

    Protocol.annotation.set(Type, annotationKey, patternDefs);
    appendAnnotationKey(Type, annotationKey);

    return Type as DecoratedAttributePattern<TProto, TClass>;
  },
  getPatternDefinitions: getAllPatternDefinitions,
});

@attributePattern(
  { pattern: 'PART.PART', symbols: '.' },
  { pattern: 'PART.PART.PART', symbols: '.' }
)
export class DotSeparatedAttributePattern {
  public 'PART.PART'(rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], parts[1]);
  }

  public 'PART.PART.PART'(rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], parts[2]);
  }
}

@attributePattern(
  { pattern: 'ref', symbols: '' },
  { pattern: 'PART.ref', symbols: '.' }
)
export class RefAttributePattern {
  public 'ref'(rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, 'element', 'ref');
  }

  public 'PART.ref'(rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'ref');
  }
}

@attributePattern({ pattern: ':PART', symbols: ':' })
export class ColonPrefixedBindAttributePattern {
  public ':PART'(rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'bind');
  }
}

@attributePattern({ pattern: '@PART', symbols: '@' })
export class AtPrefixedTriggerAttributePattern {
  public '@PART'(rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'trigger');
  }
}
