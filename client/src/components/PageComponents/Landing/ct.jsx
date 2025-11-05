import { Button } from  "../../ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-backgr" />
      <div className="absolute inset-0 bg-gradient-to-br from-backgr/20 via-transparent to-primary1/20" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Decorative element */}
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/20">
            <Sparkles className="mr-2 h-4 w-4" />
            Join 10,000+ happy customers
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Ready to Collect{" "}
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Smarter Feedback?
            </span>
          </h2>
          
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform your user experience today. Start collecting valuable 
            insights that drive real product improvements.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" variant="secondary" className="group shadow-glow text-lg px-8 py-4">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="text-black  hover:bg-white/80 text-lg px-8 py-4">
              Schedule Demo
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-white/60">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
              14-day free trial
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
              Cancel anytime
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-20 w-20 h-20 bg-white/10 rounded-full blur-xl" />
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-primary/30 rounded-full blur-2xl" />
    </section>
  );
};

export default CTA;