import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  CheckCircle2, 
  MessageSquare, 
  BarChart3, 
  Zap, 
  Code2, 
  Shield, 
  Globe 
} from "lucide-react";
import Header from "../../components/header";
import { Footer } from "../../components/footer/footer";
import HeroImage from "../../img/Landing/hero-abstract-3d.png";
import showacase1 from "../../img/Landing/showcase_1.png"
import showacase2 from "../../img/Landing/showcase_2.jpeg"

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white font-sans selection:bg-purple-500/30 transition-colors duration-300">
      <Header />
      
      {/* Hero Section */}
      <section className="relative  pt-14 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-6 lg:px-24 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12  lg:gap-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2 text-center lg:text-left"
            >
            

              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1] text-gray-900 dark:text-white">
                Feedback that <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
                  actually matters.
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Collect, analyze, and act on user feedback with our intelligent widget. 
                One line of code to transform your product strategy.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link 
                  to="/Signup"
                  className="w-full sm:w-auto px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl"
                >
                  Start for free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/overview"
                  className="w-full sm:w-auto px-8 py-4 bg-white/60 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl font-semibold hover:bg-white/80 dark:hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  Live Demo
                </Link>
              </div>

              <div className="mt-10 flex text-xs items-center justify-center lg:justify-start gap-6 text-sm text-gray-500 dark:text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-500" />
                  <span>14-day free trial</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:w-1/2 relative"
            >
              <div className="relative z-10 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl shadow-purple-500/10 dark:shadow-purple-500/20">
                <img 
                  src={showacase1} 
                  alt="FeedSnap Dashboard" 
                  className="w-full h-auto object-cover block dark:hidden"
                />
                <img 
                  src={showacase2} 
                  alt="FeedSnap Dashboard" 
                  className="w-full h-auto object-cover hidden dark:block"
                />
                {/* Glass Overlay */}
      
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 dark:bg-blue-500/30 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 dark:bg-purple-500/30 rounded-full blur-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-black relative transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Everything you need</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features packaged in a simple, elegant interface.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />}
              title="Lightning Fast"
              description="Optimized for performance. Our widget loads in under 100ms without impacting your site speed."
            />
            <FeatureCard 
              icon={<MessageSquare className="w-6 h-6 text-blue-500 dark:text-blue-400" />}
              title="AI Analysis"
              description="Automatically categorize and analyze feedback sentiment using advanced machine learning models."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6 text-purple-500 dark:text-purple-400" />}
              title="Deep Analytics"
              description="Visualize trends and user satisfaction scores with our comprehensive dashboard."
            />
            <FeatureCard 
              icon={<Code2 className="w-6 h-6 text-green-500 dark:text-green-400" />}
              title="Easy Integration"
              description="Just copy and paste one line of code. Works with React, Vue, WordPress, and more."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-red-500 dark:text-red-400" />}
              title="Enterprise Security"
              description="Bank-grade encryption and GDPR compliance to keep your user data safe."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />}
              title="Global Scale"
              description="Built to handle millions of requests. Deploy anywhere with our edge network."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 border-t border-gray-200 dark:border-white/5 relative overflow-hidden bg-gray-50 dark:bg-black transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                Up and running in <br />
                <span className="text-blue-600 dark:text-blue-500">less than 2 minutes</span>
              </h2>
              <div className="space-y-8">
                <Step 
                  number="01"
                  title="Customize your widget"
                  description="Choose colors, position, and questions that match your brand."
                />
                <Step 
                  number="02"
                  title="Copy the snippet"
                  description="Get your unique lightweight code snippet from the dashboard."
                />
                <Step 
                  number="03"
                  title="Start collecting"
                  description="Paste it into your site and watch the feedback roll in instantly."
                />
              </div>
            </div>
            <div className="lg:w-1/2 relative p-3">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 p-6 font-mono text-sm text-gray-800 dark:text-gray-300 shadow-2xl transition-colors duration-300">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <p className="text-blue-600 dark:text-blue-400">&lt;script&gt;</p>
                <p className="pl-4">
                  window.FeedSnap = &#123;
                  <br />
                  &nbsp;&nbsp;id: <span className="text-green-600 dark:text-green-400">"your-project-id"</span>,
                  <br />
                  &nbsp;&nbsp;theme: <span className="text-green-600 dark:text-green-400">"dark"</span>
                  <br />
                  &#125;;
                </p>
                <p className="text-blue-600 dark:text-blue-400">&lt;/script&gt;</p>
                <p className="text-blue-600 dark:text-blue-400 mt-2">&lt;script src="https://cdn.feedsnap.com/widget.js"&gt;&lt;/script&gt;</p>
              </div>
              {/* Glow behind code block */}
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-100/50 to-white dark:from-purple-900/20 dark:to-black transition-colors duration-300" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-gray-900 dark:text-white">Ready to build better products?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            Join thousands of developers and product managers who are already using FeedSnap.
          </p>
          <Link 
            to="/Signup"
            className="inline-flex items-center gap-2 px-10 py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all hover:scale-105 shadow-xl shadow-purple-500/10 dark:shadow-white/10"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-8 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group">
    <div className="mb-6 p-3 bg-white dark:bg-white/5 rounded-xl w-fit group-hover:scale-110 transition-transform shadow-sm dark:shadow-none">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
  </div>
);

const Step = ({ number, title, description }) => (
  <div className="flex gap-6">
    <div className="text-3xl font-bold text-gray-200 dark:text-white/20">{number}</div>
    <div>
      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </div>
);

export default LandingPage;