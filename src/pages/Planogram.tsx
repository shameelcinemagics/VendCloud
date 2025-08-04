import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Grid3X3, Plus, Edit, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VendingMachine {
  id: string;
  machine_id: string;
  location: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface Slot {
  id: string;
  vending_machine_id: string;
  slot_number: number;
  product_id: string | null;
  quantity: number;
  max_capacity: number;
  product?: Product;
  products?: Product;
}

const Planogram = () => {
  const [machines, setMachines] = useState<VendingMachine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [formData, setFormData] = useState({
    slot_number: '',
    product_id: '',
    quantity: '',
    max_capacity: '10'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMachines();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedMachine) {
      fetchSlots();
    }
  }, [selectedMachine]);

  const fetchMachines = async () => {
    try {
      const { data, error } = await supabase
        .from('vending_machines')
        .select('id, machine_id, location')
        .eq('status', 'active');

      if (error) throw error;
      setMachines(data || []);
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchSlots = async () => {
    if (!selectedMachine) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('slots')
        .select(`
          *,
          products (
            id,
            name,
            price
          )
        `)
        .eq('vending_machine_id', selectedMachine)
        .order('slot_number');

      if (error) throw error;
      setSlots(data || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch slot data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const slotData = {
        vending_machine_id: selectedMachine,
        slot_number: parseInt(formData.slot_number),
        product_id: formData.product_id || null,
        quantity: parseInt(formData.quantity),
        max_capacity: parseInt(formData.max_capacity)
      };

      if (editingSlot) {
        const { error } = await supabase
          .from('slots')
          .update(slotData)
          .eq('id', editingSlot.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Slot updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('slots')
          .insert([slotData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Slot created successfully"
        });
      }

      setIsDialogOpen(false);
      setEditingSlot(null);
      setFormData({ slot_number: '', product_id: '', quantity: '', max_capacity: '10' });
      fetchSlots();
    } catch (error) {
      console.error('Error saving slot:', error);
      toast({
        title: "Error",
        description: "Failed to save slot",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (slot: Slot) => {
    setEditingSlot(slot);
    setFormData({
      slot_number: slot.slot_number.toString(),
      product_id: slot.product_id || '',
      quantity: slot.quantity.toString(),
      max_capacity: slot.max_capacity.toString()
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ slot_number: '', product_id: '', quantity: '', max_capacity: '10' });
    setEditingSlot(null);
  };

  const getNextSlotNumber = () => {
    if (slots.length === 0) return '1';
    const maxSlot = Math.max(...slots.map(slot => slot.slot_number));
    return (maxSlot + 1).toString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Planogram Management</h1>
          <p className="text-muted-foreground">Configure product slots for your vending machines</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Machine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="machine-select">Vending Machine</Label>
              <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a vending machine" />
                </SelectTrigger>
                <SelectContent>
                  {machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.machine_id} - {machine.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedMachine && (
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, slot_number: getNextSlotNumber() }));
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Slot
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingSlot ? 'Edit Slot' : 'Add New Slot'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="slot_number">Slot Number</Label>
                      <Input
                        id="slot_number"
                        type="number"
                        min="1"
                        value={formData.slot_number}
                        onChange={(e) => setFormData({ ...formData, slot_number: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product_id">Product</Label>
                      <Select 
                        value={formData.product_id} 
                        onValueChange={(value) => setFormData({ ...formData, product_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Product</SelectItem>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - ${product.price.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Current Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="0"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_capacity">Max Capacity</Label>
                        <Input
                          id="max_capacity"
                          type="number"
                          min="1"
                          value={formData.max_capacity}
                          onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        {editingSlot ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedMachine && (
        <Card>
          <CardHeader>
            <CardTitle>Slot Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8">
                <Grid3X3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No slots configured for this machine. Add your first slot to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {slots.map((slot) => (
                  <Card key={slot.id} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">Slot {slot.slot_number}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(slot)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {slot.product_id && slot.product ? (
                        <div className="space-y-2">
                          <h4 className="font-medium">{slot.product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ${slot.product.price.toFixed(2)}
                          </p>
                          <div className="flex justify-between text-sm">
                            <span>Stock:</span>
                            <span className={slot.quantity === 0 ? 'text-destructive' : ''}>
                              {slot.quantity}/{slot.max_capacity}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{
                                width: `${(slot.quantity / slot.max_capacity) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">Empty Slot</p>
                          <p className="text-xs text-muted-foreground">No product assigned</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Planogram;