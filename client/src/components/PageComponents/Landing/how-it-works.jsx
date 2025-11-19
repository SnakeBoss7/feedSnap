import { Code, MessageCircle, TrendingUp } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      icon: Code,
      title: "Install Script",
      description: "Add our lightweight script to your website with just one line of code. No complex integration required.",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop"
    },
    {
      step: "02", 
      icon: MessageCircle,
      title: "Collect Feedback",
      description: "Users can easily rate and comment on their experience through beautiful, customizable popup widgets.",
      image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=300&fit=crop"
    },
    {
      step: "03",
      icon: TrendingUp,
      title: "Analyze Insights",
      description: "Get comprehensive analytics and AI-powered insights to make data-driven decisions for your product.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop"
    }
  ];

  return (
    <section className="py-20 font-sans">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            How it works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get up and running in minutes with our simple three-step process
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              {/* Step number */}
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto rounded-2xl  bg-gradient-to-r from-primary1 to-primary5 flex items-center justify-center text-white font-bold text-lg shadow-glow group-hover:scale-110 transition-transform duration-300">
                  {step.step}
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary1 to-transparent" />
                )}
              </div>
              
              {/* Image */}
              <div className="mb-6 relative overflow-hidden rounded-xl">
                <img 
                  src={step.image} 
                  alt={step.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-primary opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-4 bg-white/90 rounded-xl shadow-soft">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;