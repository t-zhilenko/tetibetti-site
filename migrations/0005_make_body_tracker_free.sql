UPDATE products
SET
  price_minor = 0,
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'body-and-nutrition-tracker';
