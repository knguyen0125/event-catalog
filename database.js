const fs = require('node:fs');
const path = require('node:path');
const _ = require('lodash');
const Knex = require('knex');
const YAML = require('js-yaml');
const grayMatter = require('gray-matter');
const { writeCatalogHash, getFiles } = require('./catalogHash');
const Parser = require('@apidevtools/swagger-parser');
const crypto = require('node:crypto');
const parser = new Parser();

const regexes = {
  event: /^\/events\/(?<event_name>[^\/]+?)$/,
  eventVersion:
    /^\/events\/(?<event_name>[^\/]+?)\/versions\/(?<event_version>[^\/]+?)$/,
  domainEvent:
    /^\/domains\/(?<domain_name>[^\/]+?)\/events\/(?<event_name>[^\/]+?)$/,
  domainEventVersion:
    /^\/domains\/(?<domain_name>[^\/]+?)\/events\/(?<event_name>[^\/]+?)\/versions\/(?<event_version>[^\/]+?)$/,
  service: /^\/services\/(?<service_name>[^\/]+?)$/,
  serviceDocs: /^\/services\/(?<service_name>[^\/]+?)\/docs$/,
  domainService:
    /^\/domains\/(?<domain_name>[^\/]+?)\/services\/(?<service_name>[^\/]+?)$/,
  domainServiceDocs:
    /^\/domains\/(?<domain_name>[^\/]+?)\/services\/(?<service_name>[^\/]+?)\/docs$/,
  domain: /^\/domains\/(?<domain_name>[^\/]+?)$/,
  domainDocs: /^\/domains\/(?<domain_name>[^\/]+?)\/docs$/,
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
  await knex.schema.dropTableIfExists('docs');
  await knex.schema.dropTableIfExists('service_docs');
  await knex.schema.dropTableIfExists('domain_docs');
  await knex.schema.dropTableIfExists('doc_owners');
}

