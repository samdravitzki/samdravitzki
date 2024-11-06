type StateChange = 'on-enter' | 'on-exit';

class State<T> {
    private _value: T;

    private _listeners = new Map<T, Record<StateChange, (() => void)[]>>();

    constructor(startingValue: T) {
        this._value = startingValue;
        this.handleEnter(this._value);
    }

    get value() {
        return this._value;
    }

    /**
     * Register a callback that will be invoked when the change in
     * state specified by the user occurs
     * 
     * i.e. when a particular state exits, call the supplied function
     * @param stateChange 
     * @param listener 
     */
    registerListener(value: T, stateChange: StateChange, listener: () => void) {
        if (!this._listeners.has(value)) {
            this._listeners.set(value, {
                'on-enter': [],
                'on-exit': []
            });
        }

        // Call listener if the current state matches what is supplied and it triggers 'on-enter'
        // Not sure if this behaviour should stick around, there may be better ways to handle when you want to trigger something if its registered to trigger in the state it currently is in
        if (value === this._value && stateChange === 'on-enter') {
            listener();
        }

        // We can assume there is an entry for value because of the above line
        const valueStateListeners = this._listeners.get(value)!;

        valueStateListeners[stateChange].push(listener);
    }

    /**
     * Trigger on-enter listeners asscociated with value of state
     */
    private handleEnter(value: T) {
        const valueStateListeners = this._listeners.get(value)?.['on-enter'];

        if (valueStateListeners !== undefined){
            valueStateListeners.forEach((listener) => listener())
        }
    }

    /**
     * Trigger on-exit listeners asscociated with value of state
     */
    private handleExit(value: T) {
        const valueStateListeners = this._listeners.get(value)?.['on-exit'];

        if (valueStateListeners !== undefined){
            valueStateListeners.forEach((listener) => listener())
        }
    }

    setValue(value: T) {
        this.handleExit(this._value);
        this._value = value;
        this.handleEnter(this._value);
    }

}

export default State;
export type { StateChange };