import { camelCase } from '@aurelia/kernel';
import { TranslationBinding } from './translation-binding.js';
import {
  BindingMode,
  BindingType,
  IExpressionParser,
  IRenderer,
  renderer,
  IObserverLocator,
  IsBindingBehavior,
  IHydratableController,
  AttrSyntax,
  IPlatform,
  IAttrMapper,
  ICommandBuildInfo,
  CustomExpression,
} from '@aurelia/runtime-html';

import type {
  CallBindingInstruction,
  BindingCommandInstance,
} from '@aurelia/runtime-html';

export const TranslationInstructionType = 'tt';

export class TranslationAttributePattern {
  [key: string]: ((rawName: string, rawValue: string, parts: string[]) => AttrSyntax);

  public static registerAlias(alias: string) {
    this.prototype[alias] = function (rawName: string, rawValue: string, parts: string[]): AttrSyntax {
      return new AttrSyntax(rawName, rawValue, '', alias);
    };
  }
}

export class TranslationBindingInstruction {
  public readonly type: string = TranslationInstructionType;
  public mode: BindingMode.toView = BindingMode.toView;

  public constructor(
    public from: IsBindingBehavior,
    public to: string,
  ) { }
}

export class TranslationBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.CustomCommand = BindingType.CustomCommand;

  public static inject = [IAttrMapper];
  public constructor(private readonly m: IAttrMapper) {}

  public build(info: ICommandBuildInfo): TranslationBindingInstruction {
    let target: string;
    if (info.bindable == null) {
      target = this.m.map(info.node, info.attr.target)
        // if the mapper doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(info.attr.target);
    } else {
      target = info.bindable.property;
    }
    return new TranslationBindingInstruction(new CustomExpression(info.attr.rawValue) as IsBindingBehavior, target);
  }
}

@renderer(TranslationInstructionType)
export class TranslationBindingRenderer implements IRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly oL: IObserverLocator,
    @IPlatform private readonly p: IPlatform,
  ) { }

  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: CallBindingInstruction,
  ): void {
    TranslationBinding.create({
      parser: this.parser,
      observerLocator: this.oL,
      context: renderingCtrl.container,
      controller: renderingCtrl,
      target,
      instruction,
      platform: this.p,
    });
  }
}

export const TranslationBindInstructionType = 'tbt';

export class TranslationBindAttributePattern {
  [key: string]: ((rawName: string, rawValue: string, parts: string[]) => AttrSyntax);

  public static registerAlias(alias: string) {
    const bindPattern = `${alias}.bind`;
    this.prototype[bindPattern] = function (rawName: string, rawValue: string, parts: string[]): AttrSyntax {
      return new AttrSyntax(rawName, rawValue, parts[1], bindPattern);
    };
  }
}

export class TranslationBindBindingInstruction {
  public readonly type: string = TranslationBindInstructionType;
  public mode: BindingMode.toView = BindingMode.toView;

  public constructor(
    public from: IsBindingBehavior,
    public to: string,
  ) { }
}

export class TranslationBindBindingCommand implements BindingCommandInstance {
  public readonly bindingType: BindingType.BindCommand = BindingType.BindCommand;

  public static inject = [IAttrMapper, IExpressionParser];
  public constructor(
    private readonly m: IAttrMapper,
    private readonly xp: IExpressionParser,
  ) {}

  public build(info: ICommandBuildInfo): TranslationBindingInstruction {
    let target: string;
    if (info.bindable == null) {
      target = this.m.map(info.node, info.attr.target)
        // if the mapper doesn't know how to map it
        // use the default behavior, which is camel-casing
        ?? camelCase(info.attr.target);
    } else {
      target = info.bindable.property;
    }
    return new TranslationBindBindingInstruction(this.xp.parse(info.attr.rawValue, BindingType.BindCommand), target);
  }
}

@renderer(TranslationBindInstructionType)
export class TranslationBindBindingRenderer implements IRenderer {
  public constructor(
    @IExpressionParser private readonly parser: IExpressionParser,
    @IObserverLocator private readonly oL: IObserverLocator,
    @IPlatform private readonly p: IPlatform,
  ) { }

  public render(
    renderingCtrl: IHydratableController,
    target: HTMLElement,
    instruction: CallBindingInstruction,
  ): void {
    TranslationBinding.create({
      parser: this.parser,
      observerLocator: this.oL,
      context: renderingCtrl.container,
      controller: renderingCtrl,
      target,
      instruction,
      platform: this.p
    });
  }
}
