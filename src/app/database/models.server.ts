/* eslint-disable max-len, @typescript-eslint/no-use-before-define, max-classes-per-file, no-param-reassign  */
import type { QueryBuilder } from 'objection';
import { Model } from 'objection';
import Knex from 'knex';

const db = Knex({
  client: 'better-sqlite3',
  connection: {
    filename: process.env.DB_PATH as string,
    options: {
      // readonly: true,
    },
  },
  useNullAsDefault: true,
});

Model.knex(db);

export class Event extends Model {
  name!: string;

  version!: string;

  is_latest!: boolean;

  summary?: string;

  producers?: Service[];

  consumers?: Service[];

  domain?: Domain;

  owners?: Owner[];

  content?: string;

  domain_name?: string;

  schema?: string;

  static get modifiers() {
    return {
      isLatest(builder: QueryBuilder<any>) {
        builder.where({ is_latest: true });
      },
    };
  }

  static get tableName() {
    return 'events';
  }

  static get idColumn() {
    return ['name', 'version', 'is_latest'];
  }

  static get relationMappings() {
    return {
      producers: {
        relation: Model.ManyToManyRelation,
        modelClass: Service,
        join: {
          from: ['events.name', 'events.version', 'events.is_latest'],
          through: {
            from: [
              'service_events.event_name',
              'service_events.event_version',
              'service_events.event_is_latest',
            ],
            to: 'service_events.service_name',
            extra: ['role'],
            filter(builder: QueryBuilder<any>) {
              builder.where('role', 'producer');
            },
            beforeInsert(model: any) {
              // eslint-disable-next-line no-param-reassign
              model.role = 'producer';
            },
          },
          to: 'services.name',
        },
      },
      consumers: {
        relation: Model.ManyToManyRelation,
        modelClass: Service,
        join: {
          from: ['events.name', 'events.version', 'events.is_latest'],
          through: {
            from: [
              'service_events.event_name',
              'service_events.event_version',
              'service_events.event_is_latest',
            ],
            to: 'service_events.service_name',
            extra: ['role'],
            filter(builder: QueryBuilder<any>) {
              builder.where('role', 'consumer');
            },
            beforeInsert(model: any) {
              // eslint-disable-next-line
              model.role = 'consumer';
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
          from: ['events.name', 'events.version', 'events.is_latest'],
          through: {
            from: [
              'event_owners.event_name',
              'event_owners.event_version',
              'event_owners.event_is_latest',
            ],
            to: 'event_owners.owner_email',
          },
          to: ['owners.email'],
        },
      },
      examples: {
        relation: Model.HasManyRelation,
        modelClass: EventExamples,
        join: {
          from: ['events.name', 'events.version', 'events.is_latest'],
          to: [
            'event_examples.event_name',
            'event_examples.event_version',
            'event_examples.event_is_latest',
          ],
        },
      },
    };
  }
}

export class Service extends Model {
  name!: string;

  summary?: string;

  content?: string;

  domain_name?: string;

  producesEvents?: Event[];

  consumesEvents?: Event[];

  owners?: Owner[];

  domain?: Domain;

  openapi?: string;

  static get tableName() {
    return 'services';
  }

  static get idColumn() {
    return 'name';
  }

  static get relationMappings() {
    return {
      producesEvents: {
        relation: Model.ManyToManyRelation,
        modelClass: Event,
        join: {
          from: 'services.name',
          through: {
            from: 'service_events.service_name',
            to: [
              'service_events.event_name',
              'service_events.event_version',
              'service_events.event_is_latest',
            ],
            extra: ['role'],
            filter(builder: QueryBuilder<any>) {
              builder.where('role', 'producer');
            },
            beforeInsert(model: any) {
              model.role = 'producer';
            },
          },
          to: ['events.name', 'events.version', 'events.is_latest'],
        },
      },
      consumesEvents: {
        relation: Model.ManyToManyRelation,
        modelClass: Event,
        join: {
          from: 'services.name',
          through: {
            from: 'service_events.service_name',
            to: [
              'service_events.event_name',
              'service_events.event_version',
              'service_events.event_is_latest',
            ],
            extra: ['role'],
            filter(builder: QueryBuilder<any>) {
              builder.where('role', 'consumer');
            },
            beforeInsert(model: any) {
              model.role = 'consumer';
            },
          },
          to: ['events.name', 'events.version', 'events.is_latest'],
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

  summary?: string;

  content?: string;

  events?: Event[];

  services?: Service[];

  owners?: Owner[];

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

  content?: string;

  image?: string;

  events?: Event[];

  services?: Service[];

  domains?: Domain[];

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
            to: [
              'event_owners.event_name',
              'event_owners.event_version',
              'event_owners.event_is_latest',
            ],
          },
          to: ['events.name', 'events.version', 'events.is_latest'],
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
          from: [
            'event_examples.event_name',
            'event_examples.event_version',
            'event_examples.event_is_latest',
          ],
          to: ['events.name', 'events.version', 'events.is_latest'],
        },
      },
    };
  }
}
