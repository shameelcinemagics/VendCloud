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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchMachines();
    fetchSlots();
  }, []);

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

  const isMachineAssigned = (machineId: string) => {
    return slots.some(slot => 
      slot.product_id === selectedProduct && 
      slot.vending_machine_id === machineId
    );
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

      // Update slots to assign the selected product to empty slots in selected machines
      for (const machineId of selectedMachines) {
        // Find empty slots for this machine
        const machineSlots = slots
          .filter(slot => slot.vending_machine_id === machineId && !slot.product_id)
          .slice(0, 1); // Assign to first empty slot

        if (machineSlots.length > 0) {
          await supabase
            .from('slots')
            .update({ 
              product_id: selectedProduct,
              quantity: 5  // Default quantity
            })
            .eq('id', machineSlots[0].id);
        }
      }

      toast({
        title: "Success",
        description: `Product assigned to ${selectedMachines.length} machine(s)`,
      });

      // Refresh data
      await fetchSlots();
      
    } catch (error) {
      console.error('Error in bulk assignment:', error);
      toast({
        title: "Error",
        description: "Failed to assign product to machines",
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
                      Product will be assigned to selected machines
                    </p>
                  </div>
                  <Button 
                    onClick={handleBulkAssignment}
                    disabled={loading}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? 'Assigning...' : 'Assign Product'}
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