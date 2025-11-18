import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 text-center p-4">
      <h1 className="text-9xl font-extrabold text-primary tracking-widest">404</h1>
      <div className="bg-secondary px-2 text-sm rounded rotate-12 absolute">
        Page Not Found
      </div>
      <p className="mt-5 text-xl text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Link to="/">
        <Button className="mt-6">
          <Home className="w-4 h-4 mr-2" /> Go Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;