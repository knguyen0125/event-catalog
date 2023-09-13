const fs = require('node:fs');
const path = require('node:path');
const _ = require('lodash');
const Knex = require('knex');
const YAML = require('js-yaml');
const grayMatter = require('gray-matter');
const {writeCatalogHash, getFiles} = require("./catalogHash");

const regexes = {
  event: /^\/events\/(?<event_name>[^\/]+?)$/,
  eventVersion:
    /^\/events\/(?<event_name>[^\/]+?)\/versions\/(?<event_version>[^\/]+?)$/,
  domainEvent:
    /^\/domains\/(?<domain_name>[^\/]+?)\/events\/(?<event_name>[^\/]+?)$/,
  domainEventVersion:
    /^\/domains\/(?<domain_name>[^\/]+?)\/events\/(?<event_name>[^\/]+?)\/versions\/(?<event_version>[^\/]+?)$/,
  service: /^\/services\/(?<service_name>[^\/]+?)$/,
  domainService:
    /^\/domains\/(?<domain_name>[^\/]+?)\/services\/(?<service_name>[^\/]+?)$/,
  domain: /^\/domains\/(?<domain_name>[^\/]+?)$/,
  owner: /^\/owners\/(?<owner_email>[^\/]+?)$/,
};

const knex = Knex({
  client: 'better-sqlite3',
  connection: {
    filename: process.env.DB_PATH,
  },
  useNullAsDefault: true,
});

async function dropEverything() {
  console.log('Dropping everything');
  await knex.schema.dropTableIfExists('events');
  await knex.schema.dropTableIfExists('services');
  await knex.schema.dropTableIfExists('domains');
  await knex.schema.dropTableIfExists('owners');
  await knex.schema.dropTableIfExists('service_owners');
  await knex.schema.dropTableIfExists('domain_owners');
  await knex.schema.dropTableIfExists('event_owners');
  await knex.schema.dropTableIfExists('service_events');
  await knex.schema.dropTableIfExists('event_examples');
}

