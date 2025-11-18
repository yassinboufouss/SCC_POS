import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = () => {
    // Simulate successful login and redirect to POS
    navigate("/pos");
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col items-center justify-center p-4 relative",
      "bg-cover bg-center"
    )} style={{ backgroundImage: `url('/gym-background.jpg')` }}>
      
      {/* Overlay to ensure readability of the card */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <Card className={cn(
        "w-full max-w-sm shadow-2xl opacity-0 relative z-10",
        "animate-fade-in-up"
      )}>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Dumbbell className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">
            {t("app_title")}
          </CardTitle>
          <CardDescription>
            {t("login_description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">{t("username")}</Label>
              <Input 
                id="username" 
                type="email" 
                placeholder="admin@gym.com" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
              />
            </div>
            <Button onClick={handleLogin} className="w-full mt-2">
              {t("log_in")}
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="mt-8 relative z-10">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;