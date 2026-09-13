export function IconButton({ label, children, className = '', active = false, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`icon-button ${active ? 'is-active' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
