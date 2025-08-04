import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Monitor, BarChart3 } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-primary rounded-md flex items-center justify-center">
            <Monitor className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">VendIT Management System</h1>
        <p className="text-xl text-muted-foreground mb-8">Centralized cloud platform for vending machine management</p>
        <div className="space-x-4">
          <Button asChild size="lg">
            <Link to="/auth">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
