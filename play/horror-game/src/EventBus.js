/**
 * EventBus — Central pub/sub system for inter-module communication.
 * All game modules communicate exclusively through this bus.
 * Singleton instance exported for use across the project.
 */
class EventBus {
    constructor() {
        this._listeners = new Map();
    }

    /**
     * Subscribe to an event.
     * @param {string} event
     * @param {Function} callback
     * @returns {Function} Unsubscribe function
     */
    on(event, callback) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, []);
        }
        this._listeners.get(event).push(callback);

        return () => this.off(event, callback);
    }

    /**
     * Subscribe to an event, auto-remove after first fire.
     */
    once(event, callback) {
        const unsub = this.on(event, (...args) => {
            unsub();
            callback(...args);
        });
        return unsub;
    }

    /**
     * Unsubscribe a specific callback from an event.
     */
    off(event, callback) {
        const list = this._listeners.get(event);
        if (!list) return;
        const idx = list.indexOf(callback);
        if (idx !== -1) list.splice(idx, 1);
        if (list.length === 0) this._listeners.delete(event);
    }

    /**
     * Emit an event with optional data payload.
     */
    emit(event, data) {
        const list = this._listeners.get(event);
        if (!list) return;
        for (let i = 0; i < list.length; i++) {
            list[i](data);
        }
    }

    /**
     * Remove all listeners (useful for cleanup/restart).
     */
    clear() {
        this._listeners.clear();
    }
}

const eventBus = new EventBus();
export default eventBus;
