import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Send, 
  X, 
  Star, 
  BarChart2, 
  Users, 
  TrendingUp,
  Mail,
  UserPlus,
  Zap
} from "lucide-react";
import Header from "../../components/header";
import { Footer } from "../../components/footer/footer";
import DashboardImage from "../../img/Landing/dashboard-preview-glass.png";

const OverviewPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white font-sans selection:bg-blue-500/30 transition-colors duration-300">
      <Header />

      {/* Page Header */}
      <section className="pt-32 pb-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
           <div className="absolute top-20 left-1/3 w-64 h-64 bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[80px]" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white"
          >
            Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400">Power</span>
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Explore our interactive modules. See exactly how FeedSnap fits into your workflow.
          </p>
        </div>
      </section>

      {/* Interactive Playground */}
      <section className="py-12 pb-32">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Widget Demo */}
            <DemoCard title="Feedback Widget" description="Try the live feedback collection experience.">
              <div className="relative h-80 bg-gray-100 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden flex items-center justify-center group shadow-inner">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 dark:opacity-5" />
                <p className="text-gray-400 dark:text-gray-500 text-sm">Your Website Content Here</p>
                
                {/* Simulated Widget */}
                <div className="absolute bottom-6 right-6">
                  <WidgetDemo />
                </div>
              </div>
            </DemoCard>

            {/* Chat Demo */}
            <DemoCard title="AI Assistant" description="Ask questions and get instant answers from your data.">
               <div className="h-80 bg-gray-100 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col shadow-inner">
                  <ChatDemo />
               </div>
            </DemoCard>

          </div>

          {/* Dashboard Preview */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Analytics Dashboard</h2>
              <p className="text-gray-600 dark:text-gray-400">Real-time insights at your fingertips.</p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl shadow-blue-900/10 dark:shadow-blue-900/20"
            >
              <img 
                src={DashboardImage} 
                alt="Analytics Dashboard" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-50/60 dark:from-black/60 via-transparent to-transparent" />
              
              {/* Floating Stats (Overlay) */}
              <div className="absolute bottom-8 left-8 right-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon={<Users className="text-blue-600 dark:text-blue-400" />} label="Total Users" value="12,405" />
                <StatCard icon={<MessageSquare className="text-purple-600 dark:text-purple-400" />} label="Feedback Received" value="8,291" />
                <StatCard icon={<TrendingUp className="text-green-600 dark:text-green-400" />} label="Satisfaction Score" value="4.8/5" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-black relative transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">scale</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Powerful tools designed to help your team build better products, faster.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<Mail className="w-6 h-6 text-blue-500" />}
              title="Smart Email Gen"
              description="Generate professional emails instantly with our AI-powered drafting engine."
              delay={0.1}
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-purple-500" />}
              title="Team Collaboration"
              description="Work together in real-time. Share insights and manage feedback as a team."
              delay={0.2}
            />
            <FeatureCard 
              icon={<UserPlus className="w-6 h-6 text-green-500" />}
              title="Team Making"
              description="Easily create and manage teams with granular role-based access control."
              delay={0.3}
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-yellow-500" />}
              title="Advanced Analytics"
              description="Deep dive into your data with powerful visualization and trend analysis tools."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const DemoCard = ({ title, description, children }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="p-1 rounded-2xl bg-gradient-to-br from-white to-gray-100 dark:from-white/10 dark:to-white/5 shadow-lg dark:shadow-none"
  >
    <div className="bg-white dark:bg-black rounded-xl p-6 h-full border border-gray-100 dark:border-white/5">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
      </div>
      {children}
    </div>
  </motion.div>
);

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group"
  >
    <div className="mb-4 p-3 bg-white dark:bg-white/5 rounded-xl w-fit group-hover:scale-110 transition-transform shadow-sm dark:shadow-none border border-gray-100 dark:border-white/5">
      {icon}
    </div>
    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const WidgetDemo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);

  return (
    <div className="relative">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 right-0 w-72 bg-white text-black rounded-xl shadow-2xl overflow-hidden origin-bottom-right border border-gray-200 dark:border-transparent"
          >
            <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
              <span className="font-bold">Feedback</span>
              <button onClick={() => setIsOpen(false)}><X size={18} /></button>
            </div>
            <div className="p-6 text-center">
              <p className="mb-4 text-sm text-gray-600">How would you rate your experience?</p>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    onClick={() => setRating(star)}
                    className={`${rating >= star ? "text-yellow-400" : "text-gray-300"} hover:scale-110 transition-transform`}
                  >
                    <Star size={24} fill={rating >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              <button className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Submit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 text-white"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
};

const ChatDemo = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">AI</div>
          <div className="bg-white dark:bg-white/10 p-3 rounded-2xl rounded-tl-none text-sm max-w-[80%] text-gray-800 dark:text-white shadow-sm dark:shadow-none border border-gray-100 dark:border-transparent">
            Hello! How can I help you analyze your feedback today?
          </div>
        </div>
        <div className="flex gap-3 flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-white">Me</div>
          <div className="bg-blue-600 p-3 rounded-2xl rounded-tr-none text-sm max-w-[80%] text-white shadow-sm">
            Show me the top complaints from last week.
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white">AI</div>
          <div className="bg-white dark:bg-white/10 p-3 rounded-2xl rounded-tl-none text-sm max-w-[80%] text-gray-800 dark:text-white shadow-sm dark:shadow-none border border-gray-100 dark:border-transparent">
            Based on 45 responses, the top complaint was "Slow loading times" (32%).
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-transparent">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Type a message..." 
            className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full py-2 px-4 pr-10 text-sm focus:outline-none focus:border-blue-500 transition-colors text-gray-900 dark:text-white"
            disabled
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white/80 dark:bg-black/60 backdrop-blur-md border border-gray-200 dark:border-white/10 p-4 rounded-xl flex items-center gap-4 shadow-lg dark:shadow-none">
    <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-lg">
      {icon}
    </div>
    <div>
      <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

export default OverviewPage;