import { ButtonHTMLAttributes, ReactNode } from 'react'
import { LucideIcon, Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-slate-600 hover:bg-slate-700 text-white shadow-md hover:shadow-lg',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300',
  }

  const isDisabled = disabled || loading

  return (
    <button
      disabled={isDisabled}
      className={`
        relative inline-flex items-center justify-center px-4 py-2 rounded-lg
        font-medium text-sm transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:scale-[1.02] active:scale-[0.98]
        ${variants[variant]} ${className}
      `.trim()}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}
      
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
      )}
      
      <span>{children}</span>
      
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 ml-2 transition-transform group-hover:scale-110" />
      )}
    </button>
  )
}
