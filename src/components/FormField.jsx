import './FormField.css'

/**
 * FormField — Reusable form input with label, error message, and optional features.
 *
 * @param {string}  label       - Field label text
 * @param {string}  type        - 'text' | 'email' | 'password' | 'tel' | 'textarea' | 'date' | 'time'
 * @param {string}  value       - Current value
 * @param {function} onChange   - Change handler
 * @param {string}  error       - Error message (displayed below field)
 * @param {string}  placeholder - Placeholder text
 * @param {boolean} required    - Show required indicator
 */
function FormField({
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
}) {
  const fieldId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className={`form-field ${error ? 'form-field--error' : ''}`}>
      <label className="form-field__label" htmlFor={fieldId}>
        {label}
        {required && <span className="form-field__required"> *</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          id={fieldId}
          className="form-field__textarea"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
        />
      ) : (
        <input
          id={fieldId}
          type={type}
          className="form-field__input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}

      {error && <span className="form-field__error">{error}</span>}
    </div>
  )
}

export default FormField