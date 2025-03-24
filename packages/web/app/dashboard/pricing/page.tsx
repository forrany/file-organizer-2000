"use client";

import { PricingCards } from "@/components/pricing-cards";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function PlanSelectionPage() {
  return (
    <div className="container max-w-6xl mx-auto p-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-3 text-slate-800">
          Pricing Plans
        </h1>
        <p className="text-slate-600 max-w-2xl">
          Start with our free tier or choose a plan that best fits your needs. All plans include our core features with different levels of access and usage limits. No credit card required to get started.
        </p>
        <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
          New! Free tier now available
        </div>
      </div>
      
      {/* Key Features Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
          <Star className="h-5 w-5 text-amber-500 mr-2" />
          Key Features
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { 
              name: "Smart Organization", 
              icon: "✨", 
              description: "AI-powered sorting and categorization of your notes and files" 
            },
            { 
              name: "Voice to Text", 
              icon: "🔊", 
              description: "Convert audio recordings into searchable, editable text" 
            },
            { 
              name: "Seamless Sync", 
              icon: "☁️", 
              description: "Access your notes from any device with real-time synchronization" 
            },
            { 
              name: "Privacy First", 
              icon: "🔒", 
              description: "End-to-end encryption keeps your data private and secure" 
            }
          ].map((feature, idx) => (
            <Card 
              key={idx} 
              className="p-5 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow transition-all duration-300"
            >
              <div className="flex items-center mb-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                  <span className="text-xl">{feature.icon}</span>
                </div>
                <h3 className="font-medium text-slate-800">{feature.name}</h3>
              </div>
              <p className="text-slate-600 text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
      
      <PricingCards />
      
      <div className="mt-8 pt-6 border-t border-slate-200">
        <p className="text-sm text-slate-500">
          All plans include our core features. Have questions? <a href="#" className="text-blue-600 hover:underline">Contact us</a>
        </p>
      </div>
    </div>
  );
}
