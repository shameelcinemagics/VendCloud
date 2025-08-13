import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ListChecks, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatKWD } from '@/lib/currency';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
}

interface VendingMachine {
  id: string;
  machine_id: string;
  location: string;
}

const BulkAssignment = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [machines, setMachines] = useState<VendingMachine[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [assignedMachines, setAssignedMachines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchMachines();
    fetchSlots();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      updateAssignedMachines();
    } else {
      setAssignedMachines([]);
      setSelectedMachines([]);
    }
  }, [selectedProduct, slots]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image_url')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive"
      });
    }
  };

  const fetchMachines = async () => {
    try {
      const { data, error } = await supabase
        .from('vending_machines')
        .select('id, machine_id, location')
        .eq('status', 'active')
        .order('machine_id');

      if (error) throw error;
      setMachines(data || []);
    } catch (error) {
      console.error('Error fetching machines:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vending machines",
        variant: "destructive"
      });
    }
  };

  const fetchSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('slots')
        .select('*');

      if (error) throw error;
      setSlots(data || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleMachineToggle = (machineId: string, checked: boolean) => {
    if (checked) {
      setSelectedMachines(prev => [...prev, machineId]);
    } else {
      setSelectedMachines(prev => prev.filter(id => id !== machineId));
    }
  };

  const handleSelectAll = () => {
    setSelectedMachines(machines.map(m => m.id));
  };

  const handleDeselectAll = () => {
    setSelectedMachines([]);
  };

  const getSelectedProduct = () => {
    return products.find(p => p.id === selectedProduct);
  };

  const updateAssignedMachines = () => {
    const assigned = machines
      .filter(machine => 
        slots.some(slot => 
          slot.product_id === selectedProduct && 
          slot.vending_machine_id === machine.id
        )
      )
      .map(machine => machine.id);
    setAssignedMachines(assigned);
  };

  const isMachineAssigned = (machineId: string) => {
    return assignedMachines.includes(machineId);
  };

  const handleBulkAssignment = async () => {
    if (!selectedProduct || selectedMachines.length === 0) {
      toast({
        title: "Invalid Selection",
        description: "Please select a product and at least one machine",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const product = getSelectedProduct();
      if (!product) throw new Error('Product not found');

      const machinesToAssign = selectedMachines.filter(id => !assignedMachines.includes(id));
      const machinesToUnassign = selectedMachines.filter(id => assignedMachines.includes(id));

      // Assign to new machines
      for (const machineId of machinesToAssign) {
        const machineSlots = slots
          .filter(slot => slot.vending_machine_id === machineId && !slot.product_id)
          .slice(0, 1);

        if (machineSlots.length > 0) {
          await supabase
            .from('slots')
            .update({ 
              product_id: selectedProduct,
              quantity: 5
            })
            .eq('id', machineSlots[0].id);
        }
      }

      // Unassign from selected assigned machines
      for (const machineId of machinesToUnassign) {
        await supabase
          .from('slots')
          .update({
            product_id: null,
            quantity: 0
          })
          .eq('vending_machine_id', machineId)
          .eq('product_id', selectedProduct);
      }

      const assignCount = machinesToAssign.length;
      const unassignCount = machinesToUnassign.length;
      
      let message = '';
      if (assignCount > 0 && unassignCount > 0) {
        message = `Product assigned to ${assignCount} machine(s) and unassigned from ${unassignCount} machine(s)`;
      } else if (assignCount > 0) {
        message = `Product assigned to ${assignCount} machine(s)`;
      } else if (unassignCount > 0) {
        message = `Product unassigned from ${unassignCount} machine(s)`;
      }

      toast({
        title: "Success",
        description: message,
      });

      await fetchSlots();
      
    } catch (error) {
      console.error('Error in bulk assignment:', error);
      toast({
        title: "Error",
        description: "Failed to process assignment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bulk Product Assignment</h1>
          <p className="text-muted-foreground">Assign products to multiple vending machines at once</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Product</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="product-select">Product</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product to assign" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center gap-2">
                        {product.image_url && (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-6 h-6 object-cover rounded"
                          />
                        )}
                        <span>{product.name} - {formatKWD(product.price)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProduct && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  {getSelectedProduct()?.image_url && (
                    <img 
                      src={getSelectedProduct()?.image_url} 
                      alt={getSelectedProduct()?.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{getSelectedProduct()?.name}</h3>
                    <p className="text-muted-foreground">Base Price: {formatKWD(getSelectedProduct()?.price || 0)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedProduct && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Select Vending Machines</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSelectAll}
                >
                  Select All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDeselectAll}
                >
                  Deselect All
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {machines.map((machine) => (
                <div key={machine.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                  <Checkbox
                    id={machine.id}
                    checked={selectedMachines.includes(machine.id)}
                    onCheckedChange={(checked) => handleMachineToggle(machine.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={machine.id} className="font-medium cursor-pointer">
                      {machine.machine_id}
                    </Label>
                    <p className="text-sm text-muted-foreground">{machine.location}</p>
                    {isMachineAssigned(machine.id) && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        Currently Assigned
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedMachines.length > 0 && (
              <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {selectedMachines.length} machine(s) selected
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(() => {
                        const toAssign = selectedMachines.filter(id => !assignedMachines.includes(id)).length;
                        const toUnassign = selectedMachines.filter(id => assignedMachines.includes(id)).length;
                        
                        if (toAssign > 0 && toUnassign > 0) {
                          return `Will assign to ${toAssign} machine(s) and unassign from ${toUnassign} machine(s)`;
                        } else if (toAssign > 0) {
                          return `Will assign to ${toAssign} machine(s)`;
                        } else if (toUnassign > 0) {
                          return `Will unassign from ${toUnassign} machine(s)`;
                        }
                        return '';
                      })()}
                    </p>
                  </div>
                  <Button 
                    onClick={handleBulkAssignment}
                    disabled={loading}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? 'Processing...' : 'Apply Changes'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkAssignment;