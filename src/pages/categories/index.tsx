import {
  DashboardDescription,
  DashboardHeader,
  DashboardLayout,
  DashboardTitle,
} from "@/components/layouts/DashboardLayout";
import { CategoryCatalogCard } from "@/components/shared/category/CategoryCatalogCard";
import { CategoryForm } from "@/components/shared/category/CategoryForm";
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
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CATEGORIES, type Category } from "@/data/mock";
import { categoryFormSchema, type CategoryFormSchema } from "@/forms/category";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactElement } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { NextPageWithLayout } from "../_app";
import { api } from "@/utils/api";
import { Loader2 } from "lucide-react";

const CategoriesPage: NextPageWithLayout = () => {
  const [createCategoryDialogOpen, setCreateCategoryDialogOpen] =
    useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<string>("0");

  const apiUtils = api.useUtils();

  const createCategoryForm = useForm<CategoryFormSchema>({
    resolver: zodResolver(categoryFormSchema),
  });

  const editCategoryForm = useForm<CategoryFormSchema>({
    resolver: zodResolver(categoryFormSchema),
  });

  const { data: categories, isLoading: isCategoryLoading } =
    api.category.getCategories.useQuery();

  const { mutate: createCategory, isPending: isCreateCategoryPending } =
    api.category.createCategory.useMutation({
      onSuccess: async () => {
        await apiUtils.category.getCategories.invalidate();

        alert("Successfully created a new category");
        setCreateCategoryDialogOpen(false);
        createCategoryForm.reset();
      },
    });

  const { mutate: deleteCategory, isPending: isDeleteCategoryPending } =
    api.category.deleteCategoryById.useMutation({
      onSuccess: async () => {
        await apiUtils.category.getCategories.invalidate();

        alert("Successfully deleted a category");
        setCategoryToDelete(null);
      },
    });

  const { mutate: editCategory, isPending: isEditCategoryPending } =
    api.category.editCategory.useMutation({
      onSuccess: async () => {
        await apiUtils.category.getCategories.invalidate();

        alert("Successfully edited a category");
        setEditCategoryDialogOpen(false);
      },
    });

  const handleSubmitCreateCategory = (data: CategoryFormSchema) => {
    console.log(data);
    createCategory({
      name: data.name,
    });
  };

  const handleSubmitEditCategory = (data: CategoryFormSchema) => {
    if (!categoryToEdit) {
      return;
    }

    editCategory({
      id: categoryToEdit,
      name: data.name,
    });
  };

  const handleClickEditCategory = (category: { id: string; name: string }) => {
    setEditCategoryDialogOpen(true);
    setCategoryToEdit(category.id);

    editCategoryForm.reset({
      name: category.name,
    });
  };

  const handleClickDeleteCategory = (categoryId: string) => {
    setCategoryToDelete(categoryId);
  };

  const handleConfirmDeleteCategory = () => {
    deleteCategory({
      id: categoryToDelete!,
    });
  };

  return (
    <>
      <DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <DashboardTitle>Category Management</DashboardTitle>
            <DashboardDescription>
              Organize your products with custom categories.
            </DashboardDescription>
          </div>

          <AlertDialog
            open={createCategoryDialogOpen}
            onOpenChange={setCreateCategoryDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button>Add New Category</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Add New Category</AlertDialogTitle>
              </AlertDialogHeader>
              <Form {...createCategoryForm}>
                <CategoryForm
                  onSubmit={handleSubmitCreateCategory}
                  submitText="Create Category"
                />
              </Form>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  onClick={createCategoryForm.handleSubmit(
                    handleSubmitCreateCategory,
                  )}
                  disabled={isCreateCategoryPending}
                >
                  {isCreateCategoryPending && (
                    <Loader2 className="animate-spin" />
                  )}
                  Create Category
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {isCategoryLoading ? (
          <p>Loading...</p>
        ) : (
          categories &&
          categories.map((category) => (
            <CategoryCatalogCard
              key={category.id}
              name={category.name}
              productCount={category.productCount}
              onEdit={() =>
                handleClickEditCategory({
                  id: category.id,
                  name: category.name,
                })
              }
              onDelete={() => handleClickDeleteCategory(category.id)}
            />
          ))
        )}
      </div>
      {/* <div>
        {CATEGORIES.length === 0 ? (
          <div className="rounded-md border">
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No categories found</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Get started by creating your first category
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.filter((cat) => cat.id !== "all").map((category) => (
              <CategoryCatalogCard
                key={category.id}
                name={category.name}
                productCount={category.count}
                onEdit={() => handleClickEditCategory(category)}
                onDelete={() => handleClickDeleteCategory(category.id)}
              />
            ))}
          </div>
        )}
      </div> */}

      <AlertDialog
        open={editCategoryDialogOpen}
        onOpenChange={setEditCategoryDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Category</AlertDialogTitle>
          </AlertDialogHeader>
          <Form {...editCategoryForm}>
            <CategoryForm
              onSubmit={handleSubmitEditCategory}
              submitText="Edit Category"
            />
          </Form>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={editCategoryForm.handleSubmit(handleSubmitEditCategory)}
              disabled={isEditCategoryPending}
            >
              {isEditCategoryPending && <Loader2 className="animate-spin" />}
              Edit Category
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setCategoryToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Are you sure you want to delete this category? This action cannot be
            undone.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteCategory}
              disabled={isDeleteCategoryPending}
            >
              {isDeleteCategoryPending && <Loader2 className="animate-spin" />}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

CategoriesPage.getLayout = (page: ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default CategoriesPage;
