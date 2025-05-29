import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import type { NextPageWithLayout } from "../_app";
import { useState, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { PRODUCTS } from "@/data/mock";
import { ProductCatalogCard } from "@/components/shared/product/ProductCatalogCard";
import { api } from "@/utils/api";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { productFormSchema, type ProductFormSchema } from "@/forms/product";
import { ProductForm } from "@/components/shared/product/ProductForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const ProductsPage: NextPageWithLayout = () => {
  const apiUtils = api.useUtils();

  const { data: products } = api.product.getProducts.useQuery();

  const [uplaodedImageUrl, setUplaodedImageUrl] = useState<string | null>(null);

  const { mutate: createProduct, isPending: isCreateProductPending } =
    api.product.createProduct.useMutation({
      onSuccess: async () => {
        await apiUtils.product.getProducts.invalidate();

        alert("Successfully created new product");
        setCreateProductDialogOpen(false);
      },
    });

  const { mutate: deleteProduct } = api.product.deleteProductById.useMutation({
    onSuccess: async () => {
      await apiUtils.product.getProducts.invalidate();

      alert("Successfully deleted a product");
    },
  });

  const { mutate: editProduct } = api.product.editProduct.useMutation({
    onSuccess: async () => {
      await apiUtils.product.getProducts.invalidate();

      alert("Successfully edited a product");
    },
  });

  const [createProductDialogOpen, setCreateProductDialogOpen] = useState(false);

  const createProductForm = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
  });

  const handelSubmitCreateProduct = (values: ProductFormSchema) => {
    if (!uplaodedImageUrl) {
      alert("Please upload an image or waiting for the image to be uploaded");
      return;
    }

    createProduct({
      name: values.name,
      price: values.price,
      categoryId: values.categoryId,
      imageUrl: uplaodedImageUrl,
    });
  };

  return (
    <>
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Product Management</DashboardTitle>
            <DashboardDescription>
              View, add, edit, and delete products in your inventory.
            </DashboardDescription>
          </div>

          <AlertDialog
            open={createProductDialogOpen}
            onOpenChange={setCreateProductDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button>Add New Product</Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create Product</AlertDialogTitle>
              </AlertDialogHeader>

              <Form {...createProductForm}>
                <ProductForm
                  onSubmit={handelSubmitCreateProduct}
                  onChangeImageUrl={setUplaodedImageUrl}
                />
              </Form>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <Button
                  onClick={createProductForm.handleSubmit(
                    handelSubmitCreateProduct,
                  )}
                  disabled={isCreateProductPending}
                >
                  {isCreateProductPending && (
                    <Loader2 className="animate-spin" />
                  )}
                  Create Product
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* {PRODUCTS.map((product) => (
          <ProductCatalogCard
            key={product.id}
            name={product.name}
            price={product.price}
            image={product.image ?? ""}
            category={product.category}
            onEdit={() => void 0}
            onDelete={() => void 0}
          />
        ))} */}

        {products?.map((product) => (
          <ProductCatalogCard
            key={product.id}
            name={product.name}
            price={product.price}
            image={product.imageUrl ?? ""}
            category={product.category.id}
            onEdit={() => void 0}
            onDelete={() => void 0}
          />
        ))}
      </div>
    </>
  );
};

ProductsPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default ProductsPage;
