-- Create all 60 slots for each vending machine (10 columns x 6 rows)
-- First, let's create slots for the KWT1 machine (Salmiya)
INSERT INTO public.slots (vending_machine_id, slot_number, quantity, max_capacity)
SELECT 
  '3672e63c-52ac-4b0d-b667-692d8c5488c0' as vending_machine_id,
  generate_series(1, 60) as slot_number,
  0 as quantity,
  10 as max_capacity
WHERE NOT EXISTS (
  SELECT 1 FROM public.slots 
  WHERE vending_machine_id = '3672e63c-52ac-4b0d-b667-692d8c5488c0'
);

-- Create slots for the KW2 machine (City)
INSERT INTO public.slots (vending_machine_id, slot_number, quantity, max_capacity)
SELECT 
  '8a3b0268-52f1-4bcf-9081-b1646fef9f71' as vending_machine_id,
  generate_series(1, 60) as slot_number,
  0 as quantity,
  10 as max_capacity
WHERE NOT EXISTS (
  SELECT 1 FROM public.slots 
  WHERE vending_machine_id = '8a3b0268-52f1-4bcf-9081-b1646fef9f71'
);