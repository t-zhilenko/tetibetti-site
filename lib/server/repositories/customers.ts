import type { Customer } from "@/lib/payments/types";
import type { D1Database } from "@/lib/server/d1";

type CustomerRow = {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
};

const mapCustomerRow = (row: CustomerRow): Customer => ({
  id: row.id,
  email: row.email,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const findCustomerByEmail = async (
  db: D1Database,
  email: string,
): Promise<Customer | null> => {
  const row = await db
    .prepare(
      `
        SELECT id, email, created_at, updated_at
        FROM customers
        WHERE email = ?
        LIMIT 1
      `,
    )
    .bind(email)
    .first<CustomerRow>();

  return row ? mapCustomerRow(row) : null;
};

export const findCustomerById = async (
  db: D1Database,
  id: number,
): Promise<Customer | null> => {
  const row = await db
    .prepare(
      `
        SELECT id, email, created_at, updated_at
        FROM customers
        WHERE id = ?
        LIMIT 1
      `,
    )
    .bind(id)
    .first<CustomerRow>();

  return row ? mapCustomerRow(row) : null;
};

export const getOrCreateCustomerByEmail = async (
  db: D1Database,
  email: string,
): Promise<Customer> => {
  await db
    .prepare(
      `
        INSERT INTO customers (email)
        VALUES (?)
        ON CONFLICT(email) DO NOTHING
      `,
    )
    .bind(email)
    .run();

  const customer = await findCustomerByEmail(db, email);
  if (!customer) {
    throw new Error(`Unable to load customer after insert/select: ${email}`);
  }

  return customer;
};
