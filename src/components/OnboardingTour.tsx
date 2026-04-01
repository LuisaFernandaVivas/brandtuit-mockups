import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'

// ─── Step definitions ─────────────────────────────────────────────────────────

interface Step {
  tag: string
  title: string
  body: string
  placement: 'center' | 'sidebar'
  sidebarY?: string // CSS top value for sidebar-anchored steps
  icon: string
}

const STEPS: Step[] = [
  {
    tag: 'Welcome',
    title: 'Meet Zena',
    body: 'Your AI-powered strategic intelligence companion, built for brand consultants. This quick tour covers the four things you need to know — it takes about a minute.',
    placement: 'center',
    icon: '✦',
  },
  {
    tag: 'Step 1 of 4',
    title: 'Company Settings',
    body: 'Start here. Fill in your Client Profile and Company Profile — name, role, brand colors, geographic regions, and reference images. This is the context Zena uses to tailor every output to your brand.',
    placement: 'sidebar',
    sidebarY: '38%',
    icon: '⚙',
  },
  {
    tag: 'Step 2 of 4',
    title: 'Strategic Reports',
    body: 'Once your settings are saved, your reports section unlocks. Hit the + button to start a new consultation. Each report is a structured AI-guided session — rename, fork, or delete them at any time.',
    placement: 'sidebar',
    sidebarY: '62%',
    icon: '📋',
  },
  {
    tag: 'Step 3 of 4',
    title: '9 Report Types',
    body: 'When you create a report, Zena guides you through selecting an analysis type.\n\n**Analysis** — Competitive deep dives, category scans, pricing analysis.\n**Strategy** — Positioning brainstormers, brand claims, 60-day digital plans.\n\nEach type is a purpose-built strategic workflow.',
    placement: 'center',
    icon: '◈',
  },
  {
    tag: 'Step 4 of 4',
    title: 'The Chat Interface',
    body: 'Zena lives in this area. She asks you questions, analyzes your uploaded documents, synthesizes competitive data, and produces strategic outputs — all in real time. You can edit messages, fork conversations into new reports, and copy outputs directly.',
    placement: 'center',
    icon: '◉',
  },
  {
    tag: 'Ready',
    title: "You're all set.",
    body: 'Open Company Settings in the left sidebar to begin. Zena will guide you through the rest — step by step.',
    placement: 'center',
    icon: '→',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

interface OnboardingTourProps {
  onComplete: () => void
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const current = STEPS[step]
  const isFirst = step === 0
  const isLast = step === STEPS.length - 1

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // On mobile all cards are centered
  const effectivePlacement = isMobile ? 'center' : current.placement

  const cardStyle: React.CSSProperties =
    effectivePlacement === 'sidebar'
      ? {
          position: 'fixed',
          left: 332,
          top: current.sidebarY ?? '50%',
          transform: 'translateY(-50%)',
          width: 360,
          zIndex: 401,
          maxWidth: 'calc(100vw - 48px)',
        }
      : {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 460,
          zIndex: 401,
          maxWidth: 'calc(100vw - 32px)',
        }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(45, 52, 53, 0.52)',
          backdropFilter: 'blur(4px)',
          zIndex: 400,
        }}
      />

      {/* Step card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          style={cardStyle}
        >
          {/* Sidebar arrow pointer */}
          {effectivePlacement === 'sidebar' && (
            <div style={{
              position: 'absolute',
              left: -9, top: '50%',
              transform: 'translateY(-50%)',
              width: 0, height: 0,
              borderTop: '9px solid transparent',
              borderBottom: '9px solid transparent',
              borderRight: '9px solid white',
              filter: 'drop-shadow(-2px 0 1px rgba(172,179,180,0.3))',
            }} />
          )}

          <div style={{
            background: 'white',
            borderRadius: 8,
            border: '1px solid var(--outline-variant)',
            boxShadow: '0 12px 48px rgba(45,52,53,0.2), 0 2px 8px rgba(45,52,53,0.08)',
            overflow: 'hidden',
          }}>

            {/* ── Header ── */}
            <div style={{
              padding: '22px 24px 18px',
              borderBottom: '1px solid var(--outline-variant)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              gap: 12,
            }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                {/* Icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 4, flexShrink: 0,
                  background: 'var(--surface-container-low)',
                  border: '1px solid var(--outline-variant)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-label)', fontSize: 16, color: 'var(--on-surface)',
                  marginTop: 2,
                }}>
                  {current.icon}
                </div>

                <div>
                  <span style={{
                    display: 'block', marginBottom: 5,
                    fontFamily: 'var(--font-label)', fontSize: 9.5, fontWeight: 700,
                    letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: 'var(--on-surface-variant)', opacity: 0.5,
                  }}>
                    {current.tag}
                  </span>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400,
                    fontStyle: 'italic', color: 'var(--on-surface)', lineHeight: 1.2, margin: 0,
                  }}>
                    {current.title}
                  </h3>
                </div>
              </div>

              {/* Close */}
              <button
                onClick={onComplete}
                title="Skip tour"
                style={{
                  padding: 6, flexShrink: 0,
                  color: 'var(--on-surface-variant)',
                  opacity: 0.35, borderRadius: 4,
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.35')}
              >
                <X size={15} />
              </button>
            </div>

            {/* ── Body ── */}
            <div style={{ padding: '18px 24px 20px' }}>
              {current.body.split('\n').map((line, i) => {
                if (!line.trim()) return <div key={i} style={{ height: 8 }} />
                // Bold text support via **...**
                const parts = line.split(/\*\*(.*?)\*\*/g)
                return (
                  <p key={i} style={{
                    fontFamily: 'var(--font-label)', fontSize: 13.5, lineHeight: 1.68,
                    color: 'var(--on-surface-variant)', margin: '0 0 4px',
                  }}>
                    {parts.map((part, j) =>
                      j % 2 === 1
                        ? <strong key={j} style={{ color: 'var(--on-surface)', fontWeight: 600 }}>{part}</strong>
                        : <span key={j}>{part}</span>
                    )}
                  </p>
                )
              })}
            </div>

            {/* ── Footer ── */}
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--outline-variant)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              {/* Progress dots */}
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    style={{
                      width: i === step ? 16 : 6,
                      height: 6, borderRadius: 3,
                      background: i === step ? 'var(--primary)' : 'var(--surface-container-highest)',
                      transition: 'all 0.25s ease',
                      cursor: 'pointer', border: 'none', padding: 0,
                    }}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                {!isFirst && (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontFamily: 'var(--font-label)', fontSize: 12, fontWeight: 500,
                      padding: '7px 14px', borderRadius: 4,
                      border: '1px solid var(--outline-variant)',
                      color: 'var(--on-surface-variant)', background: 'transparent',
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-container-low)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <ChevronLeft size={13} /> Back
                  </button>
                )}

                {isFirst && (
                  <button
                    onClick={onComplete}
                    style={{
                      fontFamily: 'var(--font-label)', fontSize: 12, fontWeight: 500,
                      padding: '7px 16px', borderRadius: 4,
                      border: '1px solid var(--outline-variant)',
                      color: 'var(--on-surface-variant)', background: 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    Skip tour
                  </button>
                )}

                {isLast ? (
                  <button
                    onClick={onComplete}
                    style={{
                      fontFamily: 'var(--font-label)', fontSize: 12, fontWeight: 600,
                      padding: '7px 20px', borderRadius: 4,
                      background: 'var(--primary)', color: 'white',
                      cursor: 'pointer', border: 'none',
                      boxShadow: '0 2px 8px rgba(45,52,53,0.18)',
                    }}
                  >
                    Open Company Settings →
                  </button>
                ) : (
                  <button
                    onClick={() => setStep(s => s + 1)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontFamily: 'var(--font-label)', fontSize: 12, fontWeight: 600,
                      padding: '7px 18px', borderRadius: 4,
                      background: 'var(--primary)', color: 'white',
                      cursor: 'pointer', border: 'none',
                      boxShadow: '0 2px 8px rgba(45,52,53,0.18)',
                    }}
                  >
                    Next <ChevronRight size={13} />
                  </button>
                )}
              </div>
            </div>

          </div>
        </motion.div>
      </AnimatePresence>

      {/* Sidebar highlight pulse for sidebar steps */}
      {effectivePlacement === 'sidebar' && (
        <motion.div
          key={`pulse-${step}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0.9, 1.05, 0.9] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            left: 8, right: 8,
            top: current.sidebarY ?? '50%',
            transform: 'translateY(-50%)',
            height: 44,
            borderRadius: 4,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.25)',
            zIndex: 401,
            pointerEvents: 'none',
          }}
        />
      )}
    </>
  )
}

export default OnboardingTour
