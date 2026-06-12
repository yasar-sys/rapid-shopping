import { supabase } from "@/integrations/supabase/client";
import { queryOptions } from "@tanstack/react-query";

// Product images are stored as full CDN URLs (Lovable Assets) in the database.
// This helper exists for backwards-compatibility and simply returns the URL.
export const resolveImage = (src: string): string => src;

export interface Product {
  id: string;
  product_id: string;
  name: string;
  slug: string;
  brand: string | null;
  category_slug: string;
  subcategory_slug: string | null;
  description: string | null;
  specs: Record<string, string> | null;
  price: number;
  discount_price: number | null;
  stock: number;
  images: string[];
  tags: string[] | null;
  warranty: string | null;
  rating: number | null;
  reviews_count: number | null;
  is_featured: boolean | null;
  is_new: boolean | null;
  is_flash_sale: boolean | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_slug: string | null;
  icon: string | null;
}

export const productsQuery = () =>
  queryOptions({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Product[];
    },
  });

export const categoriesQuery = () =>
  queryOptions({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as unknown as Category[];
    },
  });

export const productByIdQuery = (productId: string) =>
  queryOptions({
    queryKey: ["product", productId],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .ilike("product_id", productId)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as Product) ?? null;
    },
  });

export const effectivePrice = (p: Product) => p.discount_price ?? p.price;
export const discountPct = (p: Product) =>
  p.discount_price ? Math.round(((p.price - p.discount_price) / p.price) * 100) : 0;