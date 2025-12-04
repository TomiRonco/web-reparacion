import { Clock, CheckCircle, XCircle, Package, Wrench, AlertCircle, DollarSign } from 'lucide-react'

type BadgeVariant = 'pendiente' | 'en_proceso' | 'completado' | 'entregado' | 'cancelado' | 'presupuestado' | 'pagado' | 'default'

interface BadgeProps {
  variant: BadgeVariant
  text: string
  withPulse?: boolean
  className?: string
}

export function Badge({ variant, text, withPulse = false, className = '' }: BadgeProps) {
  const styles = {
    pendiente: {
      bg: 'bg-yellow-100 border-yellow-300',
      text: 'text-yellow-800',
      icon: Clock,
      pulse: 'animate-pulse',
    },
    en_proceso: {
      bg: 'bg-blue-100 border-blue-300',
      text: 'text-blue-800',
      icon: Wrench,
      pulse: 'animate-pulse',
    },
    completado: {
      bg: 'bg-green-100 border-green-300',
      text: 'text-green-800',
      icon: CheckCircle,
      pulse: '',
    },
    entregado: {
      bg: 'bg-emerald-100 border-emerald-300',
      text: 'text-emerald-800',
      icon: Package,
      pulse: '',
    },
    cancelado: {
      bg: 'bg-red-100 border-red-300',
      text: 'text-red-800',
      icon: XCircle,
      pulse: '',
    },
    presupuestado: {
      bg: 'bg-purple-100 border-purple-300',
      text: 'text-purple-800',
      icon: DollarSign,
      pulse: '',
    },
    pagado: {
      bg: 'bg-teal-100 border-teal-300',
      text: 'text-teal-800',
      icon: CheckCircle,
      pulse: '',
    },
    default: {
      bg: 'bg-slate-100 border-slate-300',
      text: 'text-slate-800',
      icon: AlertCircle,
      pulse: '',
    },
  }

  const style = styles[variant] || styles.default
  const Icon = style.icon

  return (
    <span
      className={`
        inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold 
        border shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105
        ${style.bg} ${style.text} ${withPulse ? style.pulse : ''} ${className}
      `.trim()}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{text}</span>
    </span>
  )
}
