'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductForm, ProductFormValues } from '@/components/menu/ProductForm';
import productsService from '@/services/products.service';
import categoriesService from '@/services/categories.service';
import type { Product } from '@/types';

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productsService.getById(productId);
        setProduct(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'No se pudo cargar el producto');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    categoriesService.list().then((data) => {
      setCategoryOptions(data.map((category) => ({ label: category.name, value: category.id })));
      setLoadingCategories(false);
    });
  }, [productId]);

  const handleSubmit = async (values: ProductFormValues) => {
    if (!productId) return;
    setLoading(true);
    try {
      await productsService.update(productId, {
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
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar el producto.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Cargando producto...</p>;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  if (!product) {
    return <p>No se encontró el producto solicitado.</p>;
  }

  if (loadingCategories) {
    return <p className="text-brand-gray">Cargando categorías...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-white">Editar producto</h1>
        <p className="text-brand-gray">Actualiza la información necesaria</p>
      </div>
      <ProductForm
        categories={categoryOptions}
        onSubmit={handleSubmit}
        defaultValues={{
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.categoryId ?? categoryOptions[0]?.value ?? 'general',
          imageUrl: product.imageUrl,
          prepTimeMinutes: product.prepTimeMinutes ?? 15,
          available: product.available,
          isFeatured: product.isFeatured ?? false,
          ingredients: product.ingredients ?? '',
        }}
      />
    </div>
  );
}
