import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { currencyFormatter } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <Card className="space-y-3 bg-[#101b33]">
      {product.imageUrl && (
        <div className="h-40 w-full overflow-hidden rounded-xl border border-brand-navy/40">
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-brand-gray">
            {product.categoryName ?? 'General'}
          </p>
          <h3 className="text-lg font-semibold text-brand-white">{product.name}</h3>
          <p className="text-xs text-brand-gray">Prep. {product.prepTimeMinutes ?? 15} min</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            product.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}
        >
          {product.available ? 'Disponible' : 'No disponible'}
        </span>
      </div>
      <p className="text-sm text-brand-gray">{product.description}</p>
      {product.ingredients && (
        <p className="text-xs text-brand-gray/80">
          <span className="font-semibold text-brand-gray">Ingredientes:</span> {product.ingredients}
        </p>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-brand-accent">{currencyFormatter(product.price)}</p>
          {product.isFeatured && <p className="text-xs text-brand-gray">En portada</p>}
        </div>
        <div className="space-x-2">
          <Button variant="secondary" onClick={() => onEdit(product)}>
            Editar
          </Button>
          <Button variant="outline" onClick={() => onDelete(product.id)}>
            Eliminar
          </Button>
        </div>
      </div>
    </Card>
  );
}
