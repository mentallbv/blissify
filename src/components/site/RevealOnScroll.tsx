'use client'

import React from 'react'

/** Eases [data-reveal] sections in as they scroll into view. Content stays visible without JS. */
export function RevealOnScroll() {
  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let pending = [...document.querySelectorAll<HTMLElement>('[data-reveal]')]
    // Everything at or above the fold counts as seen, including sections a jump
    // or a restored scroll position skipped over, so nothing is left faded.
    const check = () => {
      const fold = window.innerHeight * 0.92
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top < fold) { el.classList.add('is-in'); return false }
        return true
      })
      if (!pending.length) window.removeEventListener('scroll', onScroll)
    }
    let frame = 0
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(check) }
    check()
    document.documentElement.classList.add('bl-reveal-on')
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); document.documentElement.classList.remove('bl-reveal-on') }
  }, [])
  return null
}
