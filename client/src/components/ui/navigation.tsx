import { Link, useLocation } from "react-router-dom";
import { Button } from "./button";
import { cn } from "../../lib/utils";

const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            FeedbackPro
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive("/") ? "text-primary" : "text-foreground/80"
              )}
            >
              Home
            </Link>
            <Link 
              to="/overview" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive("/overview") ? "text-primary" : "text-foreground/80"
              )}
            >
              Overview
            </Link>
            <Link 
              to="/features" 
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              Features
            </Link>
            <Link 
              to="/contact" 
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              Contact
            </Link>
          </div>

          <Button variant="default" className="shadow-soft">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;