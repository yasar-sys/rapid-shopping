
GRANT INSERT ON public.orders TO anon;
GRANT INSERT ON public.order_items TO anon;

CREATE POLICY "Orders guest insert" ON public.orders
  FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Order items guest insert" ON public.order_items
  FOR INSERT TO anon
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id AND o.user_id IS NULL
  ));
