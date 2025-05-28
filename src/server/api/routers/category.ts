import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const categoryRouter = createTRPCRouter({
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;

    const categories = await db.category.findMany({
      select: {
        id: true,
        name: true,
        productCount: true,
      },
    });

    return categories;
  }),

  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3, "Minimum of 3 characters"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const newCategory = await db.category.create({
        data: {
          name: input.name,
        },
      });

      return newCategory;
    }),

  deleteCategoryById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const category = await db.category.delete({
        where: {
          id: input.id,
        },
      });

      return category;
    }),

  editCategory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(3, "Minimum of 3 characters"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const category = await db.category.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
        },
      });

      return category;
    }),
});
