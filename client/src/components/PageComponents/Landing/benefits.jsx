import { TrendingUp, Users, Brain, Zap, Shield, Clock } from "lucide-react";
import { Card, CardContent } from "../../ui/card";

const Benefits = () => {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Boost User Satisfaction",
      description: "Get real insights that help you understand what users truly want and need from your product.",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Users,
      title: "Understand Customers Better",
      description: "AI-powered chatbot conversations reveal deeper insights about user behavior and preferences.",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Brain,
      title: "Make Data-Driven Decisions",
      description: "Transform raw feedback into actionable insights with our advanced analytics and AI reports.",
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: Zap,
      title: "Lightning Fast Setup",
      description: "Get up and running in under 5 minutes with our simple one-line script integration.",
      color: "from-yellow-500 to-orange-600"
    },
    {
      icon: Shield,
      title: "Enterprise-Grade Security",
      description: "Your data is protected with bank-level encryption and GDPR-compliant data handling.",
      color: "from-red-500 to-rose-600"
    },
    {
      icon: Clock,
      title: "Save Development Time",
      description: "No need to build feedback systems from scratch. Focus on your core product instead.",
      color: "from-indigo-500 to-blue-600"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Why choose FeedSnap?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of companies that have transformed their user 
            experience with our comprehensive feedback solution.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="group hover:shadow-soft transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${benefit.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;