import { noop } from '@aurelia/kernel';
import { subscriberCollection, AccessorType, LifecycleFlags, withFlushQueue } from '@aurelia/runtime';

import type { IIndexable } from '@aurelia/kernel';
import type {
  InterceptorFunc,
  IObserver,
  ISubscriber,
  ISubscriberCollection,
  IFlushable,
  IWithFlushQueue,
  FlushQueue,
} from '@aurelia/runtime';
import type { IController } from '../templating/controller';

export interface BindableObserver extends IObserver, ISubscriberCollection {}

interface IMayHavePropertyChangedCallback {
  propertyChanged?(name: string, newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
}

type HasPropertyChangedCallback = Required<IMayHavePropertyChangedCallback>;

export class BindableObserver implements IFlushable, IWithFlushQueue {
  public get type(): AccessorType { return AccessorType.Observer; }
  // todo: name too long. just value/oldValue, or v/oV
  public value: unknown = void 0;
  /** @internal */
  private _oldValue: unknown = void 0;

  public queue!: FlushQueue;

  /** @internal */
  private _observing: boolean;
  private readonly cb: (newValue: unknown, oldValue: unknown, flags: LifecycleFlags) => void;
  /** @internal */
  private readonly _cbAll: HasPropertyChangedCallback['propertyChanged'];
  /** @internal */
  private readonly _hasCb: boolean;
  /** @internal */
  private readonly _hasCbAll: boolean;
  /** @internal */
  private readonly _hasSetter: boolean;
  private f: LifecycleFlags = LifecycleFlags.none;

  public constructor(
    public readonly obj: IIndexable,
    public readonly key: string,
    cbName: string,
    private readonly set: InterceptorFunc,
    // todo: a future feature where the observer is not instantiated via a controller
    // this observer can become more static, as in immediately available when used
    // in the form of a decorator
    public readonly $controller: IController | null,
  ) {
    const cb = obj[cbName] as typeof BindableObserver.prototype.cb;
    const cbAll = (obj as IMayHavePropertyChangedCallback).propertyChanged!;
    const hasCb = this._hasCb = typeof cb === 'function';
    const hasCbAll = this._hasCbAll = typeof cbAll === 'function';
    const hasSetter = this._hasSetter = set !== noop;

    this.cb = hasCb ? cb : noop;
    this._cbAll = hasCbAll ? cbAll : noop;
    // when user declare @bindable({ set })
    // it's expected to work from the start,
    // regardless where the assignment comes from: either direct view model assignment or from binding during render
    // so if either getter/setter config is present, alter the accessor straight await
    if (this.cb === void 0 && !hasCbAll && !hasSetter) {
      this._observing = false;
    } else {
      this._observing = true;

      const val = obj[key];
      this.value = hasSetter && val !== void 0 ? set(val) : val;
      this._createGetterSetter();
    }
  }

  public getValue(): unknown {
    return this.value;
  }

  public setValue(newValue: unknown, flags: LifecycleFlags): void {
    if (this._hasSetter) {
      newValue = this.set(newValue);
    }

    if (this._observing) {
      const currentValue = this.value;
      if (Object.is(newValue, currentValue)) {
        return;
      }
      this.value = newValue;
      this._oldValue = currentValue;
      this.f = flags;
      // todo: controller (if any) state should determine the invocation instead
      if (/* either not instantiated via a controller */this.$controller == null
        /* or the controller instantiating this is bound */|| this.$controller.isBound
      ) {
        if (this._hasCb) {
          this.cb.call(this.obj, newValue, currentValue, flags);
        }
        if (this._hasCbAll) {
          this._cbAll.call(this.obj, this.key, newValue, currentValue, flags);
        }
      }
      this.queue.add(this);
      // this.subs.notify(newValue, currentValue, flags);
    } else {
      // See SetterObserver.setValue for explanation
      this.obj[this.key] = newValue;
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (!this._observing === false) {
      this._observing = true;
      const currentValue = this.obj[this.key];
      this.value = this._hasSetter
        ? this.set(currentValue)
        : currentValue;
      this._createGetterSetter();
    }

    this.subs.add(subscriber);
  }

  public flush(): void {
    oV = this._oldValue;
    this._oldValue = this.value;
    this.subs.notify(this.value, oV, this.f);
  }

  /** @internal */
  private _createGetterSetter(): void {
    Reflect.defineProperty(
      this.obj,
      this.key,
      {
        enumerable: true,
        configurable: true,
        get: (/* Bindable Observer */) => this.value,
        set: (/* Bindable Observer */value: unknown) => {
          this.setValue(value, LifecycleFlags.none);
        }
      }
    );
  }
}

subscriberCollection(BindableObserver);
withFlushQueue(BindableObserver);

// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV: unknown = void 0;
