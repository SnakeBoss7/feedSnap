import React from "react";
import { Link } from "react-router-dom";
import { 
  Twitter, 
  Github, 
  Linkedin, 
  Mail, 
  Shield, 
  FileText, 
  ArrowRight 
} from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-white/10 pt-20 pb-10 font-sans transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold tracking-tighter">
                <span className="text-gray-900 dark:text-white">Feed</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Snap</span>
              </div>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Empowering developers to build better products through intelligent user feedback and analytics.
            </p>
            <div className="flex gap-4">
              <SocialLink href="#" icon={<Twitter size={20} />} />
              <SocialLink href="#" icon={<Github size={20} />} />
              <SocialLink href="#" icon={<Linkedin size={20} />} />
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Product</h4>
            <ul className="space-y-4">
              <FooterLink to="/overview">Features</FooterLink>
              <FooterLink to="/dashboard">Dashboard</FooterLink>
              <FooterLink to="/pricing">Pricing</FooterLink>
              <FooterLink to="/changelog">Changelog</FooterLink>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Company</h4>
            <ul className="space-y-4">
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/careers">Careers</FooterLink>
              <FooterLink to="/blog">Blog</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Stay Updated</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Subscribe to our newsletter for the latest updates and tips.
            </p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:border-blue-500 transition-colors text-gray-900 dark:text-white"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors">
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            © 2025 FeedSnap. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link to="/privacy" className="text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm transition-colors flex items-center gap-2">
              <Shield size={14} /> Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm transition-colors flex items-center gap-2">
              <FileText size={14} /> Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ href, icon }) => (
  <a 
    href={href} 
    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-white transition-all"
  >
    {icon}
  </a>
);

const FooterLink = ({ to, children }) => (
  <li>
    <Link 
      to={to} 
      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors"
    >
      {children}
    </Link>
  </li>
);