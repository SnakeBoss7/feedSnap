import { useState } from "react";
import { Button } from "../..//components/ui/button";
import { Input } from "../..//components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { MessageSquare, Zap, Bot,  Send, ArrowRight, Clock, } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../components/header";
import { Footer } from "../../components/footer/footer";

const Overview = () => {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);


  const predefinedMessages = [
    "How do I get started?",
    "What features do you offer?",
    "Is there a free plan?",
    "How do I integrate the widget?",
    "Can I customize the feedback button?",
    "What analytics are available?",
    "Is my data secure?",
    "How do I manage multiple websites?",
    "Can I export my feedback data?",
    "Do you offer customer support?"
  ];

//   const handleQuickFeedback = () => {
//     if (!quickFeedback.trim()) return;
    
//     toast({
//       title: "Feedback Submitted",
//       description: "Thank you for your feedback! We'll review it shortly.",
//     });
//     setQuickFeedback("");
//   };

  const handleChatSubmit = (message) => {
    if (!message.trim()) return;
    
    setChatMessages(prev => [...prev, { type: 'user', message }]);
    
    // Simple bot responses
    const responses = {
      "How do I get started?": "Simply sign up for an account, add your website details, and we'll generate a script tag for you to embed.",
      "What features do you offer?": "We offer feedback widgets, star ratings, comments, real-time analytics, multi-site management, and more!",
      "Is there a free plan?": "Yes! We offer a forever-free plan with basic features. No credit card required to get started.",
      "How do I integrate the widget?": "After creating an account, copy the generated script tag and paste it into your website's HTML. It takes less than 5 minutes!",
      "Can I customize the feedback button?": "Yes, you can customize colors, position, and text to match your brand perfectly.",
      "What analytics are available?": "View feedback trends, star ratings distribution, comment analysis, and website performance metrics.",
      "Is my data secure?": "Absolutely! We're GDPR compliant with enterprise-grade security and data encryption.",
      "How do I manage multiple websites?": "Our dashboard allows you to manage unlimited websites from a single account with separate analytics for each.",
      "Can I export my feedback data?": "Yes, you can export all your feedback data in CSV format anytime from your dashboard.",
      "Do you offer customer support?": "We provide email support for all users, with priority support for paid plans."
    };
    
    setTimeout(() => {
      const response = responses[message] || "That's a great question! For detailed information, please check our documentation or contact our support team.";
      setChatMessages(prev => [...prev, { type: 'bot', message: response }]);
    }, 500);
    
    setChatInput("");
  };

  return (
    <div className="min-h-screen ">
      {/* Header */}
       <div class="fixed inset-0 -z-10 bg-[radial-gradient(circle_1050px_at_50%_200px,#c5b5ff,transparent)] pointer-events-none">
        <div class="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#e8e8e8_1px,transparent_2px),linear-gradient(to_bottom,#e8e8e8_0.5px,transparent_2px)] bg-[size:4.5rem_3.5rem]">
            {/* <!-- Small screen gradient --> */}
            <div class="absolute inset-0 bg-[radial-gradient(circle_700px_at_0%_250px,#c5b5ff,transparent)] lg:bg-none"></div>
            {/* <!-- Large screen gradient --> */}
            <div class="absolute inset-0 bg-none lg:bg-[radial-gradient(circle_2000px_at_0%_500px,#ac99f2,transparent)]"></div>
        </div>
    </div>
     <Header/>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Page Introduction */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-100">
            ✨ Interactive Overview
          </Badge>
          <h1 className="text-4xl mt-10 md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 bg-clip-text text-transparent">
            Welcome to FeedSnap
          </h1>
          <p className="text-xl md:block hidden text-gray-600 max-w-3xl mx-auto leading-relaxed">
            FeedbackHub is a powerful yet simple platform that helps you collect, analyze, and act on customer feedback. 
            Whether you're running an e-commerce site, SaaS platform, or blog, our embeddable feedback widgets integrate 
            seamlessly with your website to capture valuable insights from your visitors. Try our interactive modules below 
            to experience the platform firsthand.
          </p>
          <p className="text-lg md:hidden  text-gray-600 max-w-3xl mx-auto leading-relaxed">
            FeedbackHub is a powerful yet simple platform that helps you collect, analyze, and act on customer feedback. 
           
          </p>
        </div>

        {/* Interactive Modules */}
        <div className="grid font-sans lg:grid-cols-3 gap-8 mb-16">
          {/* Module 1: Feedback Widget Demo */}
          <Card className="border-2 hover:border-purple-200 bg-white  transition-all duration-300 hover:shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Feedback Widget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center">
                See how our feedback widget works on real websites
              </p>
              
              <Link to="/dashboard/scriptGen">
                <Button className="w-full text-white mt-3 mb-10  bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  View Live Demo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Easy one-click script integration
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Customizable colors and position
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Multiple feedback types support
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Real-time data collection
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Mobile responsive design
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module 2: Guided Chat + Feedback */}
          <Card className="border-2 font-sans hover:border-blue-200 bg-white transition-all duration-300 hover:shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Smart Assistant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center text-sm">
                Interactive assistant with pre-configured knowledge base. Ask common questions about features, pricing, integration, or get personalized guidance based on your needs.
              </p>
              
              <div className="border rounded-lg p-4 h-64 overflow-y-auto bg-gray-50">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm space-y-2">
                    <p>💬 Try asking about:</p>
                    <p className="text-xs">• Getting started guide</p>
                    <p className="text-xs">• Available features & plans</p>
                    <p className="text-xs">• Integration methods</p>
                    <p className="text-xs">• Security & compliance</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-2 text-sm ${
                          msg.type === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white border text-gray-700 shadow-sm'
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {predefinedMessages.slice(0, 3).map((msg, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="text-xs hover:bg-blue-50"
                      onClick={() => handleChatSubmit(msg)}
                    >
                      {msg}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask me anything about FeedbackHub..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit(chatInput)}
                    className="text-sm"
                  />
                  <Button size="sm" onClick={() => handleChatSubmit(chatInput)} className="bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 text-white h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module 3: Advanced AI Guidance */}
          <Card className="border-2 font-sans border-dashed border-gray-300 hover:border-orange-300 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-yellow-50 opacity-50"></div>
            <CardHeader className="text-center relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 opacity-60">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-600">AI Smart Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <Badge variant="outline" className="mx-auto block w-fit border-orange-400 text-orange-700 bg-orange-50">
                <Clock className="mr-1 w-3 h-3" />
                Coming Soon
              </Badge>
              <p className="text-gray-600 text-center text-sm leading-relaxed">
                Revolutionary AI that will analyze your website content, understand user behavior, and provide intelligent, real-time guidance to visitors based on their specific needs and context.
              </p>
              
              <div className="space-y-3 text-xs">
                <div className="bg-white/60 rounded-lg p-3 border border-orange-200">
                  <h4 className="font-semibold text-gray-700 mb-2">Core AI Features</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      Website content analysis & understanding
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      Real-time user behavior tracking
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      Contextual recommendations engine
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/60 rounded-lg p-3 border border-orange-200">
                  <h4 className="font-semibold text-gray-700 mb-2">Smart Interactions</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      Proactive help suggestions
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      Interactive page element highlighting
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      Personalized user journey guidance
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 text-xs border-orange-300 text-orange-700 hover:bg-orange-50" disabled>
                  Join Waitlist
                </Button>
                <Button variant="outline" className="flex-1 text-xs border-orange-300 text-orange-700 hover:bg-orange-50" disabled>
                  Early Access
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Create your account today and start collecting valuable feedback from your website visitors in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/Signup">
              <Button size="lg" className="bg-gradient-to-r text-white from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <button className="border p-[9px] rounded-lg bg-white hover:bg-white" size="lg">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Professional Footer */}
    <Footer/>
    </div>
  );
};

export default Overview;