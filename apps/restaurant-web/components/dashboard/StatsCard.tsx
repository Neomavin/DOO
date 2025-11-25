import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { currencyFormatter } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  isCurrency?: boolean;
}

export function StatsCard({ title, value, description, isCurrency }: StatsCardProps) {
  return (
    <Card className="bg-gradient-to-br from-[#0f1a2f] to-[#172b4a]">
      <CardHeader>
        <CardTitle className="text-sm uppercase tracking-wide text-brand-gray">{title}</CardTitle>
        <div className="text-3xl font-bold text-brand-white">{isCurrency && typeof value === 'number' ? currencyFormatter(value) : value}</div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
    </Card>
  );
}
