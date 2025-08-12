import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Save, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatKWD } from '@/lib/currency';

interface Assignment {
  id: string;
  product_id: string;
  price: number;
  active: boolean;
  products?: { id: string; name: string; image_url?: string | null };
}

interface Product {
  id: string;
  name: string;
  image_url?: string | null;
  price: number;
}

interface Props {
  machineId: string;
  onChanged?: () => void;
}

export default function MachineProductsManager({ machineId, onChanged }: Props) {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [addingProductId, setAddingProductId] = useState('');
  const [addingPrice, setAddingPrice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!machineId) return;
    void loadData();
  }, [machineId]);

  const unassignedProducts = useMemo(() => {
    const assignedIds = new Set(assignments.map(a => a.product_id));
    return products.filter(p => !assignedIds.has(p.id));
  }, [assignments, products]);

  async function loadData() {
    setLoading(true);
    try {
      const [{ data: mp, error: mpErr }, { data: prod, error: prodErr }] = await Promise.all([
        supabase
          .from('machine_products')
          .select('id, product_id, price, active, products ( id, name, image_url )')
          .eq('vending_machine_id', machineId)
          .order('product_id'),
        supabase
          .from('products')
          .select('id, name, image_url, price')
          .order('name')
      ]);

      if (mpErr) throw mpErr;
      if (prodErr) throw prodErr;
      setAssignments(mp || []);
      setProducts(prod || []);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to load machine products', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    try {
      const priceNum = parseFloat(addingPrice);
      if (!addingProductId || isNaN(priceNum)) {
        toast({ title: 'Missing data', description: 'Choose a product and enter a valid price', variant: 'destructive' });
        return;
      }
      const { error } = await supabase.from('machine_products').insert([
        { vending_machine_id: machineId, product_id: addingProductId, price: priceNum, active: true }
      ]);
      if (error) throw error;
      toast({ title: 'Added', description: 'Product assigned to machine' });
      setAddingProductId('');
      setAddingPrice('');
      await loadData();
      onChanged?.();
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to add product', variant: 'destructive' });
    }
  }

  async function handleUpdatePrice(id: string, newPrice: string) {
    try {
      const priceNum = parseFloat(newPrice);
      if (isNaN(priceNum)) return;
      const { error } = await supabase.from('machine_products').update({ price: priceNum }).eq('id', id);
      if (error) throw error;
      toast({ title: 'Saved', description: 'Price updated' });
      await loadData();
      onChanged?.();
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to update price', variant: 'destructive' });
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase.from('machine_products').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Removed', description: 'Product removed from machine' });
      await loadData();
      onChanged?.();
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to remove product', variant: 'destructive' });
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Machine Products & Prices (KWD)</h3>
          <p className="text-sm text-muted-foreground">Assign products to this machine and set machine-specific prices.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <Label>Product</Label>
            <Select value={addingProductId} onValueChange={setAddingProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {unassignedProducts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Machine Price (KWD)</Label>
            <Input type="number" step="0.001" min="0" value={addingPrice} onChange={(e) => setAddingPrice(e.target.value)} placeholder="0.000" />
          </div>
          <div>
            <Button onClick={handleAdd} disabled={!addingProductId || !addingPrice}>
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {assignments.length === 0 ? (
            <div className="text-sm text-muted-foreground">No products assigned yet.</div>
          ) : (
            assignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 border rounded-md p-3">
                <div className="flex items-center gap-3">
                  {a.products?.image_url ? (
                    <img src={a.products.image_url} alt={a.products.name} className="h-10 w-10 rounded object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded bg-muted" />
                  )}
                  <div>
                    <div className="font-medium">{a.products?.name ?? a.product_id}</div>
                    <div className="text-sm text-muted-foreground">{formatKWD(a.price)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    defaultValue={a.price.toFixed(3)}
                    onBlur={(e) => handleUpdatePrice(a.id, e.target.value)}
                    className="w-32"
                  />
                  <Button variant="outline" size="icon" onClick={() => handleDelete(a.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