async function processMarkdown(content, directory) {
  const unified = (await import('unified')).unified;
  const remarkParse = (await import('remark-parse')).default;
  const remarkGfm = (await import('remark-gfm')).default;
  const remarkEmoji = (await import('remark-emoji')).default;
  const remarkRehype = (await import('remark-rehype')).default;
  const rehypeStringify = (await import('rehype-stringify')).default;
  const transform = (await import('./transform.mjs')).default;

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(transform, { dir: directory })
    .use(remarkEmoji)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(content);

  return processedContent.toString();
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
    content: _.trim(await processMarkdown(content, directory)),
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
    directory.match(regexes.domainEventVersion)?.groups?.domain_name ||
    'Unspecified';
  const isLatest =
    regexes.event.test(directory) || regexes.domainEvent.test(directory);
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
    content: _.trim(await processMarkdown(content, directory)),
    domain_name: _.trim(domainName),
    is_latest: isLatest,
  };

  changes.events[`${eventName}-${folderEventVersion}-${isLatest}`] = event;

  const fileNames = fs.readdirSync(
    path.join(process.cwd(), 'catalog', directory),
  );
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
        `${eventName}-${folderEventVersion}-${isLatest}-${serviceName.name}-producer`
      ] = {
        event_name: _.trim(eventName),
        event_version: _.trim(data.version),
        event_is_latest: isLatest,
        service_name: _.trim(serviceName.name),
        role: 'producer',
      };
    } else if (_.isString(serviceName)) {
      changes.service_events[
        `${eventName}-${folderEventVersion}-${isLatest}-${serviceName}-producer`
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
        `${eventName}-${folderEventVersion}-${isLatest}-${serviceName.name}-consumer`
      ] = {
        event_name: _.trim(eventName),
        event_version: _.trim(data.version),
        event_is_latest: isLatest,
        service_name: _.trim(serviceName.name),
        role: 'consumer',
      };
    } else if (_.isString(serviceName)) {
      changes.service_events[
        `${eventName}-${folderEventVersion}-${isLatest}-${serviceName}-consumer`
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
    content: _.trim(await processMarkdown(content, directory)),
  };

  changes.owners[email] = owner;
}
async function handleServiceDirectoryChange(db, dir) {
  const serviceName =
    dir.match(regexes.service)?.groups?.service_name ||
    dir.match(regexes.domainService)?.groups?.service_name;
  const domainName =
    dir.match(regexes.domainService)?.groups?.domain_name || 'Unspecified';

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
    summary: _.trim(data.summary),
    content: _.trim(await processMarkdown(content, dir)),
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
    const isYaml =
      openApiFile.endsWith('.yaml') || openApiFile.endsWith('.yml');
    const openapi = _.trim(
      fs.readFileSync(
        path.join(process.cwd(), 'catalog', dir, openApiFile),
        'utf-8',
      ),
    );

    const doc = isYaml ? YAML.load(openapi) : JSON.parse(openapi);

    const bundle = await parser.dereference(doc);
    service.openapi = YAML.dump(bundle);
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

async function handleDocDirectoryChange(db, dir) {
  const serviceName =
    dir.match(regexes.serviceDocs)?.groups?.service_name ||
    dir.match(regexes.domainServiceDocs)?.groups?.service_name;
  const domainName =
    dir.match(regexes.domainServiceDocs)?.groups?.domain_name ||
    dir.match(regexes.domainDocs)?.groups?.domain_name ||
    'Unspecified';

  // For each markdown file
  const files = fs.readdirSync(path.join(process.cwd(), 'catalog', dir));
  const markdownFiles = _.filter(files, (file) => file.endsWith('.md'));

  for (const markdownFile of markdownFiles) {
    const docPath = path.join(dir, markdownFile);
    const docFile = fs.readFileSync(
      path.join(process.cwd(), 'catalog', docPath),
      'utf-8',
    );
    const docStats = fs.statSync(path.join(process.cwd(), 'catalog', docPath));

    // Parse file
    const { data, content } = grayMatter(docFile);
    const fileName = markdownFile.replace(/\.md$/, '');

    db.docs[docPath] = {
      path: _.trim(docPath),
      // 8 character hex
      id: crypto
        .createHash('md5')
        .update(
          `${_.trim(domainName)}-${_.trim(serviceName)}-${_.trim(fileName)}`,
        )
        .digest('hex')
        .slice(0, 8),
      title: _.trim(data.title) || _.trim(fileName),
      summary: _.trim(data.summary),
      content: _.trim(await processMarkdown(content, dir)),
      domain_name: _.trim(domainName),
      service_name: _.trim(serviceName),
      file_name: fileName,
      last_updated_at: new Date(docStats.mtime).toISOString(),
    };

    // Process doc owners
    _.forEach(data.owners || [], (owner) => {
      db.doc_owners[`${docPath}-${owner}`] = {
        doc_path: _.trim(docPath),
        owner_email: _.trim(owner),
      };
    });
  }
}

async function handleDirectoryChange(dirs) {
  const changes = {
    domains: {
      Unspecified: {
        name: 'Unspecified',
        summary:
          'Contains events, services, and documents that does not belong to any domain',
      },
    },
    domain_owners: {},
    events: {},
    event_owners: {},
    owners: {},
    services: {},
    service_events: {},
    service_owners: {},
    docs: {},
    doc_owners: {},
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

    if (regexes.service.test(dir) || regexes.domainService.test(dir)) {
      await handleServiceDirectoryChange(changes, dir);
    }

    if (
      regexes.serviceDocs.test(dir) ||
      regexes.domainServiceDocs.test(dir) ||
      regexes.domainDocs.test(dir)
    ) {
      await handleDocDirectoryChange(changes, dir);
    }
  }

  return changes;
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
    .map((file) => file.replace(path.resolve(process.cwd(), 'catalog'), ''))
    .map((file) => path.dirname(file))
    .uniq()
    .value();

  const db = await handleDirectoryChange(dirs);

  // Write db
  if (!(await knex.schema.hasTable('events'))) {
    console.log('Creating schema');
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
      })
      .createTable('docs', (table) => {
        table.text('path').primary();
        table.text('id');
        table.text('title');
        table.text('summary');
        table.text('content');
        table.text('domain_name');
        table.text('service_name');
        table.text('file_name');
        table.text('last_updated_at');
      })
      .createTable('doc_owners', (table) => {
        table.text('doc_path');
        table.text('owner_email');
        table.primary(['doc_path', 'owner_email']);
      });
  } else {
    console.log('Truncating tables');
    // Schema exists, truncate tables
    await knex('events').truncate();
    await knex('services').truncate();
    await knex('domains').truncate();
    await knex('owners').truncate();
    await knex('docs').truncate();
    await knex('service_owners').truncate();
    await knex('domain_owners').truncate();
    await knex('event_owners').truncate();
    await knex('service_events').truncate();
    await knex('event_examples').truncate();
    await knex('doc_owners').truncate();
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
  if (!_.isEmpty(db.docs)) await knex.into('docs').insert(_.values(db.docs));
  if (!_.isEmpty(db.doc_owners))
    await knex.into('doc_owners').insert(_.values(db.doc_owners));

  console.log('Updating hash');
  writeCatalogHash();
}

module.exports = {
  dropEverything,
  buildDatabase,
};
