"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Loader2,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/app/contexts/AuthContext"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Image from "next/image"

// API service for support tickets and user verification
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Support ticket service
const supportTicketService = {
  // Find a user by email
  findUserByEmail: async (email: string) => {
    try {
      // Fetch the list of all users (this assumes you have proper security in place on your backend)
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.error("Failed to fetch users list");
        return null;
      }
      
      const users = await response.json();
      
      // Find user with matching email (case insensitive)
      const matchingUser = users.find(
        (user: any) => user.email.toLowerCase() === email.toLowerCase()
      );
      
      return matchingUser || null;
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  },
  
  // Create a new support ticket
  createTicket: async (ticketData: any) => {
    const response = await fetch(`${API_URL}/api/support-tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create support ticket');
    }

    return await response.json();
  }
};

// Available ticket categories
const TICKET_CATEGORIES = [
  { value: "general", label: "General Inquiry" },
  { value: "account", label: "Account Issues" },
  { value: "billing", label: "Billing Questions" },
  { value: "workout", label: "Workout Problems" },
  { value: "nutrition", label: "Nutrition Plans" },
  { value: "technical", label: "Technical Support" },
  { value: "feedback", label: "Feedback & Suggestions" },
];

export default function Contact() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertType, setAlertType] = useState<"success" | "error" | "warning">("success")
  const [showRedirectDialog, setShowRedirectDialog] = useState(false)
  
  // Form state
  const [fullName, setFullName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [category, setCategory] = useState("")
  const [message, setMessage] = useState("")
  
  // Set form fields if user is logged in
  useEffect(() => {
    console.log("User:", user);
    if (user) {
      // Check different possible properties for the user's name
      const userFullName = user.fullName || user.name || user.displayName || "";
      console.log("Full Name:", userFullName);
      console.log("Email:", user?.email || "");
      
      setFullName(userFullName)
      setEmail(user.email || "")
    }
  }, [user])

  const showTemporaryAlert = (message: string, type: "success" | "error" | "warning") => {
    setAlertMessage(message)
    setAlertType(type)
    setShowAlert(true)
    
    // Hide alert after 5 seconds
    setTimeout(() => {
      setShowAlert(false)
    }, 5000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setIsCheckingEmail(true)
    
    try {
      // First, try to find the user by email
      const foundUser = await supportTicketService.findUserByEmail(email)
      setIsCheckingEmail(false)
      
      if (!foundUser) {
        // Email doesn't exist, show redirect dialog
        setIsLoading(false)
        setShowRedirectDialog(true)
        return
      }
      
      // User exists, proceed with creating ticket
      const ticketData = {
        userId: foundUser.id || foundUser.userId,
        subject: `${category.charAt(0).toUpperCase() + category.slice(1)}: ${fullName}`,
        message: message,
        category: category || "general"
      }
      
      // Send the ticket data to API
      await supportTicketService.createTicket(ticketData)
      
      setIsLoading(false)
      showTemporaryAlert(
        "✨ Support ticket created successfully! Our team will review your request and get back to you within 24 hours.",
        "success"
      )
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSuccess(false)
        setCategory("")
        setMessage("")
        if (!user) {
          setFullName("")
          setEmail("")
        }
      }, 3000)
      
    } catch (error) {
      setIsLoading(false)
      showTemporaryAlert(
        "Oops! Something went wrong while creating your ticket. Please try again or contact us directly.",
        "error"
      )
      console.error('Error creating support ticket:', error)
    }
  }

  const handleRedirectToRegistration = () => {
    router.push("/register")
  }

  return (
    <div className="min-h-screen">
      {/* Alert Notification */}
      {showAlert && (
        <motion.div 
          className="fixed top-6 right-6 z-50 max-w-md"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
        >
          <Alert
            variant={alertType === "success" ? "default" : alertType === "error" ? "destructive" : "default"}
            className={
              alertType === "success" 
                ? "border-green-500 bg-green-50 text-green-800" 
                : alertType === "warning" 
                ? "border-yellow-500 bg-yellow-50 text-yellow-800"
                : "border-red-500 bg-red-50"
            }
          >
            {alertType === "success" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : alertType === "warning" ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            <AlertTitle className="font-medium">
              {alertType === "success" ? "Success!" : alertType === "warning" ? "Attention" : "Error"}
            </AlertTitle>
            <AlertDescription>
              {alertMessage}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
      
      {/* Redirect Dialog */}
      <AlertDialog open={showRedirectDialog} onOpenChange={setShowRedirectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Email Not Found</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <p>We couldn&apos;t find an account with the email address you entered. To submit a support ticket, you need to create an account first.</p>
                <div className="bg-amber-50 p-4 rounded-md border border-amber-200 text-amber-800">
                  <p className="flex items-center font-medium mb-1">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Why do I need to register?
                  </p>
                  <p className="text-sm">
                    Having an account allows us to track your support requests, provide personalized assistance, 
                    and ensure continuity in resolving your issues. Your fitness journey matters to us!
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRedirectToRegistration} className="bg-red-500 hover:bg-red-600">
              Go to Registration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hero Section */}
      <section className="relative h-[400px]">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/customer-service.jpg"
            alt="Hero background"
            fill
            className="object-cover object-top brightness-50"
            priority
          />
        </div>
        <div className="container relative z-10 mx-auto px-4 h-full flex items-center">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Get in Touch
            </motion.h1>
            <motion.p
              className="text-xl text-gray-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Have questions? We&apos;d love to hear from you.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                    <div className="mt-2 text-red-600 font-medium flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Your email must be registered in our system to submit a support ticket
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="text-sm font-medium">
                        Full Name
                      </label>
                      <Input 
                        id="fullName" 
                        placeholder="John Doe" 
                        required 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={!!user}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="john@example.com" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!!user}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="category" className="text-sm font-medium">
                        Category
                      </label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {TICKET_CATEGORIES.map(category => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message
                      </label>
                      <Textarea 
                        id="message" 
                        placeholder="Describe your issue or question in detail..." 
                        className="min-h-[150px]" 
                        required 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-red-500 hover:bg-red-600"
                      disabled={isLoading || isSuccess}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isCheckingEmail ? "Verifying Email..." : "Sending..."}
                        </>
                      ) : isSuccess ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Message Sent!
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Support Ticket
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Find us using any of the following methods</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-blue-500 mt-1" />
                    <div>
                      <h3 className="font-medium">Visit Us</h3>
                      <p className="text-gray-600">
                           Fitness Street,Kutus
                        <br />
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Phone className="h-6 w-6 text-green-500 mt-1" />
                    <div>
                      <h3 className="font-medium">Call Us</h3>
                      <p className="text-gray-600">+ (254) 567-8900</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Mail className="h-6 w-6 text-red-500 mt-1" />
                    <div>
                      <h3 className="font-medium">Email Us</h3>
                      <p className="text-gray-600">contact@fitnessstudio.com</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Clock className="h-6 w-6 text-red-500 mt-1" />
                    <div>
                      <h3 className="font-medium">Business Hours</h3>
                      <p className="text-gray-600">
                        Monday - Friday: 6am - 10pm
                        <br />
                        Saturday - Sunday: 8am - 8pm
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Connect With Us</CardTitle>
                  <CardDescription>Follow us on social media for daily tips and inspiration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <Button variant="outline" size="icon" className="hover:text-blue-500">
                      <Facebook className="h-5 w-5" />
                      <span className="sr-only">Facebook</span>
                    </Button>
                    <Button variant="outline" size="icon" className="hover:text-black-500">
                      <Twitter className="h-5 w-5" />
                      <span className="sr-only">Twitter</span>
                    </Button>
                    <Button variant="outline" size="icon" className="hover:text-red-500">
                      <Instagram className="h-5 w-5" />
                      <span className="sr-only">Instagram</span>
                    </Button>
                    <Button variant="outline" size="icon" className="hover:text-red-500">
                      <Youtube className="h-5 w-5" />
                      <span className="sr-only">YouTube</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Find Us</CardTitle>
                <CardDescription>Visit our state-of-the-art facility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.623478986334!2d37.317686274093944!3d-0.5662437352612115!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182629b5a37f6381%3A0x859cebe37dc37639!2sKirinyaga%20University!5e0!3m2!1sen!2ske!4v1743497827898!5m2!1sen!2ske"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}