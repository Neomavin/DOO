'use client';

import { ProductForm, ProductFormValues } from '@/components/menu/ProductForm';
import productsService from '@/services/products.service';
import categoriesService from '@/services/categories.service';
import authService from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NewProductPage() {
  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const router = useRouter();
  const restaurantId = authService.getCurrentUser()?.restaurantId ?? 'demo';

  useEffect(() => {
    const loadCategories = async () => {
      const data = await categoriesService.list();
      setCategoryOptions(data.map((category) => ({ label: category.name, value: category.id })));
      setLoadingCategories(false);
    };
    loadCategories();
  }, []);

  const handleSubmit = async (values: ProductFormValues) => {
    setLoading(true);
    try {
      await productsService.create(restaurantId, {
        name: values.name,
        description: values.description,
        price: values.price,
        categoryId: values.category,
        imageUrl: values.imageUrl,
        available: values.available,
        isFeatured: values.isFeatured,
        prepTimeMinutes: values.prepTimeMinutes,
        ingredients: values.ingredients,
      });
      router.push('/(dashboard)/menu');
    } catch (error) {
      console.error(error);
      alert('No se pudo guardar el producto. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCategories) {
    return <p className="text-brand-gray">Cargando categorías...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-white">Agregar producto</h1>
        <p className="text-brand-gray">Completa la información para mostrarlo en tu menú</p>
      </div>
      <ProductForm categories={categoryOptions} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