async function handleDomainDirectoryChange(changes, directory) {
  // Get domain name
  const domainName = directory.match(regexes.domain)?.groups?.domain_name;

  if (!domainName) {
    return;
  }

  // Get index file
  const indexFile = fs.readFileSync(
    path.join(process.cwd(), 'catalog', directory, 'index.md'),
    'utf-8',
  );

  // Parse index file
  const { data, content } = grayMatter(indexFile);

  const domain = {
    name: _.trim(domainName),
    summary: _.trim(data.summary),
    content: _.trim(content),
  };

  changes.domains[domainName] = domain;

  // Process domain owners
  _.forEach(data.owners, (ownerEmail) => {
    changes.domain_owners[`${domainName}-${ownerEmail}`] = {
      domain_name: _.trim(domainName),
      owner_email: _.trim(ownerEmail),
    };
  });
}
async function handleEventDirectoryChange(changes, directory) {
  const eventName =
    directory.match(regexes.event)?.groups?.event_name ||
    directory.match(regexes.eventVersion)?.groups?.event_name ||
    directory.match(regexes.domainEvent)?.groups?.event_name ||
    directory.match(regexes.domainEventVersion)?.groups?.event_name;
  const domainName =
    directory.match(regexes.domainEvent)?.groups?.domain_name ||
    directory.match(regexes.domainEventVersion)?.groups?.domain_name;
  const isLatest = regexes.event.test(directory) || regexes.domainEvent.test(directory);
  const folderEventVersion =
    directory.match(regexes.eventVersion)?.groups?.event_version ||
    directory.match(regexes.domainEventVersion)?.groups?.event_version;

  if (!eventName) {
    return;
  }

  // Get index file
  const indexFile = fs.readFileSync(
    path.join(process.cwd(), 'catalog', directory, 'index.md'),
    'utf-8',
  );

  // Parse index file
  const { data, content } = grayMatter(indexFile);

  const event = {
    name: _.trim(eventName),
    version: _.trim(data.version),
    summary: _.trim(data.summary),
    content: _.trim(content),
    domain_name: _.trim(domainName),
    is_latest: isLatest,
  };

  changes.events[`${eventName}-${folderEventVersion}-${isLatest}`] = event;

  const fileNames = fs.readdirSync(path.join(process.cwd(), 'catalog', directory));
  const schemaFile = _.find(fileNames, (file) =>
    _.includes(['schema.yaml', 'schema.yml', 'schema.json'], _.toLower(file)),
  );

  if (schemaFile) {
    const schemaFileData = fs.readFileSync(
      path.join(process.cwd(), 'catalog', directory, schemaFile),
      'utf-8',
    );

    if (schemaFile.endsWith('.json')) {
      event.schema = JSON.stringify(JSON.parse(schemaFileData));
    } else {
      event.schema = JSON.stringify(YAML.load(schemaFileData));
    }
  }

  // Process event owners
  _.forEach(data.owners || [], (owner) => {
    changes.event_owners[
      `${eventName}-${folderEventVersion}-${isLatest}-${owner}`
      ] = {
      event_name: _.trim(eventName),
      event_version: _.trim(data.version),
      event_is_latest: isLatest,
      owner_email: _.trim(owner),
    };
  });

  // Process event producers
  _.forEach(data.producers || [], (serviceName) => {
    if (_.isObject(serviceName)) {
      changes.service_events[
        `${eventName}-${folderEventVersion}-${isLatest}-${serviceName.name}`
        ] = {
        event_name: _.trim(eventName),
        event_version: _.trim(data.version),
        event_is_latest: isLatest,
        service_name: _.trim(serviceName.name),
        role: 'producer',
      };
    } else if (_.isString(serviceName)) {
      changes.service_events[
        `${eventName}-${folderEventVersion}-${isLatest}-${serviceName}`
        ] = {
        event_name: _.trim(eventName),
        event_version: _.trim(data.version),
        event_is_latest: isLatest,
        service_name: _.trim(serviceName),
        role: 'producer',
      };
    }
  });

  // Process event consumers
  _.forEach(data.consumers || [], (serviceName) => {
    if (_.isObject(serviceName)) {
      changes.service_events[
        `${eventName}-${folderEventVersion}-${isLatest}-${serviceName.name}`
        ] = {
        event_name: _.trim(eventName),
        event_version: _.trim(data.version),
        event_is_latest: isLatest,
        service_name: _.trim(serviceName.name),
        role: 'consumer',
      };
    } else if (_.isString(serviceName)) {
      changes.service_events[
        `${eventName}-${folderEventVersion}-${isLatest}-${serviceName}`
        ] = {
        event_name: _.trim(eventName),
        event_version: _.trim(data.version),
        event_is_latest: isLatest,
        service_name: _.trim(serviceName),
        role: 'consumer',
      };
    }
  });
}
async function handleOwnerDirectoryChange(changes, directory) {
  // Get owner email
  const email = directory.match(regexes.owner)?.groups?.owner_email;

  if (!email) {
    return;
  }

  // Get index file
  const indexFile = fs.readFileSync(
    path.join(process.cwd(), 'catalog', directory, 'index.md'),
    'utf-8',
  );

  // Parse index file
  const { data, content } = grayMatter(indexFile);

  const owner = {
    email: _.trim(email),
    name: _.trim(data.name),
    role: _.trim(data.role),
    image: _.trim(data.image),
    content: _.trim(content),
  };

  changes.owners[email] = owner;
}
async function handleServiceDirectoryChange(db, dir) {
  const serviceName =
    dir.match(regexes.service)?.groups?.service_name ||
    dir.match(regexes.domainService)?.groups?.service_name;
  const domainName = dir.match(regexes.domainService)?.groups?.domain_name;

  if (!serviceName) {
    return;
  }

  // Get index file
  const indexFile = fs.readFileSync(
    path.join(process.cwd(), 'catalog', dir, 'index.md'),
    'utf-8',
  );

  // Parse index file
  const { data, content } = grayMatter(indexFile);

  const service = {
    name: _.trim(serviceName),
    content: _.trim(content),
    domain_name: _.trim(domainName),
  };

  // Get openapi file
  const files = fs.readdirSync(path.join(process.cwd(), 'catalog', dir));
  const openApiFile = _.find(files, (file) =>
    _.includes(
      ['openapi.yaml', 'openapi.yml', 'openapi.json'],
      _.toLower(file),
    ),
  );

  if (openApiFile) {
    service.openapi = _.trim(
      fs.readFileSync(
        path.join(process.cwd(), 'catalog', dir, openApiFile),
        'utf-8',
      ),
    );
  }

  db.services[serviceName] = service;

  // Process event owners
  _.forEach(data.owners || [], (owner) => {
    db.service_owners[`${serviceName}-${owner}`] = {
      service_name: _.trim(serviceName),
      owner_email: _.trim(owner),
    };
  });
}

async function handleDirectoryChange(dirs) {
  const changes = {
    domains: {},
    domain_owners: {},
    events: {},
    event_owners: {},
    owners: {},
    services: {},
    service_events: {},
    service_owners: {},
  };

  for (const dir of dirs) {
    if (regexes.domain.test(dir)) {
      await handleDomainDirectoryChange(changes, dir);
    }

    if (
      regexes.event.test(dir) ||
      regexes.eventVersion.test(dir) ||
      regexes.domainEvent.test(dir) ||
      regexes.domainEventVersion.test(dir)
    ) {
      await handleEventDirectoryChange(changes, dir);
    }

    if (regexes.owner.test(dir)) {
      await handleOwnerDirectoryChange(changes, dir);
    }

    if (
      regexes.service.test(dir) ||
      regexes.domainService.test(dir)
    ) {
      await handleServiceDirectoryChange(changes, dir);
    }
  }

  return changes
}

