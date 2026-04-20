ALTER TABLE products
ADD COLUMN status TEXT NOT NULL DEFAULT 'active';

INSERT INTO products (
  slug,
  name,
  price_minor,
  currency,
  is_active,
  status,
  delivery_type,
  target_url
)
VALUES (
  'yearly-goals',
  'Yearly Goals',
  0,
  'USD',
  1,
  'active',
  'token_link',
  NULL
)
ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name,
  price_minor = excluded.price_minor,
  currency = excluded.currency,
  is_active = excluded.is_active,
  status = excluded.status,
  delivery_type = excluded.delivery_type,
  target_url = excluded.target_url,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO products (
  slug,
  name,
  price_minor,
  currency,
  is_active,
  status,
  delivery_type,
  target_url
)
VALUES (
  'nutrition-meal-planner',
  'Nutrition Meal Planner',
  0,
  'USD',
  1,
  'coming_soon',
  'token_link',
  NULL
)
ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name,
  price_minor = excluded.price_minor,
  currency = excluded.currency,
  is_active = excluded.is_active,
  status = excluded.status,
  delivery_type = excluded.delivery_type,
  target_url = excluded.target_url,
  updated_at = CURRENT_TIMESTAMP;

INSERT INTO products (
  slug,
  name,
  price_minor,
  currency,
  is_active,
  status,
  delivery_type,
  target_url
)
VALUES (
  'body-and-nutrition-tracker',
  'Body & Nutrition Tracker',
  900,
  'USD',
  1,
  'active',
  'token_link',
  NULL
)
ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name,
  price_minor = excluded.price_minor,
  currency = excluded.currency,
  is_active = excluded.is_active,
  status = excluded.status,
  delivery_type = excluded.delivery_type,
  target_url = excluded.target_url,
  updated_at = CURRENT_TIMESTAMP;

UPDATE products
SET
  is_active = 0,
  status = 'archived',
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'java-cheat-sheets';
