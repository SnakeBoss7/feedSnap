import showcasePreview from "../../img/Landing/showcase-preview.jpg";

const Showcase = () => {
  return (
    <section className="py-20 bg-backgr text-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            See the complete experience
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Watch how our integrated feedback system works seamlessly across 
            widgets, chatbots, and analytics dashboards.
          </p>
        </div>
        
        <div className="relative max-w-6xl mx-auto">
          {/* Main showcase image */}
          <div className="relative z-10">
            <img 
              src={showcasePreview} 
              alt="Complete feedback system showcase"
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-8 -left-8 w-32 h-32 bg-primary/30 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-accent/30 rounded-full blur-2xl" />
          
          {/* Feature highlights */}
          <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span>Live feedback collection</span>
            </div>
          </div>
          
          <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
              <span>AI chatbot active</span>
            </div>
          </div>
          
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
              <span>Real-time analytics</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Showcase;