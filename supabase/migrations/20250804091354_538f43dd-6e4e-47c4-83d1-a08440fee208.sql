-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partno INTEGER NOT NULL UNIQUE
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vending_machines table  
CREATE TABLE public.vending_machines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create slots table
CREATE TABLE public.slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vending_machine_id UUID NOT NULL REFERENCES public.vending_machines(id) ON DELETE CASCADE,
  slot_number INTEGER NOT NULL CHECK (slot_number > 0),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  max_capacity INTEGER NOT NULL DEFAULT 10 CHECK (max_capacity > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vending_machine_id, slot_number)
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vending_machine_id UUID NOT NULL REFERENCES public.vending_machines(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  slot_number INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  sold_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for admin users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'manager')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create machine_stock view for easy querying
CREATE VIEW public.machine_stock AS
SELECT 
  vm.machine_id,
  vm.location,
  s.slot_number,
  p.name as product_name,
  p.price as product_price,
  s.quantity,
  s.max_capacity,
  s.id as slot_id,
  s.product_id,
  vm.id as vending_machine_id
FROM public.vending_machines vm
LEFT JOIN public.slots s ON vm.id = s.vending_machine_id
LEFT JOIN public.products p ON s.product_id = p.id
ORDER BY vm.machine_id, s.slot_number;

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vending_machines ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Products are viewable by authenticated users" 
ON public.products FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Products can be managed by authenticated users" 
ON public.products FOR ALL 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for vending_machines
CREATE POLICY "Vending machines are viewable by authenticated users" 
ON public.vending_machines FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Vending machines can be managed by authenticated users" 
ON public.vending_machines FOR ALL 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for slots
CREATE POLICY "Slots are viewable by authenticated users" 
ON public.slots FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Slots can be managed by authenticated users" 
ON public.slots FOR ALL 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for sales  
CREATE POLICY "Sales are viewable by authenticated users" 
ON public.sales FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Sales can be created by anyone" 
ON public.sales FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Sales can be managed by authenticated users" 
ON public.sales FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Storage policies for product images
CREATE POLICY "Product images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update product images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete product images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (NEW.id, NEW.email, 'admin');
  RETURN NEW;
END;
$$;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;