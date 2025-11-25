'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wand2, ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import aiService from '@/services/ai.service';
import uploadsService from '@/services/uploads.service';

const schema = z.object({
  name: z.string().min(3, 'Nombre demasiado corto'),
  description: z.string().min(10, 'Describe el producto'),
  price: z.number().min(1, 'Precio inválido'),
  category: z.string().min(1, 'Selecciona categoría'),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  prepTimeMinutes: z.number().min(5).max(120),
  available: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  ingredients: z.string().max(240, 'Máximo 240 caracteres').optional().or(z.literal('')),
});

export type ProductFormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Partial<ProductFormValues>;
  categories: { label: string; value: string }[];
  onSubmit: (values: ProductFormValues) => Promise<void>;
  loading?: boolean;
}

export function ProductForm({ defaultValues, categories, onSubmit, loading }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      price: defaultValues?.price ?? 0,
      category: defaultValues?.category ?? categories[0]?.value ?? 'general',
      imageUrl: defaultValues?.imageUrl ?? '',
      prepTimeMinutes: defaultValues?.prepTimeMinutes ?? 15,
      available: defaultValues?.available ?? true,
      isFeatured: defaultValues?.isFeatured ?? false,
      ingredients: defaultValues?.ingredients ?? '',
    },
  });

  const available = watch('available');
  const imageUrl = watch('imageUrl');
  const nameValue = watch('name');
  const ingredientsValue = watch('ingredients');

  const handleGenerateDescription = async () => {
    if (!nameValue) {
      alert('Escribe el nombre del platillo para generar una descripción.');
      return;
    }
    setAiLoading(true);
    try {
      const { text } = await aiService.generateDescription({
        dishName: nameValue,
        ingredients: ingredientsValue,
      });
      setValue('description', text);
    } catch (error) {
      console.error(error);
      alert('No se pudo generar la descripción. Intenta de nuevo.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadsService.uploadImage(file);
      setValue('imageUrl', url);
    } catch (error) {
      console.error(error);
      alert('No se pudo subir la imagen. Intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="text-sm font-medium">Nombre</label>
        <Input placeholder="Pizza Especial" {...register('name')} />
        {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium">Descripción</label>
        <Textarea placeholder="Descripción apetitosa..." {...register('description')} />
        {errors.description && <p className="text-sm text-red-400">{errors.description.message}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={handleGenerateDescription}
          disabled={aiLoading}
          className="inline-flex items-center gap-2"
        >
          <Wand2 size={16} />
          {aiLoading ? 'Generando...' : 'Generar descripción con IA'}
        </Button>
        <p className="text-xs text-brand-gray">
          Tip: la IA se basa en el nombre del platillo y los ingredientes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Precio (Lempiras)</label>
          <Input type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
          {errors.price && <p className="text-sm text-red-400">{errors.price.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Tiempo de preparación (min)</label>
          <Input type="number" {...register('prepTimeMinutes', { valueAsNumber: true })} />
          {errors.prepTimeMinutes && <p className="text-sm text-red-400">{errors.prepTimeMinutes.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Categoría</label>
          <Select options={categories} {...register('category')} />
        </div>
        <div>
          <label className="text-sm font-medium">Imagen</label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="inline-flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <ImageIcon size={16} />
              {uploading ? 'Subiendo...' : 'Subir imagen'}
            </Button>
            <Input placeholder="https://..." {...register('imageUrl')} />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {errors.imageUrl && <p className="text-sm text-red-400">{errors.imageUrl.message}</p>}
          {imageUrl && (
            <div className="mt-3">
              <p className="text-xs text-brand-gray mb-1">Vista previa</p>
              <img
                src={imageUrl}
                alt="Vista previa"
                className="h-36 w-full rounded-xl border border-brand-navy object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Ingredientes destacados</label>
        <Textarea
          placeholder="Lista breve de ingredientes o notas (opcional)"
          {...register('ingredients')}
        />
        {errors.ingredients && <p className="text-sm text-red-400">{errors.ingredients.message}</p>}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-brand-navy bg-[#0f1c30] p-4">
        <div>
          <p className="font-medium text-brand-white">Disponible</p>
          <p className="text-sm text-brand-gray">Mostrar producto en el menú</p>
        </div>
        <Switch checked={available} onChange={(e) => setValue('available', e.target.checked)} />
      </div>

      <div className="flex items-center justify-between rounded-xl border border-brand-navy bg-[#0f1c30] p-4">
        <div>
          <p className="font-medium text-brand-white">Destacado</p>
          <p className="text-sm text-brand-gray">Posición prioritaria en la app</p>
        </div>
        <Switch
          checked={watch('isFeatured')}
          onChange={(e) => setValue('isFeatured', e.target.checked)}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Guardando...' : 'Guardar Producto'}
      </Button>
    </form>
  );
}
