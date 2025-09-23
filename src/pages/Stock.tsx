import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { AlertTriangle, TrendingUp, Package } from 'lucide-react';

interface VendingMachine {
  id: string;
  machine_id: string;
  location: string;
}

interface StockItem {
  machine_id: string;
  location: string;
  slot_number: number;
  product_name: string | null;
  product_price: string | null;
  quantity: number;
  max_capacity: number;
  slot_id: string;
  product_id: string | null;
  vending_machine_id: string;
}

const Stock = () => {
  const [machines, setMachines] = useState<VendingMachine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>('all');
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMachines();
    fetchStockData();
  }, []);

  useEffect(() => {
    fetchStockData();
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

  const fetchStockData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('slots')
        .select(`
          *,
          vending_machines(machine_id, location),
          products(name, price)
        `);
      
      if (selectedMachine !== 'all') {
        query = query.eq('vending_machine_id', selectedMachine);
      }

      const { data, error } = await query.order('slot_number');

      if (error) throw error;
      
      const transformedData = (data || []).map(slot => ({
        machine_id: slot.vending_machines?.machine_id || '',
        location: slot.vending_machines?.location || '',
        slot_number: slot.slot_number,
        product_name: slot.products?.name || null,
        product_price: slot.products?.price || null,
        quantity: slot.quantity,
        max_capacity: slot.max_capacity,
        slot_id: slot.id,
        product_id: slot.product_id,
        vending_machine_id: slot.vending_machine_id,
      }));
      
      setStockData(transformedData);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (quantity: number, maxCapacity: number) => {
    const percentage = (quantity / maxCapacity) * 100;
    if (percentage === 0) return { status: 'empty', variant: 'destructive' as const, label: 'Empty' };
    if (percentage <= 20) return { status: 'low', variant: 'destructive' as const, label: 'Low Stock' };
    if (percentage <= 50) return { status: 'medium', variant: 'secondary' as const, label: 'Medium' };
    return { status: 'good', variant: 'default' as const, label: 'Good' };
  };

  const getTotalStats = () => {
    const totalSlots = stockData.length;
    const filledSlots = stockData.filter(item => item.product_id).length;
    const emptySlots = stockData.filter(item => item.quantity === 0 && item.product_id).length;
    const lowStockSlots = stockData.filter(item => {
      if (!item.product_id) return false;
      const percentage = (item.quantity / item.max_capacity) * 100;
      return percentage > 0 && percentage <= 20;
    }).length;

    return { totalSlots, filledSlots, emptySlots, lowStockSlots };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stock Overview</h1>
        <p className="text-muted-foreground">Monitor inventory levels across your vending machine network</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSlots}</div>
            <p className="text-xs text-muted-foreground">
              {stats.filledSlots} with products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStockSlots}</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empty Slots</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.emptySlots}</div>
            <p className="text-xs text-muted-foreground">Out of stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fill Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalSlots > 0 ? Math.round((stats.filledSlots / stats.totalSlots) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Slots with products</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Stock Details</CardTitle>
            <div className="w-64">
              <Label htmlFor="machine-filter">Filter by Machine</Label>
              <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Machines</SelectItem>
                  {machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.machine_id} - {machine.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {stockData.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No stock data available for the selected machine.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Machine ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fill Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockData.map((item, index) => {
                  const stockStatus = getStockStatus(item.quantity, item.max_capacity);
                  const fillPercentage = (item.quantity / item.max_capacity) * 100;
                  
                  return (
                    <TableRow key={`${item.slot_id}-${index}`}>
                      <TableCell className="font-medium">{item.machine_id}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        <Badge variant="outline">#{item.slot_number}</Badge>
                      </TableCell>
                      <TableCell>
                        {item.product_name || <span className="text-muted-foreground">No Product</span>}
                      </TableCell>
                      <TableCell>
                        {item.product_price ? `KWD ${Number(item.product_price).toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        <span className={item.quantity === 0 && item.product_id ? 'text-red-600' : ''}>
                          {item.quantity}/{item.max_capacity}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.product_id ? (
                          <Badge variant={stockStatus.variant}>
                            {stockStatus.label}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Empty Slot</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.product_id && (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  fillPercentage === 0 ? 'bg-red-500' :
                                  fillPercentage <= 20 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${fillPercentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(fillPercentage)}%
                            </span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Stock;