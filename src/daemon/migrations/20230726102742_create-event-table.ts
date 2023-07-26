import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("events", (table) => {
      table.text("name").comment("Event name. Must be unique");
      table.text("version").comment("Event version");
      table
        .boolean("is_latest")
        .comment("Whether this is the latest version of the event");
      table.text("summary").comment("Short event summary");
      table.text("content").comment("Event Content written in Markdown");
      table
        .text("schema")
        .comment("Event Schema - must conform to JSON Schema Draft-07");
      table.text("domain_name").comment("Domain name");

      table.primary(["name", "version"]);
    })
    .createTable("services", (table) => {
      table.text("name").primary().comment("Service name. Must be unique");
      table.text("summary").comment("Short service summary");
      table.text("content").comment("Service Content written in Markdown");
      table.text("openapi").comment("OpenAPI Specification (JSON)");
      table.text("domain_name").comment("Domain name");
    })
    .createTable("domains", (table) => {
      table.text("name").primary().comment("Domain name. Must be unique");
      table.text("summary").comment("Short domain summary");
      table.text("content").comment("Domain Content written in Markdown");
    })
    .createTable("owners", (table) => {
      table.text("email").primary();
      table.text("name");
      table.text("role");
      table.text("image");
    })
    .createTable("service_owners", (table) => {
      table.text("service_name");
      table.text("owner_email");
      table.primary(["service_name", "owner_email"]);
    })
    .createTable("domain_owners", (table) => {
      table.text("domain_name");
      table.text("owner_email");
      table.primary(["domain_name", "owner_email"]);
    })
    .createTable("event_owners", (table) => {
      table.text("event_name");
      table.text("event_version");
      table.text("owner_email");
      table.primary(["event_name", "event_version", "owner_email"]);
    })
    .createTable("service_events", (table) => {
      table.text("service_name");
      table.text("event_name");
      table.text("event_version");
      table
        .text("role")
        .comment(
          "Role of the service in the event (either producer or consumer)",
        );
      table.primary(["service_name", "event_name", "event_version", "role"]);
    })
    .createTable("event_examples", (table) => {
      table.text("event_name");
      table.text("event_version");
      table.text("example_name");
      table
        .text("example_language")
        .comment("Language of the example (e.g. Go, Java, Python)");
      table.text("example_content");
      table.primary(["event_name", "event_version", "example_name"]);
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists("events")
    .dropTableIfExists("services")
    .dropTableIfExists("domains")
    .dropTableIfExists("owners")
    .dropTableIfExists("service_owners")
    .dropTableIfExists("domain_owners")
    .dropTableIfExists("event_owners")
    .dropTableIfExists("service_events")
    .dropTableIfExists("event_examples");
}
