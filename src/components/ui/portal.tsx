"use client"
import { useEffect, useState } from "react"
import type React from "react"

import { createPortal } from "react-dom"

interface PortalProps {
  children: React.ReactNode
  container?: Element
}

export function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return createPortal(children, container || document.body)
}
