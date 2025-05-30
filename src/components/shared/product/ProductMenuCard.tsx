import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Image from "next/image";
import { type Product } from "@/data/mock/products";
import { toRupiah } from "@/utils/toRupiah";

interface ProductMenuCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  onAddToCart: (id: string) => void;
}

export const ProductMenuCard: React.FC<ProductMenuCardProps> = ({
  id,
  name,
  price,
  imageUrl,
  onAddToCart,
}) => {
  // Format price in Rupiah
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="hover:bg-accent/10 relative flex flex-col rounded-lg border p-4 transition-colors">
      {imageUrl && (
        <div className="relative mb-3 h-32 w-full overflow-hidden rounded-md">
          <Image
            unoptimized
            fill
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="line-clamp-2 font-medium">{name}</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {toRupiah(price)}
          </p>
        </div>

        <Button
          size="icon"
          // variant="secondary"
          onClick={() => onAddToCart(id)}
          aria-label={`Add ${name} to cart`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
