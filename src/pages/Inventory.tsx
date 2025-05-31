import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "@/redux/slices/inventorySlice";
import { fetchSuppliers } from "@/redux/slices/supplierSlice";
import { InventoryItem } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Search, MoreVertical, Plus, Filter, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const categories = ["All", "Paints", "Canvases", "Brushes", "Tools", "Equipment"];
const statuses = ["All", "In Stock", "Low Stock", "Out of Stock"];
const inventoryStatuses = ["In Stock", "Low Stock", "Out of Stock"] as const;

const Inventory = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.inventory);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const { suppliers } = useAppSelector((state) => state.suppliers);

  const filteredInventory = items.filter((item) => {
    const matchesSearch = 
      (item.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem({...item});
    setIsEditDialogOpen(true);
  };

  const handleDelete = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateItem = async (updatedItem: InventoryItem) => {
    if (!updatedItem || !updatedItem._id) return;
    
    try {
      await dispatch(updateInventoryItem({ 
        id: updatedItem._id, 
        item: {
          name: updatedItem.name,
          category: updatedItem.category,
          quantity: updatedItem.quantity,
          price: updatedItem.price,
          supplier: updatedItem.supplier,
          status: updatedItem.status,
          description: updatedItem.description
        }
      })).unwrap();
      setIsEditDialogOpen(false);
      setSelectedItem(null);
      toast.success(`${updatedItem.name} has been updated.`);
    } catch (error: any) {
      toast.error('Failed to update item: ' + (error.message || 'Unknown error'));
      console.error('Update error:', error);
    }
  };

  const confirmDelete = async () => {
    if (!selectedItem?._id) return;

    try {
      await dispatch(deleteInventoryItem(selectedItem._id)).unwrap();
      toast.success(`${selectedItem.name} has been deleted from inventory.`);
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    } catch (error: any) {
      toast.error('Failed to delete item: ' + (error.message || 'Unknown error'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800";
      case "Out of Stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedStatus("All");
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Package className="mr-2" /> Inventory Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your products and stock levels
            </p>
          </div>
          <Button 
            className="bg-primary"
            onClick={() => navigate("/inventory/add")}
          >
            <Plus className="mr-1 h-5 w-5" /> Add New Item
          </Button>
        </div>

        <Card className="paint-card">
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>
              View and manage all inventory items in your store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search items..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={resetFilters}
                >
                  Clear Filters
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Stock Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>
                  {filteredInventory.length} items found
                  {(selectedCategory !== "All" || selectedStatus !== "All" || searchTerm) && " with current filters"}
                </span>
              </div>
            </div>

            <div className="rounded-md border mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inventory ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.length > 0 ? (
                    filteredInventory.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-medium">INV-ITEM-{item._id.substr(-6)}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEdit(item)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Item
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(item)} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Item
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="h-24 text-center"
                      >
                        No items found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update the inventory item information below.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name">Name:</label>
                <Input
                  id="name"
                  className="col-span-3"
                  value={selectedItem.name}
                  onChange={(e) => setSelectedItem({...selectedItem, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="category">Category:</label>
                <Select
                  value={selectedItem.category}
                  onValueChange={(value) => setSelectedItem({...selectedItem, category: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => cat !== "All").map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="quantity">Quantity:</label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  className="col-span-3"
                  value={selectedItem.quantity}
                  onChange={(e) => setSelectedItem({...selectedItem, quantity: parseInt(e.target.value)})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="price">Price:</label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  className="col-span-3"
                  value={selectedItem.price}
                  onChange={(e) => setSelectedItem({...selectedItem, price: parseFloat(e.target.value)})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="supplier">Supplier:</label>
                <Select
                  value={selectedItem.supplier}
                  onValueChange={(value) => setSelectedItem({...selectedItem, supplier: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers
                      .filter(supplier => supplier.status === 'Active')
                      .map((supplier) => (
                        <SelectItem key={supplier._id} value={supplier._id}>
                          {supplier.name}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="status">Status:</label>
                <Select
                  value={selectedItem.status}
                  onValueChange={(value) => setSelectedItem({...selectedItem, status: value as InventoryItem['status']})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedItem && handleUpdateItem(selectedItem)}>
              Update Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedItem?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
    </DashboardLayout>
  );
};

export default Inventory;
