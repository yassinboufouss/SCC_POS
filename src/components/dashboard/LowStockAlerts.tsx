import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InventoryItem } from '@/types/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface LowStockAlertsProps {
  items: InventoryItem[];
  isLoading: boolean;
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ items, isLoading }) => {
  const { t } = useTranslation();

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5 text-red-500" /> {t("low_stock_alerts")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {isLoading ? (
            <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        ) : items.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {t("all_inventory_healthy")}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-md bg-red-50/50 hover:bg-red-100/70 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.category}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <Badge variant="destructive">
                    {item.stock} {t("left")}
                  </Badge>
                  <Button variant="link" size="sm" className="h-6 p-0 text-xs text-red-500">
                      <RefreshCw className="h-3 w-3 mr-1" /> {t("manage_inventory")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LowStockAlerts;