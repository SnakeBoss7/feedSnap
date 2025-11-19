import { Link } from "react-router-dom";
import { FileText, Link2Icon,  Mail, MailOpen,  Shield } from "lucide-react";
export const Footer = () => {
  return (
  <footer className="font-sans bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
               <div className="left text-3xl font-semibold tracking-tight flex  ">
          <div className="text-white text-3xl text-top">Feed</div>
          <div className="font-mono text-primary bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent text-4xl text-bottom">SNAP</div>
        </div>
              
              </div>
              <p className="text-gray-400 text-sm">
                Empowering websites with intelligent feedback collection and analytics.
              </p>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h3 className="font-semibold">Product</h3>
              <div className="space-y-2">
                <Link to="/" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Features
                </Link>
                <Link to="/overview" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Overview
                </Link>
                <Link to="/dashboard" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Dashboard
                </Link>
              </div>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h3 className="font-semibold">Company</h3>
              <div className="space-y-2">
                <p  className="block text-gray-400 hover:text-white transition-colors text-sm">
                  About
                </p>
                <p href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Contact
                </p>
                <p href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Support
                </p>
              </div>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="font-semibold">Legal</h3>
              <div className="space-y-2">
                <p className="block text-gray-400 hover:text-white transition-colors text-sm">
                  <Shield className="inline w-3 h-3 mr-1" />
                  Privacy Policy
                </p>
                <p  className="block text-gray-400 hover:text-white transition-colors text-sm">
                  <FileText className="inline w-3 h-3 mr-1" />
                  Terms of Service
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 FeedbackHub. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a href="mailto:support@feedbackhub.com" className="text-gray-400 hover:text-white transition-colors">
<div className="flex items-center gap-4">
        <div className="group relative w-4 h-4">
          <Mail className="w-4 h-4 transition-all duration-200 group-hover:scale-0 group-hover:opacity-0" />
          <MailOpen className="w-4 h-4 absolute top-0 left-0 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200" />
        </div>
      </div>
              </a>
              <p  className="text-gray-400 hover:text-white transition-colors">
                <Link2Icon className="w-4 h-4" />
   
              </p>
            </div>
          </div>
        </div>
      </footer>
  );
}