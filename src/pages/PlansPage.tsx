import React from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Ticket } from 'lucide-react';

const PlansPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        <h1 className="text-3xl font-bold">{t("plans_management")}</h1>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" /> {t("membership_plans")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t("current_plans")}</p>
            {/* Membership plan management features will go here */}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PlansPage;