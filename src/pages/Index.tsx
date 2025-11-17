import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Simulate successful login and redirect to dashboard
    navigate("/dashboard");
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col items-center justify-center p-4",
      // Using a diagonal gradient (br) for a more dynamic look
      "bg-gradient-to-br from-gray-100 via-blue-100 to-gray-100 dark:from-background dark:via-primary/10 dark:to-background",
      "bg-[length:400%_400%] animate-gradient-shift"
    )}>
      <Card className={cn(
        "w-full max-w-sm shadow-2xl opacity-0",
        "animate-fade-in-up"
      )}>
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Dumbbell className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Gym POS System
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the management dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                type="email" 
                placeholder="admin@gym.com" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
              />
            </div>
            <Button onClick={handleLogin} className="w-full mt-2">
              Log In
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="mt-8">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;