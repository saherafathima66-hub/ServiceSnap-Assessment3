import { forwardRef, useImperativeHandle, useRef } from 'react'
import { motion } from 'framer-motion'
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import './Toast.css'

const variantIcons = {
  default: Info,
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
}

const toastAnimation = {
  initial: { opacity: 0, y: 50, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 50, scale: 0.95 },
}

/**
 * Toaster — Animated toast notification component.
 * Adapted from a 21st.dev component for ServiceSnap.
 *
 * Variants: 'default' | 'success' | 'error' | 'warning'
 *
 * Usage (via ref):
 *   const toasterRef = useRef(null)
 *   toasterRef.current?.show({ title, message, variant: 'success' })
 *
 * @prop {string} defaultPosition — sonner position (default 'bottom-right')
 */
const Toaster = forwardRef(function Toaster(
  { defaultPosition = 'bottom-right' },
  ref
) {
  const toastReference = useRef(null)

  useImperativeHandle(ref, () => ({
    show({
      title,
      message,
      variant = 'default',
      duration = 4000,
      position = defaultPosition,
      actions,
      onDismiss,
      highlightTitle,
    }) {
      const Icon = variantIcons[variant] || variantIcons.default

      toastReference.current = sonnerToast.custom(
        (toastId) => (
          <motion.div
            variants={toastAnimation}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`toast-card toast--${variant}`}
          >
            <div className="toast-body">
              <Icon className={`toast-icon toast-icon--${variant}`} />
              <div className="toast-text">
                {title && (
                  <h3
                    className={`toast-title ${highlightTitle ? 'toast-title--highlight' : ''} toast-title--${variant}`}
                  >
                    {title}
                  </h3>
                )}
                <p className="toast-message">{message}</p>
              </div>
            </div>

            <div className="toast-actions">
              {actions?.label && (
                <button
                  type="button"
                  className={`toast-action-btn toast-action-btn--${variant}`}
                  onClick={() => {
                    actions.onClick()
                    sonnerToast.dismiss(toastId)
                  }}
                >
                  {actions.label}
                </button>
              )}

              <button
                type="button"
                className="toast-dismiss"
                aria-label="Dismiss notification"
                onClick={() => {
                  sonnerToast.dismiss(toastId)
                  onDismiss?.()
                }}
              >
                <X className="toast-dismiss-icon" />
              </button>
            </div>
          </motion.div>
        ),
        { duration, position }
      )
    },
  }))

  return (
    <SonnerToaster
      position={defaultPosition}
      toastOptions={{ unstyled: true, className: 'toast-queue' }}
    />
  )
})

export default Toaster