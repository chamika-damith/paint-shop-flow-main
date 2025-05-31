import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import AddSupplierForm from "@/components/AddSupplierForm";
import { supplierApi } from "@/api/supplierApi";
import { Supplier } from "@/types";
import { Truck } from "lucide-react";

const AddSupplier = () => {
  const { id } = useParams();
  const [supplier, setSupplier] = useState<Supplier | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSupplier = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const response = await supplierApi.getSupplierById(id);
        setSupplier(response.data);
      } catch (error) {
        console.error("Failed to fetch supplier:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Truck className="mr-2" /> {id ? "Edit" : "Add"} Supplier
          </h1>
          <p className="text-gray-500 mt-1">
            {id ? "Update supplier information" : "Add a new supplier to your system"}
          </p>
        </div>

        <div className="max-w-4xl">
          <AddSupplierForm initialData={supplier} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddSupplier; 