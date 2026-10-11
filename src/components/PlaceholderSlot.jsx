import './PlaceholderSlot.css'

/**
 * PlaceholderSlot — Reserved for a 21st.dev component.
 * 
 * This is a placeholder that will be replaced with a polished component
 * from 21st.dev using its copy-prompt-and-implement workflow.
 * 
 * Suggested component types to integrate here:
 * - Stat / metric card with icon and number
 * - Empty state illustration with message
 * - Toast / notification banner
 */
function PlaceholderSlot({ label = '21st.dev Component' }) {
  return (
    <div className="placeholder-slot">
      <div className="placeholder-slot__icon">🧩</div>
      <span className="placeholder-slot__label">{label}</span>
      <span className="placeholder-slot__hint">
        Replace with 21st.dev component
      </span>
    </div>
  )
}

export default PlaceholderSlot