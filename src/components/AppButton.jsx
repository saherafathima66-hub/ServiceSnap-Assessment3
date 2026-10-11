import './AppButton.css'

/**
 * AppButton — Reusable styled button for ServiceSnap.
 *
 * @param {string}  label     - Button text
 * @param {string}  variant   - 'primary' | 'secondary' | 'danger'
 * @param {string}  type      - 'button' | 'submit' | 'reset'
 * @param {boolean} fullWidth - Stretch to full width
 * @param {boolean} disabled  - Disable interaction
 * @param {function} onClick  - Click handler
 */
function AppButton({
  label,
  variant = 'primary',
  type = 'button',
  fullWidth = false,
  disabled = false,
  onClick,
}) {
  const classNames = [
    'app-btn',
    `app-btn--${variant}`,
    fullWidth ? 'app-btn--full' : '',
    disabled ? 'app-btn--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  )
}

export default AppButton