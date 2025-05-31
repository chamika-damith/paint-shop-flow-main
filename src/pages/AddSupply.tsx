import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Package2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Supply name must be at least 2 characters.",
  }),
  customer: z.string().min(1, {
    message: "Please select a customer.",
  }),
  quantity: z.coerce.number().int().positive({
    message: "Quantity must be a positive number.",
  }),
  reorderPoint: z.coerce.number().int().positive({
    message: "Reorder point must be a positive number.",
  }),
  customerStatus: z.string().min(1, {
    message: "Please select a customer status.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

// Sample customers for the dropdown
const customers = [
  "Regular Customer",
  "VIP Customer",
  "Corporate Customer",
];

const customerStatuses = ["Active", "Inactive", "On Hold"];

const AddSupply = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  // Form initialization with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      customer: "",
      quantity: 1,
      reorderPoint: 10,
      customerStatus: "Active",
    },
  });

  useEffect(() => {
    if (isEditing) {
      // In a real app, this would fetch the supply data from an API
      // For now, we'll use mock data
      const mockSupply = {
        name: "Acrylic Paint - Blue",
        customer: "Regular Customer",
        quantity: 25,
        reorderPoint: 10,
        customerStatus: "Active",
      };

      // Set form values
      Object.entries(mockSupply).forEach(([key, value]) => {
        form.setValue(key as keyof FormValues, value);
      });
    }
  }, [isEditing, form]);

  const onSubmit = (values: FormValues) => {
    // In a real app, this would make an API call
    toast.success(
      isEditing
        ? `Supply "${values.name}" has been updated.`
        : `Supply "${values.name}" has been added.`
    );
    navigate("/supplies");
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/supplies")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Package2 className="mr-2" /> {isEditing ? "Edit" : "Add"} Supply
            </h1>
            <p className="text-gray-500 mt-1">
              {isEditing ? "Edit an existing supply" : "Add a new supply to your inventory"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Supply Details</CardTitle>
            <CardDescription>
              Enter the details of the supply item.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supply Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter supply name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer} value={customer}>
                              {customer}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reorderPoint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reorder Point</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormDescription>
                          Minimum quantity before reordering
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="customerStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customerStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => navigate("/supplies")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isEditing ? "Update Supply" : "Add Supply"}
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

export default AddSupply; 