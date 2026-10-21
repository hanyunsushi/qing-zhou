import * as React from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, feedbackPanelMotion } from './feedback-dialog-primitives'

export interface FeedbackMountProps {
  open: boolean
  modal?: boolean
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
  const pose = reduced ? { initial: false as const, animate: { opacity: 1, filter: 'none', transform: 'none' }, exit: { opacity: 0 }, transition: { duration: 0 } } : feedbackPanelMotion()
  const content = <div className="kf-feedback-slot" ref={p.setSlot} />
  if (!p.modal) return <AnimatePresence onExitComplete={p.onExited}>{p.open && <motion.div key="message" className={p.panelClass} {...pose} onAnimationComplete={() => p.open && p.onEntered()}>{content}</motion.div>}</AnimatePresence>
  return <Dialog open={p.open} onExitComplete={p.onExited} onClose={() => {
    if (reason.current === 'escape' ? p.closeOnEscape !== false : p.closeOnClickOutside) p.onClose(reason.current, pointer.current)
  }} className={p.scopeClass} style={{ position: 'fixed', inset: 0, zIndex: p.zIndex }} aria-describedby={undefined}
    onKeyDownCapture={e => { if (e.key === 'Escape') reason.current = 'escape' }}
    onPointerDownCapture={event => { reason.current = 'outside'; pointer.current = event.nativeEvent }}>
    <DialogBackdrop className="kf-feedback-backdrop" style={{ zIndex: p.zIndex }} {...(reduced ? { initial: false, animate: { opacity: 1, filter: 'none' }, exit: { opacity: 0 }, transition: { duration: 0 } } : {})} />
    <div className="kf-feedback-viewport" style={{ zIndex: p.zIndex }}>
      <DialogPanel className={p.panelClass} {...pose} onAnimationComplete={() => p.open && p.onEntered()}><DialogTitle id={p.labelId} className="kf-feedback-accessible-title">{p.label || '提示'}</DialogTitle>{content}</DialogPanel>
    </div>
  </Dialog>
}
