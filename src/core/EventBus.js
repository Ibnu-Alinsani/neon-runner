/**
 * EventBus - Observer Pattern for decoupled communication
 */
class EventBus {
    constructor() {
        this.events = {};
    }

    /**
     * Subscribe to an event
     * @param {string} event - Name of the event
     * @param {function} callback - Function to run when event is emitted
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    /**
     * Emit an event
     * @param {string} event - Name of the event
     * @param {any} data - Data to pass to subscribers
     */
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }

    /**
     * Clear all events
     */
    clear() {
        this.events = {};
    }
}

export const eventBus = new EventBus();
