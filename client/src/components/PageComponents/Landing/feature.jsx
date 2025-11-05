import { Card, CardContent } from "../../ui/card";
import { MessageSquare, Bot, BarChart3 } from "lucide-react";
import chatbotFeature from "../../../img/Landing/chatbot-feature.jpg";
import analyticsDashboard from "../../../img/Landing/analytics-dashboard.jpeg";
import heroMockup from "../../../img/Landing/hero-mockup.png";

const FeaturesPreview = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "Feedback Widgets",
      description: "Beautiful popups and forms with star ratings and comment fields that seamlessly integrate with your website.",
      image: heroMockup, // Will use generated image for feedback widget
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: Bot,
      title: "AI Chatbot",
      description: "Intelligent chat assistants that answer user questions based on your predefined knowledge base.",
      image: chatbotFeature,
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive insights with charts, graphs, and AI-generated reports to understand your users better.",
      image: analyticsDashboard,
      gradient: "from-pink-500 to-red-600"
    }
  ];

  return (
    <section className="py-20 bg-muted/30 font-sans">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Everything you need to understand your users
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From collection to analysis, our comprehensive suite of tools 
            helps you build better products through user insights.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group overflow-hidden hover:shadow-soft transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-0">
                {/* Image */}
                <div className="relative h-52  rounded-t-xl overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform  duration-300"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesPreview;