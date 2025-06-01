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
  AlertDialogDescription,
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
import {
  deleteFileFromBucket,
  extractPathFromSupabaseUrl,
} from "@/lib/supabase";
import { Bucket } from "@/server/bucket";
import { toast } from "sonner";

const ProductsPage: NextPageWithLayout = () => {
  const [createProductDialogOpen, setCreateProductDialogOpen] = useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<string>("0");
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [uplaodedImageUrl, setUplaodedImageUrl] = useState<string | null>(null);
  const [deleteUploadImageUrl, setDeleteUploadImageUrl] = useState<
    string | null
  >(null);

  const createProductForm = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
  });
  const editProductForm = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema),
  });

  const apiUtils = api.useUtils();

  const { data: products } = api.product.getProducts.useQuery({
    categoryId: "all",
  });

  const { mutate: createProduct, isPending: isCreateProductPending } =
    api.product.createProduct.useMutation({
      onSuccess: async () => {
        await apiUtils.product.getProducts.invalidate();

        toast("Successfully created new product");
        setCreateProductDialogOpen(false);
        setUplaodedImageUrl(null);
        createProductForm.reset();
      },
    });

  const { mutate: deleteProduct, isPending: isDeleteProductPending } =
    api.product.deleteProductById.useMutation({
      onSuccess: async () => {
        await apiUtils.product.getProducts.invalidate();

        toast("Successfully deleted a product");
        setDeleteUploadImageUrl(null);
      },
    });

  const { mutate: editProduct, isPending: isEditProductPending } =
    api.product.editProduct.useMutation({
      onSuccess: async () => {
        await apiUtils.product.getProducts.invalidate();

        toast("Successfully edited a product");

        console.log(deleteUploadImageUrl);

        deleteFileFromBucket({
          path: deleteUploadImageUrl!,
          bucket: Bucket.ProductImages,
        });

        setEditProductDialogOpen(false);
        setUplaodedImageUrl(null);
        setDeleteUploadImageUrl(null);
        editProductForm.reset();
      },
    });

  const handleClickEditProduct = (
    product: ProductFormSchema & { id: string; imageUrl: string },
  ) => {
    const image = extractPathFromSupabaseUrl(product.imageUrl);

    setEditProductDialogOpen(true);
    setProductToEdit(product.id);
    setDeleteUploadImageUrl(image);

    editProductForm.reset({
      name: product.name,
      price: product.price,
      categoryId: product.categoryId,
    });
  };
  const handleClickDeleteProduct = (productId: string, imageUrl: string) => {
    const image = extractPathFromSupabaseUrl(imageUrl);

    setDeleteUploadImageUrl(image);
    setProductToDelete(productId);
  };

  const handelSubmitCreateProduct = (values: ProductFormSchema) => {
    if (!uplaodedImageUrl) {
      toast("Please upload an image or waiting for the image to be uploaded");
      return;
    }

    createProduct({
      name: values.name,
      price: values.price,
      categoryId: values.categoryId,
      imageUrl: uplaodedImageUrl,
    });
  };

  const handelSubmitEditProduct = (values: ProductFormSchema) => {
    const image = uplaodedImageUrl || deleteUploadImageUrl!;

    console.log(image);

    editProduct({
      id: productToEdit,
      name: values.name,
      price: values.price,
      categoryId: values.categoryId,
      imageUrl: image,
    });
  };
  const handleConfirmDeleteProduct = () => {
    deleteProduct({ id: productToDelete! });
    setProductToDelete(null);
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
            image={product.imageUrl!}
            category={product.category.name}
            onEdit={() => {
              handleClickEditProduct({
                id: product.id,
                name: product.name,
                price: product.price,
                categoryId: product.category.id,
                imageUrl: product.imageUrl!,
              });
            }}
            onDelete={() =>
              handleClickDeleteProduct(product.id, product.imageUrl!)
            }
          />
        ))}
      </div>

      <AlertDialog
        open={editProductDialogOpen}
        onOpenChange={setEditProductDialogOpen}
      >
        <AlertDialogTrigger asChild>
          <Button>Edit Product</Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Product</AlertDialogTitle>
          </AlertDialogHeader>

          <Form {...editProductForm}>
            <ProductForm
              onSubmit={handelSubmitCreateProduct}
              onChangeImageUrl={setUplaodedImageUrl}
            />
          </Form>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <Button
              onClick={editProductForm.handleSubmit(handelSubmitEditProduct)}
              disabled={isCreateProductPending}
            >
              {isEditProductPending && <Loader2 className="animate-spin" />}
              Edit Product
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setProductToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteProduct}
              disabled={isDeleteProductPending}
            >
              {isDeleteProductPending && <Loader2 className="animate-spin" />}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

ProductsPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default ProductsPage;
