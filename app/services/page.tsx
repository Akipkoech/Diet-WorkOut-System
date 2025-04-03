"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Brain, Apple, Users, ChevronRight, BarChart3 } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

export default function Services() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/40" // Dark overlay for better text visibility
            style={{
              backgroundImage: "url('/images/service-jpg.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-red-500 mb-6" // Changed from text-white to text-red-500
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Transform Your Fitness Journey with AI
            </motion.h1>
            <motion.p
              className="text-xl text-white font-semibold mb-8" // Changed from text-gray-300 to text-black and added font-semibold
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Discover our comprehensive suite of AI-powered fitness and nutrition services
            </motion.p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Brain className="h-8 w-8 text-red-500" />}
              title="AI Workout Planning"
              description="Personalized workout plans that adapt to your progress and goals"
            />
            <FeatureCard
              icon={<Apple className="h-8 w-8 text-green-500" />}
              title="Nutrition Guidance"
              description="Expert nutrition advice and customized meal plans"
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8 text-blue-500" />}
              title="Progress Tracking"
              description="Detailed analytics and progress monitoring"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-black-500" />}
              title="Community Support"
              description="Join a vibrant community of fitness enthusiasts"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How does the AI workout planning work?</AccordionTrigger>
                <AccordionContent>
                  Our AI analyzes your fitness level, goals, and preferences to create personalized workout plans. The
                  system continuously learns from your progress and adjusts the plans accordingly for optimal results.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Can I change my nutrition plan?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can customize your nutrition plan at any time. Our system allows you to adjust your meal
                  preferences, dietary restrictions, and caloric needs to match your goals.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is community support available for all users?</AccordionTrigger>
                <AccordionContent>
                  Yes! All members have access to our community features, including forums, group challenges, and
                  support groups. Premium and Elite members get additional access to exclusive community events and
                  expert Q&A sessions.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>How do I track my progress?</AccordionTrigger>
                <AccordionContent>
                  Our app provides comprehensive progress tracking through measurements, photos, workout logs, and
                  nutrition tracking. Premium users get access to advanced analytics and detailed progress reports.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-red-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Start Your Fitness Journey?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of others who have already transformed their lives
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-red-500 hover:bg-gray-100">
            Get Started Now <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

