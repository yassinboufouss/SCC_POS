import React from 'react';
import Layout from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Code, Copyright } from 'lucide-react';

const APP_VERSION = "1.0.0"; // Mock version number

const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <Layout>
      <div className="p-4 lg:p-6 space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
            <Info className="h-7 w-7 text-primary" /> {t("about_app")}
        </h1>
        
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="text-xl">{t("app_title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="flex items-center justify-between border-b pb-2">
                <span className="flex items-center gap-2 text-muted-foreground"><Code className="h-4 w-4" /> {t("version")}</span>
                <span className="font-semibold">{APP_VERSION}</span>
            </div>
            
            <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground"><Copyright className="h-4 w-4" /> {t("copyright")}</span>
                <span className="font-semibold">{t("copyright_text", { year: currentYear })}</span>
            </div>
            
            <p className="text-sm text-muted-foreground pt-4">
                {t("about_description")}
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AboutPage;