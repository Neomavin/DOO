'use client';

import { useEffect, useMemo, useState } from 'react';
import productsService from '@/services/products.service';
import authService from '@/services/auth.service';
import type { Product } from '@/types';
import { ProductCard } from '@/components/menu/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';

export default function MenuPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const restaurantId = authService.getCurrentUser()?.restaurantId ?? 'demo';

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsService.list(restaurantId);
      setProducts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categoryOptions = useMemo(() => {
    const unique = Array.from(new Set(products.map((product) => product.categoryName ?? 'General')));
    return ['all', ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || (product.categoryName ?? 'General') === categoryFilter;
      const matchesAvailability = !onlyAvailable || product.available;
      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [products, search, categoryFilter, onlyAvailable]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-white">Menú</h1>
          <p className="text-brand-gray">Gestiona tus productos principales</p>
        </div>
        <Button onClick={() => router.push('/(dashboard)/menu/new')}>Agregar producto</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Input
          placeholder="Buscar por nombre o descripción"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          options={categoryOptions.map((category) => ({ label: category === 'all' ? 'Todas' : category, value: category }))}
        />
        <div className="flex items-center justify-between rounded-xl border border-brand-navy bg-[#0f1c30] px-4 py-2">
          <span className="text-sm text-brand-gray">Solo disponibles</span>
          <Switch checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
        </div>
      </div>
      {error && <p className="text-red-400">{error}</p>}
      {loading ? (
        <p>Cargando...</p>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-navy p-10 text-center text-brand-gray">
          No encontramos productos con esos filtros.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={(p) => router.push(`/(dashboard)/menu/${p.id}/edit`)}
              onDelete={async (id) => {
                await productsService.remove(id);
                fetchProducts();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
