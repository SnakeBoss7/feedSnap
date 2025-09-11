import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Star, MessageSquare, BarChart3, Zap, Shield, Globe, ArrowRight, Check, Copy, Play, Link2Icon, Mail, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../components/header";
import { SimpleSidebar } from "../../components/sidebar/homeSidebar";
import { Footer } from "../../components/footer/footer";

const Home = () => {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen ">
      {/* Header */}
         <div class="fixed inset-0 -z-10 bg-[radial-gradient(circle_1050px_at_50%_200px,#c5b5ff,transparent)] pointer-events-none">
        <div class="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#e8e8e8_1px,transparent_2px),linear-gradient(to_bottom,#e8e8e8_0.5px,transparent_2px)] bg-[size:4.5rem_3.5rem]">
            {/* <!-- Small screen gradient --> */}
            <div class="absolute inset-0 bg-[radial-gradient(circle_700px_at_0%_250px,#c5b5ff,transparent)] lg:bg-none"></div>
            {/* <!-- Large screen gradient --> */}
            <div class="absolute inset-0 bg-none lg:bg-[radial-gradient(circle_2000px_at_0%_100px,#ac99f2,transparent)]"></div>
        </div>
    </div>
      <Header/>
      {/* <SimpleSidebar/> */}

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-purple-100 text-purple-700 hover:bg-purple-100">
            ✨ Collect Customer Feedback Effortlessly
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 bg-clip-text text-transparent">
            Turn Website Visitors Into
            <span className="block text-purple-600">Valuable Insights</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Add a beautiful feedback widget to any website in seconds. Collect ratings, comments, and analytics to improve your user experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Input
              placeholder="Enter your email to get started"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="max-w-sm border border-gray-300"
            />
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600  text-white hover:from-purple-700 hover:to-blue-700">
              Start Free Trial
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-800">
            <div className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              5-minute setup
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-4 h-4 text-green-500" />
              Free forever plan
            </div>
          </div>
        </div>
      </section>

      {/* Demo Widget Preview */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="relative">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">See It In Action</h3>
              <p className="mb-6 opacity-90">Here's how your feedback widget will look on your website</p>
              <div className="bg-white rounded-lg p-6 text-gray-900 max-w-2xl mx-auto relative">
                <div className="text-left mb-4">
                  <div className="w-full h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="w-3/4 h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="w-1/2 h-2 bg-gray-200 rounded"></div>
                </div>
                <div className="absolute bottom-4 right-4">
                  <div className="bg-gradient-to-r flex items-center justify-center from-purple-600 to-blue-600  w-12 h-12 hover:scale-110 transition-transform" style={{borderRadius: '15px 15px 5px 15px'}}>
                    <MessageSquare size={30} color="white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-700">Get started in 3 simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 ">
            <Card className="border-2 hover:border-purple-200 transition-colors bg-white">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Sign up and add your website details</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 hover:border-purple-200 transition-colors bg-white">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Copy className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Get Script</CardTitle>
                <CardDescription>Copy the generated script tag to your website</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 hover:border-purple-200 transition-colors bg-white">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <CardTitle>View Analytics</CardTitle>
                <CardDescription>Monitor feedback and insights in your dashboard</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to collect and analyze feedback</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Instant Setup</h3>
                <p className="text-gray-600">Add feedback widget to any website in under 5 minutes</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Star Ratings</h3>
                <p className="text-gray-600">Collect 5-star ratings with emoji reactions</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Comments</h3>
                <p className="text-gray-600">Detailed feedback with text comments</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Analytics</h3>
                <p className="text-gray-600">Real-time charts and insights dashboard</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Secure</h3>
                <p className="text-gray-600">GDPR compliant with data protection</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Multi-site</h3>
                <p className="text-gray-600">Manage feedback for multiple websites</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto  max-w-4xl flex flex-col items-center text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of websites already collecting valuable feedback
          </p>
          <Link to="/register" className="font-sans items-center bg-white text-black flex transition-all duration-500 transition-text duration-200  font-bold  px-4 py-2 rounded-md  hover:bg-gradient-to-r hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 hover:text-white hover:border-white">
                 
                      Start Your Free Trial
              <ArrowRight className="ml-2 w-4 h-4" />
          
            {/* <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
             
            </Button> */}
          </Link>
        </div>
      </section>

      {/* Footer */}
       <Footer/>
    </div>
  );
};

export default Home;