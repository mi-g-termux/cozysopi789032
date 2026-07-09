import { prisma } from "@/lib/prisma";
import { CategoriesAdmin } from "./CategoriesAdmin";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return <CategoriesAdmin initial={categories} />;
}
