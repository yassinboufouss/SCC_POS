import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, ArrowRight } from 'lucide-react';
import { inventoryItems } from '@/data/inventory';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const LOW_STOCK_THRESHOLD = 10;

const LowStockAlerts = () => {
  const lowStockItems = inventoryItems.filter(item => item.stock <= LOW_STOCK_THRESHOLD);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-500">
          <AlertTriangle className="h-5 w-5" /> Low Stock Alerts ({lowStockItems.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80 flex flex-col">
        <ScrollArea className="flex-1 pr-4">
            <div className="space-y-3">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item) => {
                  const isCritical = item.stock === 0;
                  
                  return (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded-md bg-red-50/50 dark:bg-red-950/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                      </div>
                      <Badge variant={isCritical ? 'destructive' : 'secondary'} className="flex items-center gap-1">
                        {item.stock} {item.stock === 0 ? 'OUT' : 'left'}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <Package className="h-8 w-8 mb-2 text-green-500" />
                  <p>All inventory levels are healthy!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        
        <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full" asChild>
                <Link to="/inventory">
                    Manage Inventory <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LowStockAlerts;