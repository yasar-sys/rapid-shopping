
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_slug TEXT,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT USING (true);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT,
  brand TEXT,
  category_slug TEXT NOT NULL REFERENCES public.categories(slug),
  subcategory_slug TEXT REFERENCES public.categories(slug),
  description TEXT,
  specs JSONB DEFAULT '{}'::jsonb,
  price NUMERIC(12,2) NOT NULL,
  discount_price NUMERIC(12,2),
  stock INT NOT NULL DEFAULT 0,
  images TEXT[] NOT NULL DEFAULT '{}',
  video_url TEXT,
  tags TEXT[] DEFAULT '{}',
  warranty TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  reviews_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_flash_sale BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are public" ON public.products FOR SELECT USING (true);

CREATE INDEX idx_products_category ON public.products(category_slug);
CREATE INDEX idx_products_featured ON public.products(is_featured) WHERE is_featured = true;
