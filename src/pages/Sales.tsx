import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Package, TrendingUp } from 'lucide-react';

interface VendingMachine {
  id: string;
  machine_id: string;
  location: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
}

interface Sale {
  id: string;
  vending_machine_id: string;
  product_id: string;
  slot_number: number;
  quantity: number;
  sold_at: string;
  vending_machines?: VendingMachine;
  products?: Product;
}

const Sales = () => {
  const [machines, setMachines] = useState<VendingMachine[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dateTo, setDateTo] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMachines();
  }, []);

  useEffect(() => {
    fetchSales();
  }, [selectedMachine, dateFrom, dateTo]);

  const exportToCSV = () => {
    if (!sales.length) return;
  
    const headers = [
      "Date & Time",
      "Machine",
      "Location",
      "Slot",
      "Product",
      "Quantity",
      "Unit Price",
      "Total"
    ];
  
    const rows = sales.map((sale) => {
      const date = new Date(sale.sold_at);
      const unitPrice = Number(sale.products?.price || 0);
      const total = unitPrice * sale.quantity;
  
      return [
        `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
        sale.vending_machines?.machine_id || '',
        sale.vending_machines?.location || '',
        sale.slot_number,
        sale.products?.name || '',
        sale.quantity,
        unitPrice.toFixed(2),
        total.toFixed(2),
      ];
    });
  
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
  
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_data_${dateFrom}_to_${dateTo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  

  const fetchMachines = async () => {
    try {
      const { data, error } = await supabase
        .from('vending_machines')
        .select('id, machine_id, location');

      if (error) throw error;
      setMachines(data || []);
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };

  const getStartOfDayUTC = (date: string) => {
    return new Date(`${date}T00:00:00`).toISOString();
  };
  
  const getEndOfDayUTC = (date: string) => {
    return new Date(`${date}T23:59:59`).toISOString();
  };
  
  const fromUTC = getStartOfDayUTC(dateFrom);
  const toUTC = getEndOfDayUTC(dateTo);

  const fetchSales = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('sales')
        .select(`
          *,
          vending_machines (
            id,
            machine_id,
            location
          ),
          products (
            id,
            name,
            price
          )
        `)
        .gte('sold_at', fromUTC)
        .lte('sold_at', toUTC)
        .order('sold_at', { ascending: false });

      if (selectedMachine !== 'all') {
        query = query.eq('vending_machine_id', selectedMachine);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSalesStats = () => {
    const totalSales = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalRevenue = sales.reduce((sum, sale) => {
      const productPrice = Number(sale.products?.price || 0);
      return sum + (productPrice * sale.quantity);
    }, 0);
    const uniqueProducts = new Set(sales.map(sale => sale.product_id)).size;
    const uniqueMachines = new Set(sales.map(sale => sale.vending_machine_id)).size;

    return { totalSales, totalRevenue, uniqueProducts, uniqueMachines };
  };

  const stats = getSalesStats();

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
        <h1 className="text-3xl font-bold">Sales Logs</h1>
        <p className="text-muted-foreground">Track sales performance across your vending machine network</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">Items sold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KWD {stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueProducts}</div>
            <p className="text-xs text-muted-foreground">Different products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Machines</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueMachines}</div>
            <p className="text-xs text-muted-foreground">With sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Data</CardTitle>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-48">
              <Label htmlFor="machine-filter">Machine</Label>
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
            <div>
              <Label htmlFor="date-from">From Date</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="date-to">To Date</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchSales}>
                Apply Filters
              </Button>
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={exportToCSV}>
                Export to CSV
              </Button>
            </div>

          </div>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No sales found for the selected criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Machine</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => {
                  const unitPrice = Number(sale.products?.price || 0);
                  const total = unitPrice * sale.quantity;
                  
                  return (
                    <TableRow key={sale.id}>
                      <TableCell>
                        {new Date(sale.sold_at).toLocaleDateString()} {new Date(sale.sold_at).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {sale.vending_machines?.machine_id}
                      </TableCell>
                      <TableCell>
                        {sale.vending_machines?.location}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">#{sale.slot_number}</Badge>
                      </TableCell>
                      <TableCell>
                        {sale.products?.name || 'Unknown Product'}
                      </TableCell>
                      <TableCell>
                        <Badge>{sale.quantity}</Badge>
                      </TableCell>
                      <TableCell>
                        KWD {unitPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-medium">
                        KWD {total.toFixed(2)}
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

export default Sales;