async function buildDatabase() {
  // Recursively read all files in the catalog directory
  /** @type {string[]} */
  const files = getFiles('./catalog');
  // Truncate file to get rid of current directory path
  /** @type {string[]} */
  const truncatedFiles = files.map((file) => {
    return file.replace(path.resolve(process.cwd(), 'catalog'), '');
  });

  const dirs = _.chain(files)
    .map(file => file.replace(path.resolve(process.cwd(), 'catalog'), ''))
    .map((file) => path.dirname(file))
    .uniq()
    .value();

  const db = await handleDirectoryChange(dirs)

  // Write db
  if (!(await knex.schema.hasTable('events'))) {
    console.log("Creating schema")
    // Init schema
    await knex.schema
      .createTable('events', (table) => {
        table.text('name').comment('Event name. Must be unique');
        table.text('version').comment('Event version');
        table
          .boolean('is_latest')
          .comment('Whether this is the latest version of the event');
        table.text('summary').comment('Short event summary');
        table.text('content').comment('Event Content written in Markdown');
        table
          .text('schema')
          .comment('Event Schema - must conform to JSON Schema Draft-07');
        table.text('domain_name').comment('Domain name');

        table.primary(['name', 'version', 'is_latest']);
      })
      .createTable('services', (table) => {
        table.text('name').primary().comment('Service name. Must be unique');
        table.text('summary').comment('Short service summary');
        table.text('content').comment('Service Content written in Markdown');
        table.text('openapi').comment('OpenAPI Specification (JSON)');
        table.text('domain_name').comment('Domain name');
      })
      .createTable('domains', (table) => {
        table.text('name').primary().comment('Domain name. Must be unique');
        table.text('summary').comment('Short domain summary');
        table.text('content').comment('Domain Content written in Markdown');
      })
      .createTable('owners', (table) => {
        table.text('email').primary();
        table.text('name');
        table.text('role');
        table.text('image');
        table.text('content');
      })
      .createTable('service_owners', (table) => {
        table.text('service_name');
        table.text('owner_email');
        table.primary(['service_name', 'owner_email']);
      })
      .createTable('domain_owners', (table) => {
        table.text('domain_name');
        table.text('owner_email');
        table.primary(['domain_name', 'owner_email']);
      })
      .createTable('event_owners', (table) => {
        table.text('event_name');
        table.text('event_version');
        table.boolean('event_is_latest');
        table.text('owner_email');
        table.primary([
          'event_name',
          'event_version',
          'event_is_latest',
          'owner_email',
        ]);
      })
      .createTable('service_events', (table) => {
        table.text('service_name');
        table.text('event_name');
        table.text('event_version');
        table.boolean('event_is_latest');
        table
          .text('role')
          .comment(
            'Role of the service in the event (either producer or consumer)',
          );
        table.primary([
          'service_name',
          'event_name',
          'event_version',
          'event_is_latest',
          'role',
        ]);
      })
      .createTable('event_examples', (table) => {
        table.text('event_name');
        table.text('event_version');
        table.boolean('event_is_latest');
        table.text('example_name');
        table
          .text('example_language')
          .comment('Language of the example (e.g. Go, Java, Python)');
        table.text('example_content');
        table.primary([
          'event_name',
          'event_version',
          'event_is_latest',
          'example_name',
        ]);
      });
  } else {
    console.log('Truncating tables');
    // Schema exists, truncate tables
    await knex('events').truncate();
    await knex('services').truncate();
    await knex('domains').truncate();
    await knex('owners').truncate();
    await knex('service_owners').truncate();
    await knex('domain_owners').truncate();
    await knex('event_owners').truncate();
    await knex('service_events').truncate();
    await knex('event_examples').truncate();
  }
  // Drop DB
  if (!_.isEmpty(db.events))
    await knex.into('events').insert(_.values(db.events));
  if (!_.isEmpty(db.domains))
    await knex.into('domains').insert(_.values(db.domains));
  if (!_.isEmpty(db.services))
    await knex.into('services').insert(_.values(db.services));
  if (!_.isEmpty(db.owners))
    await knex.into('owners').insert(_.values(db.owners));
  if (!_.isEmpty(db.service_owners))
    await knex.into('service_owners').insert(_.values(db.service_owners));
  if (!_.isEmpty(db.domain_owners))
    await knex.into('domain_owners').insert(_.values(db.domain_owners));
  if (!_.isEmpty(db.event_owners))
    await knex.into('event_owners').insert(_.values(db.event_owners));
  if (!_.isEmpty(db.service_events))
    await knex.into('service_events').insert(_.values(db.service_events));

  console.log("Updating hash")
  writeCatalogHash()
}

module.exports = {
  dropEverything,
  buildDatabase
}