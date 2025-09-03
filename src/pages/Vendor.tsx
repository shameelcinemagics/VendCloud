import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
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

interface Vendor {
  id: string;
  name: string;
  contact_person?: string;
  email: string;
  phone: string;
  mobile?: string;
  address?: string;
  street?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  tax_id?: string;
  pricelist?: string;
  internal_notes?: string;
  website?: string;
  xerio_contact_id?: string;
  print_to_xerio_1?: boolean;
  print_to_xerio_2?: boolean;
  vendor_products?: Array<{
    item: string;
    vendor_item_name: string;
    vendor_item_code: string;
    start_date: string;
    end_date: string;
    min_quantity: string;
    price: string;
  }>;
  category?: string;
  products_supplied: string[];
  payment_terms?: string;
  created_at: string;
  status: "active" | "inactive";
}

const VendorPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    mobile: "",
    address: "",
    street: "",
    street2: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    tax_id: "",
    pricelist: "",
    internal_notes: "",
    website: "",
    xerio_contact_id: "",
    print_to_xerio_1: false,
    print_to_xerio_2: false,
    vendor_products: [
      {
        item: "",
        vendor_item_name: "",
        vendor_item_code: "",
        start_date: "",
        end_date: "",
        min_quantity: "",
        price: "",
      },
    ],
    category: "",
    products_supplied: "",
    payment_terms: "",
    status: "active",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      // Simulating API call - replace with actual data fetching
      const mockData: Vendor[] = [
        {
          id: "1",
          name: "BevCo Distributors",
          contact_person: "Ahmed Al-Mansour",
          email: "ahmed@bevco.com",
          phone: "+965 1234 5678",
          mobile: "+965 5000 1234",
          address: "Al-Shuhada St, Kuwait City",
          street: "Al-Shuhada Street",
          city: "Kuwait City",
          state: "",
          zip: "12345",
          country: "Kuwait",
          tax_id: "KW123456789",
          pricelist: "wholesale",
          internal_notes: "Primary beverage supplier - reliable delivery",
          website: "https://bevco.com",
          xerio_contact_id: "XER-BEV-001",
          print_to_xerio_1: true,
          print_to_xerio_2: false,
          vendor_products: [
            {
              item: "Energy drinks",
              vendor_item_name: "Energy Boost",
              vendor_item_code: "EN-BST-001",
              start_date: "2024-01-01",
              end_date: "2024-12-31",
              min_quantity: "100",
              price: "1.250",
            },
            {
              item: "Soft drinks",
              vendor_item_name: "Cola Classic",
              vendor_item_code: "COLA-CLS-002",
              start_date: "2024-01-01",
              end_date: "2024-12-31",
              min_quantity: "150",
              price: "0.750",
            },
          ],
          category: "Beverages",
          products_supplied: ["Energy drinks", "Soft drinks", "Juices"],
          payment_terms: "Net 30",
          created_at: "2025-01-15",
          status: "active",
        },
        {
          id: "2",
          name: "AquaSource Water Co.",
          contact_person: "Fatima Al-Sabah",
          email: "fatima@aquasource.com",
          phone: "+965 2233 4455",
          mobile: "+965 5000 2233",
          address: "Hawalli, Block 5, Kuwait",
          street: "Block 5, Street 12",
          city: "Hawalli",
          state: "",
          zip: "23456",
          country: "Kuwait",
          tax_id: "KW234567890",
          pricelist: "standard",
          internal_notes:
            "Premium water supplier - next day delivery available",
          website: "https://aquasource.com",
          xerio_contact_id: "XER-AQU-002",
          print_to_xerio_1: true,
          print_to_xerio_2: true,
          vendor_products: [
            {
              item: "Mineral water",
              vendor_item_name: "Pure Mineral",
              vendor_item_code: "WTR-MIN-101",
              start_date: "2024-02-01",
              end_date: "2024-11-30",
              min_quantity: "200",
              price: "0.400",
            },
          ],
          category: "Water",
          products_supplied: [
            "Mineral water",
            "Sparkling water",
            "Flavored water",
          ],
          payment_terms: "Net 15",
          created_at: "2024-11-20",
          status: "active",
        },
        {
          id: "3",
          name: "EnergyDrink Inc.",
          contact_person: "Mohammed Hassan",
          email: "m.hassan@energydrink.com",
          phone: "+965 3344 5566",
          mobile: "+965 5000 3344",
          address: "Salmiya, Kuwait",
          street: "Salem Al-Mubarak Street",
          city: "Salmiya",
          state: "",
          zip: "34567",
          country: "Kuwait",
          tax_id: "KW345678901",
          pricelist: "contract",
          internal_notes:
            "Specializes in energy products - exclusive distributor",
          website: "https://energydrink.com",
          xerio_contact_id: "XER-ENG-003",
          print_to_xerio_1: false,
          print_to_xerio_2: true,
          vendor_products: [
            {
              item: "Energy drinks",
              vendor_item_name: "Power Surge",
              vendor_item_code: "EN-PWR-201",
              start_date: "2024-03-15",
              end_date: "2024-12-15",
              min_quantity: "75",
              price: "1.500",
            },
          ],
          category: "Energy",
          products_supplied: [
            "Energy drinks",
            "Energy shots",
            "Supplement drinks",
          ],
          payment_terms: "Net 45",
          created_at: "2025-03-10",
          status: "active",
        },
        {
          id: "4",
          name: "SodaWorks Kuwait",
          contact_person: "Layla Abdullah",
          email: "layla@sodaworks.com",
          phone: "+965 4455 6677",
          mobile: "+965 5000 4455",
          address: "Farwaniya, Industrial Area",
          street: "Industrial Street 5",
          city: "Farwaniya",
          state: "",
          zip: "45678",
          country: "Kuwait",
          tax_id: "KW456789012",
          pricelist: "retail",
          internal_notes:
            "Carbonated beverages specialist - seasonal promotions",
          website: "https://sodaworks.com",
          xerio_contact_id: "XER-SOD-004",
          print_to_xerio_1: true,
          print_to_xerio_2: false,
          vendor_products: [
            {
              item: "Sodas",
              vendor_item_name: "Cola Fusion",
              vendor_item_code: "SOD-COL-301",
              start_date: "2024-01-01",
              end_date: "2024-12-31",
              min_quantity: "120",
              price: "0.850",
            },
          ],
          category: "Beverages",
          products_supplied: ["Sodas", "Carbonated drinks", "Mixers"],
          payment_terms: "Net 30",
          created_at: "2024-09-05",
          status: "active",
        },
        {
          id: "5",
          name: "Healthy Snacks Co.",
          contact_person: "Noura Al-Fares",
          email: "noura@healthysnacks.com",
          phone: "+965 5566 7788",
          mobile: "+965 5000 5566",
          address: "Jahra, Kuwait",
          street: "Jahra Road, Block 3",
          city: "Jahra",
          state: "",
          zip: "56789",
          country: "Kuwait",
          tax_id: "KW567890123",
          pricelist: "standard",
          internal_notes:
            "Healthy snacks - currently inactive due to restructuring",
          website: "https://healthysnacks.com",
          xerio_contact_id: "XER-SNK-005",
          print_to_xerio_1: false,
          print_to_xerio_2: false,
          vendor_products: [
            {
              item: "Granola bars",
              vendor_item_name: "Nutri-Bar",
              vendor_item_code: "SNK-GRN-401",
              start_date: "2024-01-01",
              end_date: "2024-06-30",
              min_quantity: "50",
              price: "2.250",
            },
          ],
          category: "Snacks",
          products_supplied: ["Granola bars", "Nuts", "Dried fruits"],
          payment_terms: "Net 15",
          created_at: "2025-02-28",
          status: "inactive",
        },
      ];

      setVendors(mockData);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast({
        title: "Error",
        description: "Failed to fetch vendors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productsArray = formData.products_supplied
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");

      const newVendor: Vendor = {
        id: editingVendor ? editingVendor.id : String(vendors.length + 1),
        name: formData.name,
        contact_person: formData.contact_person,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        category: formData.category,
        products_supplied: productsArray,
        payment_terms: formData.payment_terms,
        created_at: new Date().toISOString(),
        status: formData.status as "active" | "inactive",
      };

      if (editingVendor) {
        setVendors(
          vendors.map((vendor) =>
            vendor.id === editingVendor.id ? newVendor : vendor
          )
        );
        toast({
          title: "Success",
          description: "Vendor updated successfully",
        });
      } else {
        setVendors([newVendor, ...vendors]);
        toast({
          title: "Success",
          description: "Vendor added successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingVendor(null);
      resetForm();
    } catch (error) {
      console.error("Error saving vendor:", error);
      toast({
        title: "Error",
        description: "Failed to save vendor",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      contact_person: vendor.contact_person || "",
      email: vendor.email,
      phone: vendor.phone,
      mobile: vendor.mobile || "",
      address: vendor.address || "",
      street: vendor.street || "",
      street2: vendor.street2 || "",
      city: vendor.city || "",
      state: vendor.state || "",
      zip: vendor.zip || "",
      country: vendor.country || "",
      tax_id: vendor.tax_id || "",
      pricelist: vendor.pricelist || "",
      internal_notes: vendor.internal_notes || "",
      website: vendor.website || "",
      xerio_contact_id: vendor.xerio_contact_id || "",
      print_to_xerio_1: vendor.print_to_xerio_1 || false,
      print_to_xerio_2: vendor.print_to_xerio_2 || false,
      vendor_products: vendor.vendor_products || [
        {
          item: "",
          vendor_item_name: "",
          vendor_item_code: "",
          start_date: "",
          end_date: "",
          min_quantity: "",
          price: "",
        },
      ],
      category: vendor.category || "",
      products_supplied: vendor.products_supplied.join(", "),
      payment_terms: vendor.payment_terms || "",
      status: vendor.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;

    try {
      // Simulating API call - replace with actual delete
      setVendors(vendors.filter((vendor) => vendor.id !== id));
      toast({
        title: "Success",
        description: "Vendor deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting vendor:", error);
      toast({
        title: "Error",
        description: "Failed to delete vendor",
        variant: "destructive",
      });
    }
  };

  const toggleVendorStatus = async (
    id: string,
    currentStatus: "active" | "inactive"
  ) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      setVendors(
        vendors.map((vendor) =>
          vendor.id === id ? { ...vendor, status: newStatus } : vendor
        )
      );

      toast({
        title: "Success",
        description: `Vendor ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully`,
      });
    } catch (error) {
      console.error("Error updating vendor status:", error);
      toast({
        title: "Error",
        description: "Failed to update vendor status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      mobile: "",
      address: "",
      street: "",
      street2: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      tax_id: "",
      pricelist: "",
      internal_notes: "",
      website: "",
      xerio_contact_id: "",
      print_to_xerio_1: false,
      print_to_xerio_2: false,
      vendor_products: [
        {
          item: "",
          vendor_item_name: "",
          vendor_item_code: "",
          start_date: "",
          end_date: "",
          min_quantity: "",
          price: "",
        },
      ],
      category: "",
      products_supplied: "",
      payment_terms: "",
      status: "active",
    });
    setEditingVendor(null);
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
              <ShoppingCart className="h-8 w-8" />
              Vendors
            </h1>
            <p className="text-gray-600">
              Manage your product suppliers and vendors
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
                Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {editingVendor ? "Edit Vendor" : "Add New Vendor"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Vendor Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Vendor Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Lumber Inc"
                    required
                  />
                </div>

                {/* Sheet Section */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Sheet</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street</Label>
                      <Input
                        id="street"
                        value={formData.street}
                        onChange={(e) =>
                          setFormData({ ...formData, street: e.target.value })
                        }
                        placeholder="Street address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="street2">Street 2</Label>
                      <Input
                        id="street2"
                        value={formData.street2}
                        onChange={(e) =>
                          setFormData({ ...formData, street2: e.target.value })
                        }
                        placeholder="Additional address info"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        value={formData.zip}
                        onChange={(e) =>
                          setFormData({ ...formData, zip: e.target.value })
                        }
                        placeholder="ZIP code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        placeholder="Country"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax_id">Tax ID</Label>
                      <Input
                        id="tax_id"
                        value={formData.tax_id}
                        onChange={(e) =>
                          setFormData({ ...formData, tax_id: e.target.value })
                        }
                        placeholder="Tax identification number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pricelist">Pricelist</Label>
                      <Select
                        value={formData.pricelist}
                        onValueChange={(value) =>
                          setFormData({ ...formData, pricelist: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select pricelist" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="wholesale">Wholesale</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="internal_notes">Internal Notes</Label>
                    <Textarea
                      id="internal_notes"
                      value={formData.internal_notes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          internal_notes: e.target.value,
                        })
                      }
                      placeholder="Internal notes and comments"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Line Section */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Line</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+965 1234 5678"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile</Label>
                      <Input
                        id="mobile"
                        value={formData.mobile}
                        onChange={(e) =>
                          setFormData({ ...formData, mobile: e.target.value })
                        }
                        placeholder="Mobile number"
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
                        placeholder="vendor@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website Link</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) =>
                          setFormData({ ...formData, website: e.target.value })
                        }
                        placeholder="https://example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="xerio_contact_id">Xerio Contact ID</Label>
                      <Input
                        id="xerio_contact_id"
                        value={formData.xerio_contact_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            xerio_contact_id: e.target.value,
                          })
                        }
                        placeholder="Xerio contact identifier"
                      />
                    </div>
                  </div>
                </div>

                {/* Chart Section */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Chart</h3>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="print_to_xerio_1"
                        checked={formData.print_to_xerio_1}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            print_to_xerio_1: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <Label
                        htmlFor="print_to_xerio_1"
                        className="text-sm font-normal"
                      >
                        Print text to Xerio
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="print_to_xerio_2"
                        checked={formData.print_to_xerio_2}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            print_to_xerio_2: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <Label
                        htmlFor="print_to_xerio_2"
                        className="text-sm font-normal"
                      >
                        Print text to Xerio
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Table Section */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Vendor Products</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-10 gap-2 text-xs font-medium text-gray-500 mb-2">
                      <div className="col-span-2">Item</div>
                      <div className="col-span-2">Vendor Item Name</div>
                      <div className="col-span-1">Vendor Item Code</div>
                      <div className="col-span-1">Start Date</div>
                      <div className="col-span-1">End Date</div>
                      <div className="col-span-1">Min. Quantity</div>
                      <div className="col-span-1">Price</div>
                      <div className="col-span-1">Action</div>
                    </div>

                    {formData.vendor_products.map((product, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-10 gap-2 mb-2 items-center"
                      >
                        <div className="col-span-2">
                          <Input
                            value={product.item}
                            onChange={(e) => {
                              const newProducts = [...formData.vendor_products];
                              newProducts[index].item = e.target.value;
                              setFormData({
                                ...formData,
                                vendor_products: newProducts,
                              });
                            }}
                            placeholder="Item"
                            className="text-xs h-8"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            value={product.vendor_item_name}
                            onChange={(e) => {
                              const newProducts = [...formData.vendor_products];
                              newProducts[index].vendor_item_name =
                                e.target.value;
                              setFormData({
                                ...formData,
                                vendor_products: newProducts,
                              });
                            }}
                            placeholder="Vendor Item Name"
                            className="text-xs h-8"
                          />
                        </div>
                        <div className="col-span-1">
                          <Input
                            value={product.vendor_item_code}
                            onChange={(e) => {
                              const newProducts = [...formData.vendor_products];
                              newProducts[index].vendor_item_code =
                                e.target.value;
                              setFormData({
                                ...formData,
                                vendor_products: newProducts,
                              });
                            }}
                            placeholder="Code"
                            className="text-xs h-8"
                          />
                        </div>
                        <div className="col-span-1">
                          <Input
                            type="date"
                            value={product.start_date}
                            onChange={(e) => {
                              const newProducts = [...formData.vendor_products];
                              newProducts[index].start_date = e.target.value;
                              setFormData({
                                ...formData,
                                vendor_products: newProducts,
                              });
                            }}
                            className="text-xs h-8"
                          />
                        </div>
                        <div className="col-span-1">
                          <Input
                            type="date"
                            value={product.end_date}
                            onChange={(e) => {
                              const newProducts = [...formData.vendor_products];
                              newProducts[index].end_date = e.target.value;
                              setFormData({
                                ...formData,
                                vendor_products: newProducts,
                              });
                            }}
                            className="text-xs h-8"
                          />
                        </div>
                        <div className="col-span-1">
                          <Input
                            type="number"
                            value={product.min_quantity}
                            onChange={(e) => {
                              const newProducts = [...formData.vendor_products];
                              newProducts[index].min_quantity = e.target.value;
                              setFormData({
                                ...formData,
                                vendor_products: newProducts,
                              });
                            }}
                            placeholder="Min Qty"
                            className="text-xs h-8"
                          />
                        </div>
                        <div className="col-span-1">
                          <Input
                            type="number"
                            step="0.01"
                            value={product.price}
                            onChange={(e) => {
                              const newProducts = [...formData.vendor_products];
                              newProducts[index].price = e.target.value;
                              setFormData({
                                ...formData,
                                vendor_products: newProducts,
                              });
                            }}
                            placeholder="Price"
                            className="text-xs h-8"
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newProducts =
                                formData.vendor_products.filter(
                                  (_, i) => i !== index
                                );
                              setFormData({
                                ...formData,
                                vendor_products: newProducts,
                              });
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          vendor_products: [
                            ...formData.vendor_products,
                            {
                              item: "",
                              vendor_item_name: "",
                              vendor_item_code: "",
                              start_date: "",
                              end_date: "",
                              min_quantity: "",
                              price: "",
                            },
                          ],
                        });
                      }}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Product
                    </Button>
                  </div>
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
                    {editingVendor ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Vendors List */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor List</CardTitle>
          </CardHeader>
          <CardContent>
            {vendors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No vendors found. Add your first vendor to get started.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Payment Terms</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <div className="font-medium">{vendor.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {vendor.address}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {vendor.email}
                          </div>
                          <div className="flex items-center mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {vendor.phone}
                          </div>
                          <div className="mt-1">{vendor.contact_person}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {vendor.category ? (
                          <Badge variant="outline" className="capitalize">
                            {vendor.category}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {vendor.products_supplied
                            .slice(0, 3)
                            .map((product, index) => (
                              <div
                                key={index}
                                className="truncate max-w-[120px]"
                              >
                                {product}
                              </div>
                            ))}
                          {vendor.products_supplied.length > 3 && (
                            <div className="text-muted-foreground">
                              +{vendor.products_supplied.length - 3} more
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {vendor.payment_terms || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            vendor.status === "active" ? "default" : "secondary"
                          }
                          className="cursor-pointer"
                          onClick={() =>
                            toggleVendorStatus(vendor.id, vendor.status)
                          }
                        >
                          {vendor.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(vendor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(vendor.id)}
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

export default VendorPage;
