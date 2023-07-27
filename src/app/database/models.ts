import type { QueryBuilder } from 'objection';
import { Model } from 'objection';
import Knex from 'knex';

const db = Knex({
  client: 'better-sqlite3',
  connection: {
    filename: process.env.DB_PATH as string,
    options: {
      readonly: true,
    },
  },
  useNullAsDefault: true,
  debug: true,
});

Model.knex(db);

export class Event extends Model {
  name!: string;
  version!: string;
  summary?: string;
  publishers?: Service[];
  subscribers?: Service[];
  domain?: Domain;

  static get tableName() {
    return 'events';
  }

  static get idColumn() {
    return ['name', 'version'];
  }

  static get relationMappings() {
    return {
      publishers: {
        relation: Model.ManyToManyRelation,
        modelClass: Service,
        join: {
          from: ['events.name', 'events.version'],
          through: {
            from: ['service_events.event_name', 'service_events.event_version'],
            to: 'service_events.service_name',
            extra: ['role'],
            filter(builder: QueryBuilder<any>) {
              builder.where('role', 'publisher');
            },
            beforeInsert(model: any) {
              model.role = 'publisher';
            },
          },
          to: 'services.name',
        },
      },
      subscribers: {
        relation: Model.ManyToManyRelation,
        modelClass: Service,
        join: {
          from: ['events.name', 'events.version'],
          through: {
            from: ['service_events.event_name', 'service_events.event_version'],
            to: 'service_events.service_name',
            extra: ['role'],
            filter(builder: QueryBuilder<any>) {
              builder.where('role', 'subscriber');
            },
            beforeInsert(model: any) {
              model.role = 'subscriber';
            },
          },
          to: 'services.name',
        },
      },
      domain: {
        relation: Model.BelongsToOneRelation,
        modelClass: Domain,
        join: {
          from: 'events.domain_name',
          to: 'domains.name',
        },
      },
      owners: {
        relation: Model.ManyToManyRelation,
        modelClass: Owner,
        join: {
          from: ['events.name', 'events.version'],
          through: {
            from: ['event_owners.event_name', 'event_owners.event_version'],
            to: 'event_owners.owner_email',
          },
          to: ['owners.email'],
        },
      },
      examples: {
        relation: Model.HasManyRelation,
        modelClass: EventExamples,
        join: {
          from: ['events.name', 'events.version'],
          to: ['event_examples.event_name', 'event_examples.event_version'],
        },
      },
    };
  }
}

export class Service extends Model {
  static get tableName() {
    return 'services';
  }

  static get idColumn() {
    return 'name';
  }

  static get relationMappings() {
    return {
      publishedEvents: {
        relation: Model.ManyToManyRelation,
        modelClass: Event,
        join: {
          from: 'services.name',
          through: {
            from: 'service_events.service_name',
            to: ['service_events.event_name', 'service_events.event_version'],
            extra: ['role'],
            filter(builder: QueryBuilder<any>) {
              builder.where('role', 'publisher');
            },
            beforeInsert(model: any) {
              model.role = 'publisher';
            },
          },
          to: ['events.name', 'events.version'],
        },
      },
      subscribedToEvents: {
        relation: Model.ManyToManyRelation,
        modelClass: Event,
        join: {
          from: 'services.name',
          through: {
            from: 'service_events.service_name',
            to: ['service_events.event_name', 'service_events.event_version'],
            extra: ['role'],
            filter(builder: QueryBuilder<any>) {
              builder.where('role', 'subscriber');
            },
            beforeInsert(model: any) {
              model.role = 'subscriber';
            },
          },
          to: ['events.name', 'events.version'],
        },
      },
      domain: {
        relation: Model.BelongsToOneRelation,
        modelClass: Domain,
        join: {
          from: 'services.domain_name',
          to: 'domains.name',
        },
      },
      owners: {
        relation: Model.ManyToManyRelation,
        modelClass: Owner,
        join: {
          from: 'services.name',
          through: {
            from: 'service_owners.service_name',
            to: 'service_owners.owner_email',
          },
          to: 'owners.email',
        },
      },
    };
  }
}

export class Domain extends Model {
  name!: string;
  static get tableName() {
    return 'domains';
  }
  static get idColumn() {
    return 'name';
  }

  static get relationMappings() {
    return {
      services: {
        relation: Model.HasManyRelation,
        modelClass: Service,
        join: {
          from: 'domains.name',
          to: 'services.domain_name',
        },
      },
      events: {
        relation: Model.HasManyRelation,
        modelClass: Event,
        join: {
          from: 'domains.name',
          to: 'events.domain_name',
        },
      },
      owners: {
        relation: Model.ManyToManyRelation,
        modelClass: Owner,
        join: {
          from: 'domains.name',
          through: {
            from: 'domain_owners.domain_name',
            to: 'domain_owners.owner_email',
          },
          to: 'owners.email',
        },
      },
    };
  }
}

export class Owner extends Model {
  email!: string;
  name?: string;
  role?: string;
  image?: string;

  static get tableName() {
    return 'owners';
  }

  static get idColumn() {
    return 'email';
  }

  static get relationMappings() {
    return {
      services: {
        relation: Model.ManyToManyRelation,
        modelClass: Service,
        join: {
          from: 'owners.email',
          through: {
            from: 'service_owners.owner_email',
            to: 'service_owners.service_name',
          },
          to: 'services.name',
        },
      },
      events: {
        relation: Model.ManyToManyRelation,
        modelClass: Event,
        join: {
          from: 'owners.email',
          through: {
            from: 'event_owners.owner_email',
            to: ['event_owners.event_name', 'event_owners.event_version'],
          },
          to: ['events.name', 'events.version'],
        },
      },
      domains: {
        relation: Model.ManyToManyRelation,
        modelClass: Domain,
        join: {
          from: 'owners.email',
          through: {
            from: 'domain_owners.owner_email',
            to: 'domain_owners.domain_name',
          },
          to: 'domains.name',
        },
      },
    };
  }
}

export class EventExamples extends Model {
  static get tableName() {
    return 'event_examples';
  }

  static get relationMappings() {
    return {
      event: {
        relation: Model.BelongsToOneRelation,
        modelClass: Event,
        join: {
          from: ['event_examples.event_name', 'event_examples.event_version'],
          to: ['events.name', 'events.version'],
        },
      },
    };
  }
}
