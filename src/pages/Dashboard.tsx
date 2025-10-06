import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Monitor, TrendingUp, BarChart3 } from 'lucide-react';
import SalesByMachineChart from '@/components/SalesByMachineChart';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalMachines: 0,
    totalSales: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Fetch machines count
      const { count: machinesCount } = await supabase
        .from('vending_machines')
        .select('*', { count: 'exact', head: true });

      // Fetch sales count and revenue
      const { data: salesData } = await supabase
        .from('sales')
        .select('quantity')
        .gte('sold_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      const totalSales = salesData?.reduce((sum, sale) => sum + sale.quantity, 0) || 0;

      // Calculate revenue (this is simplified - in real app you'd join with products table)
      const totalRevenue = totalSales * 2.5; // Assuming average price

      setStats({
        totalProducts: productsCount || 0,
        totalMachines: machinesCount || 0,
        totalSales,
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to VendIT Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active products in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vending Machines</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMachines}</div>
            <p className="text-xs text-muted-foreground">Machines in network</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">Items sold this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KWD {stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This month's revenue</p>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Sales by Machine</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <Card className="p-4 hover:bg-accent cursor-pointer transition-colors">


      <SalesByMachineChart />
          </Card>

        </CardContent>
      </Card> 
    </div>
  );
};

export default Dashboard;