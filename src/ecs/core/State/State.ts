export type Transistion = "on-enter" | "on-exit";

export type ChangeListener<T> = (to: T, from: T) => void;

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

    // We can assume there is an entry for value because of the above line
    const valueStateListeners = this._transitionListeners.get(value)!;

    valueStateListeners[stateChange].push(listener);
  }

  /**
   * Trigger on-enter listeners asscociated with value of state
   */
  private handleEnter(value: T) {
    const valueStateListeners =
      this._transitionListeners.get(value)?.["on-enter"];

    if (valueStateListeners !== undefined) {
      valueStateListeners.forEach((listener) => listener());
    }
  }

  /**
   * Trigger on-exit listeners asscociated with value of state
   */
  private handleExit(value: T) {
    const valueStateListeners =
      this._transitionListeners.get(value)?.["on-exit"];

    if (valueStateListeners !== undefined) {
      valueStateListeners.forEach((listener) => listener());
    }
  }

  private handleTransition(to: T, from: T) {
    this._changeListeners.forEach((listener) => listener(to, from));
  }

  setValue(value: T) {
    this.handleExit(this._value);
    this.handleTransition(value, this._value);
    this._value = value;
    this.handleEnter(this._value);
  }
}

export default State;
export type { Transistion as StateChange };
