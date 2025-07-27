"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MapPin, ShieldCheck, Bell } from "lucide-react"

interface WelcomeScreenProps {
  onGetStarted: () => void
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden bg-background p-4 text-center">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.15, 0], scale: 1 }}
            transition={{
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 1.5,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/2 h-96 w-96 rounded-full bg-primary"
            style={{
              transformOrigin: `${Math.random() * 100}% ${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2, type: "spring", stiffness: 120 }}
        >
          <div className="rounded-full bg-primary p-5 text-primary-foreground shadow-lg">
            <MapPin className="h-12 w-12" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          Welcome to XphoraPulse
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-4 max-w-md text-muted-foreground"
        >
          Your real-time guide to the city. To get started, we need access to your location for personalized alerts and
          live data.
        </motion.p>

        <div className="mt-8 space-y-4 text-left">
          <FeatureItem icon={Bell} text="Receive hyper-local incident alerts." delay={0.9} />
          <FeatureItem icon={MapPin} text="View live traffic and events around you." delay={1.0} />
          <FeatureItem icon={ShieldCheck} text="Your location data is used responsibly and securely." delay={1.1} />
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className="mt-10 w-full max-w-xs"
        >
          <Button onClick={onGetStarted} size="lg" className="w-full">
            Get Started
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

function FeatureItem({ icon: Icon, text, delay }: { icon: React.ElementType; text: string; delay: number }) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-center gap-3"
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-sm font-medium text-muted-foreground">{text}</span>
    </motion.div>
  )
}
