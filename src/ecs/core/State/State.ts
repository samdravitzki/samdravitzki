type Transistion = "on-enter" | "on-exit";

type ChangeListener<T> = (to: T, from: T) => void;

class State<T> {
  private _value: T;

  private _transitionListeners = new Map<
    T,
    Record<Transistion, (() => void)[]>
  >();
  private _changeListeners: ChangeListener<T>[] = [];

  constructor(startingValue: T) {
    this._value = startingValue;
    this.handleEnter(this._value);
  }

  get value() {
    return this._value;
  }

  /**
   * Register a callback that will be invoked anytime the state
   * changes
   *
   * @param listener
   */
  onChange(listener: ChangeListener<T>) {
    this._changeListeners.push(listener);
  }

  /**
   * Register a callback that will be invoked when the specified
   * change in state occurs
   *
   * i.e. when a particular state exits, call the supplied function
   * @param value
   * @param stateChange
   * @param listener
   */
  onTransition(value: T, stateChange: Transistion, listener: () => void) {
    if (!this._transitionListeners.has(value)) {
      this._transitionListeners.set(value, {
        "on-enter": [],
        "on-exit": [],
      });
    }

    // Call listener if the current state matches what is supplied and it triggers 'on-enter'
    // Not sure if this behaviour should stick around, there may be better ways to handle when you want to trigger something if its registered to trigger in the state it currently is in
    if (value === this._value && stateChange === "on-enter") {
      listener();
    }

    const listeners = this._transitionListeners.get(value)!;
    listeners[stateChange].push(listener);
  }

  /**
   * Trigger on-enter listeners asscociated with value of state
   */
  private handleEnter(value: T) {
    const listeners = this._transitionListeners.get(value)?.["on-enter"];

    if (listeners !== undefined) {
      listeners.forEach((listener) => listener());
    }
  }

  /**
   * Trigger on-exit listeners asscociated with value of state
   */
  private handleExit(value: T) {
    const listeners = this._transitionListeners.get(value)?.["on-exit"];

    if (listeners !== undefined) {
      listeners.forEach((listener) => listener());
    }
  }

  private handleTransition(to: T, from: T) {
    this._changeListeners.forEach((listener) => listener(to, from));
  }

  setValue(newValue: T) {
    let oldValue = this._value;

    if (newValue === oldValue) {
      return;
    }

    this.handleExit(this._value);
    this._value = newValue;
    this.handleTransition(this._value, oldValue);
    this.handleEnter(this._value);
  }
}

export default State;
export type { Transistion, ChangeListener };
