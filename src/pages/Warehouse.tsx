import React, { useState, useEffect } from "react";
import { Warehouse, Plus, Edit, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatKWD } from "@/lib/currency";
import { Phone, Mail, MapPin } from "lucide-react";

interface WarehouseItem {
  id: string;
  name: string;
  warehouse_type?: string | null;
  location_type?: string | null;
  management_types: string[];
  external_id?: string | null;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  working_days: string[];
  working_hours_from?: string | null;
  working_hours_to?: string | null;
  has_time_interval: boolean;
  custom_room?: string | null;
  created_at: string;
}

const WarehousePage = () => {
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WarehouseItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    warehouse_type: "",
    location_type: "",
    management_types: [],
    external_id: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    working_days: ["mon", "tue", "wed", "thu", "fri"],
    working_hours_from: "09:00",
    working_hours_to: "17:00",
    has_time_interval: false,
    custom_room: "",
  });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchWarehouseItems();
  }, []);

  const fetchWarehouseItems = async () => {
    try {
      // Simulating API call - replace with actual data fetching
      const mockData: WarehouseItem[] = [
        {
          id: "1",
          name: "Main Distribution Center",
          warehouse_type: "main",
          location_type: "standalone",
          management_types: ["product_stock"],
          external_id: "WH-KW-001",
          description: "Primary warehouse for all product categories",
          phone: "+965 1234 5678",
          email: "warehouse@company.com",
          address: "Industrial Area, Shuwaikh, Kuwait",
          working_days: ["mon", "tue", "wed", "thu", "fri", "sat"],
          working_hours_from: "08:00",
          working_hours_to: "18:00",
          has_time_interval: true,
          custom_room: "Cold Storage Room A",
          created_at: "2025-01-15",
        },
        {
          id: "2",
          name: "North Region Warehouse",
          warehouse_type: "regional",
          location_type: "cash_room",
          management_types: ["product_stock", "spare_parts"],
          external_id: "WH-KW-002",
          description: "Serves northern regions with fast delivery",
          phone: "+965 2233 4455",
          email: "north.warehouse@company.com",
          address: "Al-Jahra Road, Kuwait",
          working_days: ["mon", "tue", "wed", "thu", "fri"],
          working_hours_from: "07:00",
          working_hours_to: "17:00",
          has_time_interval: false,
          custom_room: "",
          created_at: "2025-02-20",
        },
        {
          id: "3",
          name: "Cold Storage Facility",
          warehouse_type: "cold_storage",
          location_type: "standalone",
          management_types: ["product_stock"],
          external_id: "WH-KW-003",
          description: "Specialized storage for temperature-sensitive products",
          phone: "+965 3344 5566",
          email: "cold.storage@company.com",
          address: "Shuwaikh Industrial 2, Kuwait",
          working_days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
          working_hours_from: "06:00",
          working_hours_to: "22:00",
          has_time_interval: true,
          custom_room: "Freezer Section B",
          created_at: "2025-03-10",
        },
        {
          id: "4",
          name: "Spare Parts Depot",
          warehouse_type: "other",
          location_type: "client_location",
          management_types: ["spare_parts"],
          external_id: "WH-KW-004",
          description:
            "Dedicated storage for machine spare parts and components",
          phone: "+965 4455 6677",
          email: "parts.depot@company.com",
          address: "Al-Salam Street, Kuwait City",
          working_days: ["mon", "tue", "wed", "thu", "fri"],
          working_hours_from: "09:00",
          working_hours_to: "17:00",
          has_time_interval: false,
          custom_room: "Sensitive Components",
          created_at: "2024-11-05",
        },
        {
          id: "5",
          name: "South Distribution Hub",
          warehouse_type: "distribution",
          location_type: "standalone",
          management_types: ["product_stock"],
          external_id: "WH-KW-005",
          description: "Serves southern regions and expedited deliveries",
          phone: "+965 5566 7788",
          email: "south.hub@company.com",
          address: "Fahaheel Industrial Area, Kuwait",
          working_days: ["mon", "tue", "wed", "thu", "fri", "sat"],
          working_hours_from: "07:30",
          working_hours_to: "19:30",
          has_time_interval: true,
          custom_room: "Express Shipping",
          created_at: "2024-12-18",
        },
      ];

      setWarehouseItems(mockData);
    } catch (error) {
      console.error("Error fetching warehouse items:", error);
      toast({
        title: "Error",
        description: "Failed to fetch warehouse items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Simulating API call - replace with actual data saving
      const newItem: WarehouseItem = {
        id: editingItem ? editingItem.id : String(warehouseItems.length + 1),
        name: formData.name,
        warehouse_type: formData.warehouse_type || null,
        location_type: formData.location_type || null,
        management_types: formData.management_types || [],
        external_id: formData.external_id || null,
        description: formData.description || null,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
        working_days: formData.working_days || [],
        working_hours_from: formData.working_hours_from || null,
        working_hours_to: formData.working_hours_to || null,
        has_time_interval: formData.has_time_interval || false,
        custom_room: formData.custom_room || null,
        created_at: new Date().toISOString(),
      };

      if (editingItem) {
        setWarehouseItems(
          warehouseItems.map((item) =>
            item.id === editingItem.id ? newItem : item
          )
        );
        toast({
          title: "Success",
          description: "Warehouse item updated successfully",
        });
      } else {
        setWarehouseItems([newItem, ...warehouseItems]);
        toast({
          title: "Success",
          description: "Warehouse item added successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      console.error("Error saving warehouse item:", error);
      toast({
        title: "Error",
        description: "Failed to save warehouse item",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: WarehouseItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      warehouse_type: item.warehouse_type || "",
      location_type: item.location_type || "",
      management_types: item.management_types || [],
      external_id: item.external_id || "",
      description: item.description || "",
      phone: item.phone || "",
      email: item.email || "",
      address: item.address || "",
      working_days: item.working_days || ["mon", "tue", "wed", "thu", "fri"],
      working_hours_from: item.working_hours_from || "09:00",
      working_hours_to: item.working_hours_to || "17:00",
      has_time_interval: item.has_time_interval || false,
      custom_room: item.custom_room || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this warehouse item?"))
      return;

    try {
      // Simulating API call - replace with actual delete
      setWarehouseItems(warehouseItems.filter((item) => item.id !== id));
      toast({
        title: "Success",
        description: "Warehouse item deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting warehouse item:", error);
      toast({
        title: "Error",
        description: "Failed to delete warehouse item",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      warehouse_type: "",
      location_type: "",
      management_types: [],
      external_id: "",
      description: "",
      phone: "",
      email: "",
      address: "",
      working_days: ["mon", "tue", "wed", "thu", "fri"],
      working_hours_from: "09:00",
      working_hours_to: "17:00",
      has_time_interval: false,
      custom_room: "",
    });
    setEditingItem(null);
  };

  const getStockStatus = (quantity: number, minStock: number | null) => {
    if (!minStock) return "neutral";
    if (quantity === 0) return "out-of-stock";
    if (quantity <= minStock) return "low-stock";
    return "in-stock";
  };

  const getStockStatusText = (quantity: number, minStock: number | null) => {
    if (!minStock) return "No minimum set";
    if (quantity === 0) return "Out of stock";
    if (quantity <= minStock) return "Low stock";
    return "In stock";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Warehouse className="h-8 w-8" />
              Warehouse
            </h1>
            <p className="text-gray-600">
              Manage your warehouse inventory and products
            </p>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Warehouse
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Warehouse" : "Add New Warehouse"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Warehouse Type and Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="warehouse_type">Warehouse Type</Label>
                    <Select
                      value={formData.warehouse_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, warehouse_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Main Warehouse</SelectItem>
                        <SelectItem value="regional">
                          Regional Warehouse
                        </SelectItem>
                        <SelectItem value="distribution">
                          Distribution Center
                        </SelectItem>
                        <SelectItem value="cold_storage">
                          Cold Storage
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location_type">Location Type</Label>
                    <Select
                      value={formData.location_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, location_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash_room">Cash Room</SelectItem>
                        <SelectItem value="client_location">
                          Client Location
                        </SelectItem>
                        <SelectItem value="standalone">Standalone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Warehouse Management Type */}
                <div className="space-y-3">
                  <Label>Warehouse Management Type</Label>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="product_stock"
                        checked={formData.management_types.includes(
                          "product_stock"
                        )}
                        onChange={(e) => {
                          const types = formData.management_types;
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              management_types: [...types, "product_stock"],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              management_types: types.filter(
                                (type) => type !== "product_stock"
                              ),
                            });
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <Label
                        htmlFor="product_stock"
                        className="text-sm font-normal"
                      >
                        Product stock management
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="spare_parts"
                        checked={formData.management_types.includes(
                          "spare_parts"
                        )}
                        onChange={(e) => {
                          const types = formData.management_types;
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              management_types: [...types, "spare_parts"],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              management_types: types.filter(
                                (type) => type !== "spare_parts"
                              ),
                            });
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <Label
                        htmlFor="spare_parts"
                        className="text-sm font-normal"
                      >
                        Spare parts management
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Name and External ID */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Warehouse name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="external_id">External ID</Label>
                    <Input
                      id="external_id"
                      value={formData.external_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          external_id: e.target.value,
                        })
                      }
                      placeholder="External identifier"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Warehouse description"
                    rows={3}
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="Phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="Email address"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Enter a location"
                    required
                    rows={2}
                  />
                </div>

                {/* Working Days */}
                <div className="space-y-3">
                  <Label>Working Days</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <div key={day} className="flex items-center space-x-1">
                          <input
                            type="checkbox"
                            id={`day-${day.toLowerCase()}`}
                            checked={formData.working_days.includes(
                              day.toLowerCase()
                            )}
                            onChange={(e) => {
                              const days = formData.working_days;
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  working_days: [...days, day.toLowerCase()],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  working_days: days.filter(
                                    (d) => d !== day.toLowerCase()
                                  ),
                                });
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <Label
                            htmlFor={`day-${day.toLowerCase()}`}
                            className="text-sm font-normal"
                          >
                            {day}
                          </Label>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Working Hours */}
                <div className="space-y-3">
                  <Label>Working Hours</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="working_hours_from">From</Label>
                      <Input
                        id="working_hours_from"
                        type="time"
                        value={formData.working_hours_from}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            working_hours_from: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="working_hours_to">To</Label>
                      <Input
                        id="working_hours_to"
                        type="time"
                        value={formData.working_hours_to}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            working_hours_to: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="add_time_interval"
                      checked={formData.has_time_interval}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          has_time_interval: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <Label
                      htmlFor="add_time_interval"
                      className="text-sm font-normal"
                    >
                      Add time interval
                    </Label>
                  </div>
                </div>

                {/* Custom Room */}
                <div className="space-y-2">
                  <Label htmlFor="custom_room">Custom Room</Label>
                  <Input
                    id="custom_room"
                    value={formData.custom_room}
                    onChange={(e) =>
                      setFormData({ ...formData, custom_room: e.target.value })
                    }
                    placeholder="Custom room name"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingItem ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Warehouse Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Warehouse Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            {warehouseItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No warehouse items found. Add your first item to get started.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Working Days</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouseItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{item.warehouse_type || "-"}</div>
                          <div className="text-muted-foreground">
                            {item.location_type || "-"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.address || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {item.phone && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {item.phone}
                            </div>
                          )}
                          {item.email && (
                            <div className="flex items-center mt-1">
                              <Mail className="h-3 w-3 mr-1" />
                              {item.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {item.working_days.length > 0 ? (
                            item.working_days
                              .map((day) => day.substring(0, 3))
                              .join(", ")
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                          {item.working_hours_from && item.working_hours_to && (
                            <div className="text-muted-foreground mt-1">
                              {item.working_hours_from} -{" "}
                              {item.working_hours_to}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WarehousePage;
