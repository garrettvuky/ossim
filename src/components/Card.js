/**
 * Card wrapper component with consistent styling.
 * 
 * @param {ReactNode} children Content inside the card
 * @param {string} className Optional custom className
 */
export default function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-gray-300 p-5 shadow-md bg-white ${className}`}>
      {children}
    </div>
  );
}
