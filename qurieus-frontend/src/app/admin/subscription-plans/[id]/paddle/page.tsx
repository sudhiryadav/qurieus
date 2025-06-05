'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaddleConfig {
  productId: string;
  priceId: string;
  trialDays: number;
  billingCycle: 'monthly' | 'yearly';
}

export default function PaddleConfigPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<PaddleConfig>({
    productId: '',
    priceId: '',
    trialDays: 0,
    billingCycle: 'monthly',
  });
  const [productStatus, setProductStatus] = useState<string | null>(null);
  const [priceStatus, setPriceStatus] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`/api/admin/subscription-plans/${params.id}/paddle`);
        if (!response.ok) throw new Error('Failed to fetch Paddle configuration');
        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error('Error fetching Paddle configuration:', error);
        toast.error('Failed to load Paddle configuration');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/subscription-plans/${params.id}/paddle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error('Failed to update Paddle configuration');
      
      toast.success('Paddle configuration updated successfully');
      router.push('/admin/subscription-plans');
    } catch (error) {
      console.error('Error updating Paddle configuration:', error);
      toast.error('Failed to update Paddle configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateProduct = async () => {
    setProductStatus('Creating...');
    try {
      const res = await fetch(`/api/admin/subscription-plans/${params.id}/paddle/product`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create product');
      setProductStatus('Product created/updated in Paddle!');
      toast.success('Product created/updated in Paddle!');
      // Optionally refetch config
    } catch (e) {
      setProductStatus('Failed to create product');
      toast.error('Failed to create product');
    }
  };

  const handleCreatePrice = async () => {
    setPriceStatus('Creating...');
    try {
      const res = await fetch(`/api/admin/subscription-plans/${params.id}/paddle/price`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create price');
      setPriceStatus('Price created/updated in Paddle!');
      toast.success('Price created/updated in Paddle!');
      // Optionally refetch config
    } catch (e) {
      setPriceStatus('Failed to create price');
      toast.error('Failed to create price');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Configure Paddle Integration</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Paddle Product/Price Management */}
          <div className="mb-6 space-y-2">
            <div>
              <Button onClick={handleCreateProduct} variant="outline">Create/Update Product in Paddle</Button>
              {productStatus && <span className="ml-2 text-xs">{productStatus}</span>}
            </div>
            <div>
              <Button onClick={handleCreatePrice} variant="outline">Create/Update Price in Paddle</Button>
              {priceStatus && <span className="ml-2 text-xs">{priceStatus}</span>}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              <div>Current Product ID: <span className="font-mono">{config.productId || '-'}</span></div>
              <div>Current Price ID: <span className="font-mono">{config.priceId || '-'}</span></div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="productId">Paddle Product ID</Label>
              <Input
                id="productId"
                value={config.productId}
                onChange={(e) => setConfig({ ...config, productId: e.target.value })}
                placeholder="Enter Paddle Product ID"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceId">Paddle Price ID</Label>
              <Input
                id="priceId"
                value={config.priceId}
                onChange={(e) => setConfig({ ...config, priceId: e.target.value })}
                placeholder="Enter Paddle Price ID"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trialDays">Trial Days</Label>
              <Input
                id="trialDays"
                type="number"
                value={config.trialDays}
                onChange={(e) => setConfig({ ...config, trialDays: parseInt(e.target.value) })}
                min="0"
                max="30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingCycle">Billing Cycle</Label>
              <select
                id="billingCycle"
                value={config.billingCycle}
                onChange={(e) => setConfig({ ...config, billingCycle: e.target.value as 'monthly' | 'yearly' })}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/subscription-plans')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Configuration'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 