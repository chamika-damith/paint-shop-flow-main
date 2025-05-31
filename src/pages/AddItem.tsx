import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { addInventoryItem } from "@/redux/slices/inventorySlice";
import { fetchSuppliers } from "@/redux/slices/supplierSlice";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, ArrowLeft } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Item name must be at least 2 characters."
  }),
  category: z.string().min(1, {
    message: "Please select a category."
  }),
  quantity: z.coerce.number().int().min(0, {
    message: "Quantity must be a non-negative number."
  }),
  price: z.coerce.number().min(0, {
    message: "Price must be a non-negative number."
  }),
  supplier: z.string().min(1, {
    message: "Please select a supplier.",
  }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Categories for the dropdown
const categories = [
  "Paints",
  "Brushes",
  "Canvases",
  "Tools",
  "Equipment",
  "Paper",
  "Other"
];

const AddItem = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { suppliers } = useAppSelector((state) => state.suppliers);

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  // Form initialization with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      quantity: 1,
      price: 0,
      supplier: "",
      description: "",
    },
  });

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      // Calculate initial status based on quantity
      const status = values.quantity === 0 ? 'Out of Stock' : values.quantity <= 10 ? 'Low Stock' : 'In Stock';

      const itemData = {
        name: values.name,
        category: values.category,
        quantity: values.quantity,
        price: values.price,
        supplier: values.supplier,
        status: status,
        description: values.description || '',
        reorderPoint: 10 // Default reorder point
      };

      const result = await dispatch(addInventoryItem(itemData)).unwrap();
      
      toast.success("Item added successfully!", {
        description: `${values.name} has been added to inventory.`,
      });
      navigate("/inventory");
    } catch (error: any) {
      toast.error("Failed to add item", {
        description: error.message || "An error occurred while adding the item.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Package className="mr-2" /> Add New Item
            </h1>
            <p className="text-gray-500 mt-1">
              Add a new item to your inventory
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate("/inventory")}
          >
            <ArrowLeft className="mr-1 h-5 w-5" /> Back to Inventory
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Item Information</CardTitle>
            <CardDescription>
              Enter the details of the new inventory item
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter item name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Quantity */}
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Price */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Supplier */}
                  <FormField
                    control={form.control}
                    name="supplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a supplier" />
                            </SelectTrigger>
                          </FormControl>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter item description" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => navigate("/inventory")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Item"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddItem;
