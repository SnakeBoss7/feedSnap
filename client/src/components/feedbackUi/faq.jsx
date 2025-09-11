import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { 
  BookOpen, 
  CheckCircle, 
  ChevronDown, 
  ChevronRight,
  HelpCircle,
  AlertCircle,
  Zap
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";

const faqs = [
  {
    question: "Why is my script not showing?",
    answer: "Make sure you've pasted the script before the closing </body> tag and that there are no JavaScript errors on your page. Try clearing your browser cache."
  },
  {
    question: "Can I customize the widget further?",
    answer: "Yes! Use the Customization tab to change colors, position, text, and more. You can also modify the generated script code directly."
  },
  {
    question: "Is the widget mobile-friendly?",
    answer: "Absolutely! The widget automatically adapts to different screen sizes and works perfectly on mobile devices."
  },
  {
    question: "How do I track widget clicks?",
    answer: "You can add analytics tracking code inside the widget's click handler. We also provide analytics in our premium plans."
  }
];


export default function FaqsPanel() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="space-y-6 w-full h-full">
      {/* FAQs */}
      <Card className="bg-white/80 backdrop-blur-sm h-full border border-white/20 shadow-xl">
        <CardHeader className="p-6">
          <CardTitle className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-purple-600" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <Collapsible
                key={index}
                open={openFaq === index}
                onOpenChange={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="px-3 pt-3">
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}