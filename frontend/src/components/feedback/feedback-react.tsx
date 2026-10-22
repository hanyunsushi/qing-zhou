import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, feedbackPanelMotion } from './feedback-dialog-primitives'

export interface FeedbackMountProps {
  open: boolean
  modal?: boolean
  animation?: 'source' | 'fade-scale'
  label?: string
  labelId?: string
  panelClass?: string
  scopeClass?: string
  zIndex?: number
  closeOnEscape?: boolean
  closeOnClickOutside?: boolean
  setSlot: (node: HTMLDivElement | null) => void
  onClose: (reason: 'escape' | 'outside', event?: MouseEvent) => void
  onEntered: () => void
  onExited: () => void
}

// 提示信息 / 组件绘制动画：Vue只拥有slot内容，React拥有原Headless/Motion表面与生命周期。
export function FeedbackMount(p: FeedbackMountProps) {
  const reduced = useReducedMotion()
  const reason = React.useRef<'escape' | 'outside'>('outside')
  const pointer = React.useRef<MouseEvent | undefined>(undefined)
  React.useEffect(() => {
    if (!p.open || !p.modal) return
    const keydown = (event: KeyboardEvent) => { if (event.key === 'Escape') reason.current = 'escape' }
    window.addEventListener('keydown', keydown, true)
    return () => window.removeEventListener('keydown', keydown, true)
  }, [p.open, p.modal])
  // 提示信息 / 组件绘制动画：确认框复用原250/200ms淡入缩放；消息和其他Modal保留原源码动效。
  const simple = p.animation === 'fade-scale'
  const pose = reduced ? { initial: false as const, animate: { opacity: 1, filter: 'none', transform: 'none' }, exit: { opacity: 0 }, transition: { duration: 0 } } : simple ? {
    initial: { opacity: 0, filter: 'none', transform: 'scale(0.95)' },
    animate: { opacity: 1, filter: 'none', transform: 'scale(1)', transition: { duration: .25, ease: 'easeOut' as const } },
    exit: { opacity: 0, filter: 'none', transform: 'scale(0.95)', transition: { duration: .2, ease: 'easeIn' as const } },
  } : feedbackPanelMotion()
  const content = <div className="kf-feedback-slot" ref={p.setSlot} />
  if (!p.modal) return <AnimatePresence onExitComplete={p.onExited}>{p.open && <motion.div key="message" className={p.panelClass} {...pose} onAnimationComplete={() => p.open && p.onEntered()}>{content}</motion.div>}</AnimatePresence>
  return <Dialog open={p.open} onExitComplete={p.onExited} onClose={() => {
    if (reason.current === 'escape' ? p.closeOnEscape !== false : p.closeOnClickOutside) p.onClose(reason.current, pointer.current)
  }} className={p.scopeClass} style={{ position: 'fixed', inset: 0, zIndex: p.zIndex }} aria-describedby={undefined}
    onKeyDownCapture={e => { if (e.key === 'Escape') reason.current = 'escape' }}
    onPointerDownCapture={event => { reason.current = 'outside'; pointer.current = event.nativeEvent }}>
    <DialogBackdrop className="kf-feedback-backdrop" style={{ zIndex: p.zIndex }} {...(reduced ? { initial: false, animate: { opacity: 1, filter: 'none' }, exit: { opacity: 0 }, transition: { duration: 0 } } : simple ? { initial: { opacity: 0, filter: 'none' }, animate: { opacity: 1, filter: 'none', transition: { duration: .25, ease: 'easeOut' } }, exit: { opacity: 0, filter: 'none', transition: { duration: .2, ease: 'easeIn' } } } : {})} />
    <div className="kf-feedback-viewport" style={{ zIndex: p.zIndex }}>
      <DialogPanel className={p.panelClass} {...pose} onAnimationComplete={() => p.open && p.onEntered()}><DialogTitle id={p.labelId} className="kf-feedback-accessible-title">{p.label || '提示'}</DialogTitle>{content}</DialogPanel>
    </div>
  </Dialog>
}
