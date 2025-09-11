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

const steps = [
  {
    id: 1,
    title: "Copy your script",
    description: "Use the copy button to copy your generated script",
    icon: CheckCircle,
    color: "text-blue-600"
  },
  {
    id: 2,
    title: "Paste in your website",
    description: "Add the script just before the closing </body> tag",
    icon: CheckCircle,
    color: "text-green-600"
  },
  {
    id: 3,
    title: "Verify installation",
    description: "Check that your widget appears on your live site",
    icon: CheckCircle,
    color: "text-purple-600"
  },
  {
    id: 4,
    title: "Customize & optimize",
    description: "Fine-tune colors, position, and text as needed",
    icon: Zap,
    color: "text-orange-600"
  }
];

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

export default function InstructionsPanel() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="space-y-6 w-full h-full">
      {/* How to Use */}
      <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
        <CardHeader className="p-6">
          <CardTitle className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-blue-600" />
            How to Use Your Script
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={step.id} className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 ${step.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{step.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Success Checklist */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h5 className="font-medium text-green-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Success Checklist
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-3 h-3" />
                Script copied and pasted correctly
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-3 h-3" />
                Widget visible on live website
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-3 h-3" />
                Widget clickable and functional
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}