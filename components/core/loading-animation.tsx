"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect } from "react"

const TypingText = () => {
  const text = "XphoraPulse"
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))
  const displayText = useTransform(rounded, (latest) => text.slice(0, latest))

  useEffect(() => {
    const controls = animate(count, text.length, {
      type: "tween",
      duration: 1.5,
      ease: "linear",
      delay: 0.5,
    })
    return controls.stop
  }, [count, text.length])

  return (
    <div className="font-mono text-3xl font-bold tracking-widest text-primary flex items-center">
      <motion.span>{displayText}</motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.7,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "mirror",
        }}
        className="ml-1"
      >
        _
      </motion.span>
    </div>
  )
}

export default function LoadingAnimation() {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center bg-background">
      <div className="w-56 h-56">
        <DotLottieReact src="/animations/loader.json" loop autoplay />
      </div>
      <div className="mt-4">
        <TypingText />
      </div>
    </div>
  )
}
