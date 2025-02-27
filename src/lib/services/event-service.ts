import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import { Logger } from '../logger';
import { IEventStore } from '../types/stores/event-store';
import { IEvent } from '../types/model';

export default class EventService {
    private logger: Logger;

    private eventStore: IEventStore;

    constructor(
        { eventStore }: Pick<IUnleashStores, 'eventStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger('services/event-service.ts');
        this.eventStore = eventStore;
    }

    async getEvents(): Promise<IEvent[]> {
        return this.eventStore.getEvents();
    }

    async getEventsForToggle(name: string): Promise<IEvent[]> {
        return this.eventStore.getEventsFilterByType(name);
    }
}

module.exports = EventService;
