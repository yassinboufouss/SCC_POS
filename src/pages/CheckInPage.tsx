import React from 'react';
import Layout from '@/components/Layout';
import POSCheckIn from '@/components/pos/POSCheckIn';
import { useTranslation } from 'react-i18next';

const CheckInPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        <h1 className="text-3xl font-bold">{t("check_in")}</h1>
        
        <div className="max-w-lg mx-auto">
          <POSCheckIn />
          <p className="mt-4 text-sm text-muted-foreground text-center">
            {t("checkin_note")}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default CheckInPage;