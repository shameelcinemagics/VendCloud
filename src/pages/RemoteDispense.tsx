import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { formatKWD } from '@/lib/currency';


interface VendingMachine {
  id: string;
  machine_id: string;
  location: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
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


const RemoteDispense = () => {
  const [machines, setMachines] = useState<VendingMachine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRemoteEnabled, setIsRemoteEnabled] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  

  useEffect(() => {
    fetchMachines();
  }, []);

useEffect(() => {
  if (selectedMachine) {
    initializeSlots();
  }
}, [selectedMachine]);

const initializeSlots = async () => {
  if (!selectedMachine) return;
  
  setLoading(true);
  try {
    // First fetch existing slots
    const { data: existingSlots, error: fetchError } = await supabase
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

    if (fetchError) throw fetchError;


    // Fetch all slots again after initialization
    fetchSlots();
  } catch (error) {
    console.error('Error initializing slots:', error);
    toast({
      title: "Error",
      description: "Failed to initialize machine slots",
      variant: "destructive"
    });
  } finally {
    setLoading(false);
  }
};

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

// WebSocket lifecycle tied to selected machine and enable toggle
useEffect(() => {
  // Clean up any existing connection if disabled or no machine
  if (!isRemoteEnabled || !selectedMachine) {
    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
    }
    wsRef.current = null;
    setConnectionStatus('disconnected');
    return;
  }

  // Establish connection
  const wsBase = (import.meta as any).env?.VITE_WS_URL || 'wss://central-6vfl.onrender.com';
  const url = `${wsBase}`;
  setConnectionStatus('connecting');
  const socket = new WebSocket("wss://central-6vfl.onrender.com");
  wsRef.current = socket;

  socket.onopen = () => {
    setConnectionStatus('connected');
  };

  socket.onclose = () => {
    setConnectionStatus('disconnected');
  };

  socket.onerror = (error) => {
    setConnectionStatus('error');
    console.log("connection error", error);
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      if (message?.type === 'dispense-ack') {
        toast({ title: 'Dispense sent', description: `Slot ${message.slotNumber} acknowledged` });
      }
      if (message?.type === 'error') {
        toast({ title: 'Dispense failed', description: message.error || 'Unknown error', variant: 'destructive' });
      }
    } catch {
      // ignore non-JSON messages
    }
  };

  return () => {
    try { socket.close(); } catch {}
    wsRef.current = null;
  };
}, [isRemoteEnabled, selectedMachine]);

const sendDispense = (slotNumber: number) => {
  if (!isRemoteEnabled) {
    toast({ title: 'Feature disabled', description: 'Enable remote dispense first', variant: 'destructive' });
    return;
  }
  if (connectionStatus !== 'connected' || !wsRef.current) {
    toast({ title: 'Not connected', description: 'WebSocket is not connected', variant: 'destructive' });
    return;
  }
  try {
    const currentMachine = machines.find((m) => m.id === selectedMachine);
    const machineid = currentMachine?.machine_id
    console.log(currentMachine)
    const payload = { type: 'dispense',machineid, machineId: selectedMachine, slotNumber };
    console.log(payload)
    wsRef.current.send(JSON.stringify(payload));
    toast({ title: 'Dispensing...', description: `Requested slot ${slotNumber}` });
  } catch (e) {
    toast({ title: 'Send failed', description: 'Could not send dispense command', variant: 'destructive' });
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


  


  // Create a dynamic grid layout based on existing slots
  const createGridLayout = () => {
    const sortedSlots = slots.sort((a, b) => a.slot_number - b.slot_number);
    
    // Define the slot layout pattern
    const rowPatterns = [
      [1, 3, 5, 7, 9], // Row 1: 5 slots
      [11, 12, 13, 14, 15, 16, 17, 18, 19, 20], // Row 2: 10 slots
      [21, 23, 25, 27, 29], // Row 3: 5 slots
      [31, 32, 33, 34, 35, 36, 37, 38, 39, 40], // Row 4: 10 slots
      [41, 42, 43, 44, 45, 46, 47, 48, 49, 50], // Row 5: 10 slots
      [51, 52, 53, 54, 55, 56, 57, 58, 59, 60]  // Row 6: 10 slots
    ];
    
    return rowPatterns.map(rowSlots => 
      rowSlots.map(slotNum => sortedSlots.find(slot => slot.slot_number === slotNum)).filter(Boolean)
    ).filter(row => row.length > 0);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Remote Dispense</h1>
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
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch id="remote-toggle" checked={isRemoteEnabled} onCheckedChange={setIsRemoteEnabled} />
                  <Label htmlFor="remote-toggle">Enable Remote Dispense</Label>
                </div>
                <Badge variant="outline">
                  {connectionStatus === 'connected' && 'Connected'}
                  {connectionStatus === 'connecting' && 'Connecting...'}
                  {connectionStatus === 'disconnected' && 'Disconnected'}
                  {connectionStatus === 'error' && 'Error'}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>


      {selectedMachine && (
        <Card>
          <CardHeader>
            <CardTitle>Remote Dispense</CardTitle>
          </CardHeader>
          <CardContent className="h-full p-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="h-full overflow-x-auto overflow-y-auto p-8">
                <div className="text-center text-lg text-muted-foreground mb-6">
                  Machine Slots (60 total, {slots.filter(s => s.product_id).length} occupied) - Remote Dispense
                </div>
                <div className="space-y-4">
                  {createGridLayout().map((row, rowIndex) => (
                    <div key={rowIndex} className="space-y-2">
                      <div className="text-sm text-muted-foreground font-medium">
                        Row {rowIndex + 1} ({row.length} slots) - Remote Dispense
                      </div>
                      <div className="grid gap-6 grid-cols-5 justify-center">
                        {row.map((slot) => (
                          <Card key={slot.id} className={`relative w-full h-[28rem] ${!slot.product_id ? 'border-dashed border-2 opacity-60' : ''}`}>
                            <CardContent className="p-0 h-full flex flex-col">
                              <div className="flex justify-between items-center mb-3">
                                <Badge variant="outline" className="text-sm font-medium">{slot.slot_number} - Dispense</Badge>
                                <div className="flex gap-2"></div>
                              </div>
                              {slot?.product_id && slot.products ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
                                  {slot.products.image_url && (
                                    <img 
                                      src={slot.products.image_url} 
                                      alt={slot.products.name}
                                      className="w-40 h-40 object-cover rounded-lg mx-auto"
                                    />
                                  )}
                                  <div className="text-sm font-medium truncate w-full px-1">
                                    {slot.products.name} - Remote Dispense
                                    {slot.products.name} - Remote Dispense  
                                  </div>
                                   <div className="text-sm text-muted-foreground">
                                     {formatKWD(slot.products.price)} - Remote Dispense
                                     {formatKWD(slot.products.price)}
                                   </div>
                                  <div className="text-sm">
                                    <span className={slot.quantity === 0 ? 'text-destructive' : 'text-green-600'}>
                                      {slot.quantity}/{slot.max_capacity} - Remote Dispense
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
                                  <div className="pt-2">
                                    <Button
                                      variant="default"
                                      disabled={!isRemoteEnabled || connectionStatus !== 'connected' || !slot.product_id || slot.quantity === 0}
                                      onClick={() => sendDispense(slot.slot_number)}
                                    >
                                      {connectionStatus !== 'connected' ? 'Not Connected' : (slot.quantity === 0 ? 'Out of Stock' : 'Dispense')}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-1 flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="text-sm text-muted-foreground">Empty - Remote Dispense</div>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
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

export default RemoteDispense;