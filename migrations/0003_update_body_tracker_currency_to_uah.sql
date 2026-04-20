UPDATE products
SET
  currency = 'UAH',
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'body-and-nutrition-tracker';
