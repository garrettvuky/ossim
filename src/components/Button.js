/**
 * Button component with styling variants and sizes.
 * 
 * @param {ReactNode} children Button content
 * @param {function} onClick Click handler
 * @param {string} variant 'default' | 'destructive'
 * @param {string} size 'sm' | 'md'
 */
export default function Button({ children, onClick, variant = "default", size = "md" }) {
  const styles = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700",
    destructive: "bg-red-500 text-white hover:bg-red-600",
  };
  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-full ${styles[variant]} ${sizes[size]} font-medium transition duration-200`}
    >
      {children}
    </button>
  );
}
