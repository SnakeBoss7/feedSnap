import { LucideMoveRight,  Play } from "lucide-react";
import heroMockup from "../../../img/Landing/hero-mockup.png";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative md:pt-20  md:px-32 px-5 pt-10 pb-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-50" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-center  lg:text-left">
            <div className="inline-flex items-center px-4 py-2 bg-primary1/20 rounded-full text-sm font-medium text-primary1 mb-6">
              ✨ Transform feedback into insights
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Turn User Feedback into{" "}
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Actionable Insights
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl font-sans">
              Customizable widgets, AI chat assistants, and powerful analytics — 
              all in one comprehensive feedback collection system.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to={"/Signup"} size="lg" className="group bg-primary rounded-md py-2 px-5  text-white flex gap-2 items-center">
                Get Started
                <LucideMoveRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                
              </Link>
              <Link variant="outline" size="lg" className="group bg-white rounded-md py-2 px-5   flex gap-2 items-center border border-primary">
                <Play className="  duration-300 mr-2 h-4 w-4" />
                See Demo
              </Link>
            </div>
            
            <div className="mt-12 flex items-center justify-center lg:justify-start space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Setup in 5 minutes
              </div>
            </div>
          </div>
          
          {/* Right mockup */}
          <div className="relative">
            <div className="relative z-10">
              <img 
                src={heroMockup} 
                alt="Feedback widget mockup"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary-glow/20 rounded-full blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;