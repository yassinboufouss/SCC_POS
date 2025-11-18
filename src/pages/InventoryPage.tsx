import React from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

const InventoryPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        <h1 className="text-3xl font-bold">{t("inventory_management")}</h1>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" /> {t("inventory")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t("search_items_by_name")}</p>
            {/* Inventory management features will go here */}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default InventoryPage;