import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('faucet_requests', (table) => {
    table.increments('id').primary();
    table.string('address').notNullable();
    table.timestamp('requested_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('faucet_requests');
}