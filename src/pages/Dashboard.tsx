import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { mockMembers } from "@/data/members";
import { inventoryItems } from "@/data/inventory";

const LOW_STOCK_THRESHOLD = 10;

const Dashboard = () => {
  const { t } = useTranslation();
  
  // Simplified Mock Metrics
  const activeMembers = mockMembers.filter(m => m.status === 'Active').length;
  const lowStockItems = inventoryItems.filter(item => item.stock <= LOW_STOCK_THRESHOLD).length;
  const dailyCheckins = 345; 
  const monthlyRevenue = 45231.50; // Fixed mock value

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("dashboard")} Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("active_members")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMembers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t("total_active_memberships")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("total_revenue_mtd")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" /> {/* Reusing Users icon */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{t("this_months_sales")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("daily_checkins")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" /> {/* Reusing Users icon */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyCheckins}</div>
            <p className="text-xs text-muted-foreground">{t("today_so_far")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("low_stock_items")}
            </CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">{t("needs_reordering")}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Placeholder for content */}
      <Card>
        <CardHeader>
          <CardTitle>{t("quick_actions")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t("dashboard_placeholder_content")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;