UPDATE products
SET
  currency = 'USD',
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'body-and-nutrition-tracker';
