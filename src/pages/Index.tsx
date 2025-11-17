import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Simulate successful login and redirect to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 space-y-6">
        <h1 className="text-4xl font-extrabold text-center text-primary">
          Gym POS System
        </h1>
        <p className="text-center text-lg text-muted-foreground">
          Secure Login
        </p>
        
        {/* Placeholder Login Form */}
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Username" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button onClick={handleLogin} className="w-full">
            Log In (Admin Access)
          </Button>
        </div>
        
      </div>
      <div className="mt-8">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;