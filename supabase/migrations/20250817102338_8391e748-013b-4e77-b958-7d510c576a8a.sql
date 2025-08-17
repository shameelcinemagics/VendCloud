-- Change price column from numeric to text to preserve decimal formatting
ALTER TABLE public.products 
ALTER COLUMN price TYPE TEXT;