'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

/**
 * Eases content in as it scrolls into view. Content stays visible without JS.
 * Targets explicit [data-reveal] sections plus the shared cards and list rows,
 * so every page gets the same motion without per-page markup. Cards that enter
 * together are staggered. Re-runs per route, since the chrome stays mounted
 * across client navigations.
 */
const AUTO = '.bl-coursecard, .bl-providercard, .bl-wscard, .bl-listrow, .bl-cat-grid > *, .bl-stats-grid > *'
const STAGGER_MS = 70
const MAX_STAGGER = 5

export function RevealOnScroll() {
  const pathname = usePathname()
  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.documentElement
    // Nested targets would move twice; the outer [data-reveal] section wins.
    const collect = (scope: ParentNode) => {
      const found = [...scope.querySelectorAll<HTMLElement>(`[data-reveal], ${AUTO}`)]
      if (scope instanceof HTMLElement && scope.matches(`[data-reveal], ${AUTO}`)) found.unshift(scope)
      return found.filter((el) => !el.classList.contains('is-in') && !el.parentElement?.closest('[data-reveal]'))
    }
    let pending = collect(document)
    pending.forEach((el) => el.setAttribute('data-reveal', ''))
    // Everything at or above the fold counts as seen, including sections a jump
    // or a restored scroll position skipped over, so nothing is left faded.
    const check = (initial = false) => {
      const fold = window.innerHeight * 0.92
      const batch = new Map<Element | null, number>()
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top >= fold) return true
        const i = batch.get(el.parentElement) || 0
        batch.set(el.parentElement, i + 1)
        // Above-the-fold content on first paint appears at once; the page-load
        // entrance comes from CSS so nothing waits on hydration.
        el.classList.add('is-in')
        // Once in, hand the element back to its own hover transitions.
        const settle = () => { el.removeAttribute('data-reveal'); el.style.transitionDelay = '' }
        if (initial) { settle(); return false }
        el.style.transitionDelay = `${Math.min(i, MAX_STAGGER) * STAGGER_MS}ms`
        const done = (e: TransitionEvent) => { if (e.target !== el) return; el.removeEventListener('transitionend', done); settle() }
        el.addEventListener('transitionend', done)
        return false
      })
      if (!pending.length) window.removeEventListener('scroll', onScroll)
    }
    let frame = 0
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => check()) }
    check(true)
    root.classList.add('bl-reveal-on')
    window.addEventListener('scroll', onScroll, { passive: true })
    // Lists rendered on the client (filters, results) arrive after this effect.
    // New items in view appear at once; the rest wait for the scroll like the others.
    const observer = new MutationObserver((records) => {
      const added = records.flatMap((r) => [...r.addedNodes]).filter((n): n is HTMLElement => n instanceof HTMLElement).flatMap(collect)
      if (!added.length) return
      added.forEach((el) => el.setAttribute('data-reveal', ''))
      pending = [...new Set([...pending, ...added])]
      check(true)
      if (pending.length) window.addEventListener('scroll', onScroll, { passive: true })
    })
    observer.observe(document.querySelector('main') || document.body, { childList: true, subtree: true })
    return () => { observer.disconnect(); window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame) }
  }, [pathname])
  return null
}
