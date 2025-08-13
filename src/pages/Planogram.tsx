import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Grid3X3, Plus, Edit, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatKWD } from '@/lib/currency';
import MachineProductsManager from '@/components/MachineProductsManager';

interface VendingMachine {
  id: string;
  machine_id: string;
  location: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
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

interface MachineProduct {
  id: string;
  product_id: string;
  price: number;
  active: boolean;
  products?: { id: string; name: string; image_url?: string | null };
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
  const [machineProducts, setMachineProducts] = useState<MachineProduct[]>([]);

  useEffect(() => {
    fetchMachines();
    fetchProducts();
  }, []);

useEffect(() => {
  if (selectedMachine) {
    fetchSlots();
    fetchMachineProducts();
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
      .select('id, name, price, image_url');

    if (error) throw error;
    setProducts(data || []);
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

const fetchMachineProducts = async () => {
  if (!selectedMachine) return;
  try {
    const { data, error } = await supabase
      .from('machine_products' as any)
      .select(`
        id,
        product_id,
        price,
        active,
        products (
          id,
          name,
          image_url
        )
      `)
      .eq('vending_machine_id', selectedMachine);
    if (error) throw error;
    setMachineProducts((data || []) as unknown as MachineProduct[]);
  } catch (error) {
    console.error('Error fetching machine products:', error);
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
            price,
            image_url
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
        product_id: formData.product_id === 'none' || !formData.product_id ? null : formData.product_id,
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
      product_id: slot.product_id || 'none',
      quantity: slot.quantity.toString(),
      max_capacity: slot.max_capacity.toString()
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ slot_number: '', product_id: '', quantity: '', max_capacity: '10' });
    setEditingSlot(null);
  };

  const handleDelete = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;

    try {
      const { error } = await supabase
        .from('slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Slot deleted successfully"
      });
      fetchSlots();
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast({
        title: "Error",
        description: "Failed to delete slot",
        variant: "destructive"
      });
    }
  };

  const getNextSlotNumber = () => {
    if (slots.length === 0) return '1';
    
    // Find the first available slot number (1-60)
    for (let i = 1; i <= 60; i++) {
      if (!slots.find(slot => slot.slot_number === i)) {
        return i.toString();
      }
    }
    
    // If all 60 slots are taken, return the next number
    return '61';
  };

  const handleAddSlot = () => {
    const nextSlot = getNextSlotNumber();
    if (parseInt(nextSlot) > 60) {
      toast({
        title: "Maximum slots reached",
        description: "This machine already has 60 slots (maximum capacity)",
        variant: "destructive"
      });
      return;
    }
    
    setEditingSlot(null);
    setFormData({ 
      slot_number: nextSlot, 
      product_id: '', 
      quantity: '0', 
      max_capacity: '10' 
    });
    setIsDialogOpen(true);
  };

  // Create a dynamic grid layout based on existing slots
  const createGridLayout = () => {
    // Sort slots by slot number and return only existing slots
    return slots.sort((a, b) => a.slot_number - b.slot_number);
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
              <Button onClick={handleAddSlot} className="ml-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Slot
              </Button>
            )}
          </div>

          {/* Edit Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
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
                    disabled={editingSlot !== null}
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
                      <SelectItem value="none">No Product</SelectItem>
                      {machineProducts.filter(mp => mp.active).map((mp) => (
                        <SelectItem key={mp.product_id} value={mp.product_id}>
                          {mp.products?.name} - {formatKWD(mp.price)}
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
        </CardContent>
      </Card>

      {selectedMachine && (
        <MachineProductsManager 
          machineId={selectedMachine} 
          onChanged={fetchMachineProducts}
        />
      )}

      {selectedMachine && (
        <Card>
          <CardHeader>
            <CardTitle>Slot Configuration</CardTitle>
          </CardHeader>
          <CardContent className="h-full p-0">
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
              <div className="h-full overflow-x-auto overflow-y-auto p-8">
                <div className="text-center text-lg text-muted-foreground mb-6">
                  Configured Slots ({slots.length} total)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {createGridLayout().map((slot) => (
                    <Card key={slot.id} className="relative w-full h-[28rem]">
                      <CardContent className="p-4 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant="outline" className="text-base font-medium">{slot.slot_number}</Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(slot)}
                            >
                              <Edit className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDelete(slot.id)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                        {slot?.product_id && slot.products ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
                            {slot.products.image_url && (
                              <img 
                                src={slot.products.image_url} 
                                alt={slot.products.name}
                                className="w-32 h-32 object-cover rounded-lg mx-auto"
                              />
                            )}
                            <div className="text-base font-medium truncate w-full">
                              {slot.products.name}
                            </div>
                            <div className="text-base text-muted-foreground">
                              {(() => {
                                const machineProduct = machineProducts.find(mp => mp.product_id === slot.product_id);
                                return machineProduct ? formatKWD(machineProduct.price) : formatKWD(slot.products.price);
                              })()}
                            </div>
                            <div className="text-base">
                              <span className={slot.quantity === 0 ? 'text-destructive' : 'text-green-600'}>
                                {slot.quantity}/{slot.max_capacity}
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-3">
                              <div
                                className="bg-primary h-3 rounded-full transition-all"
                                style={{
                                  width: `${(slot.quantity / slot.max_capacity) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-base text-muted-foreground">Empty Slot</div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Planogram;