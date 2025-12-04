import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  actions?: ReactNode
  gradient?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'teal' | 'indigo' | 'slate' | 'cyan' | 'rose'
}

export default function PageHeader({ title, actions, gradient = 'blue' }: PageHeaderProps) {
  // Usar clases completas para evitar problemas de purge/hidratación de Tailwind
  let gradientClass = 'bg-gradient-to-r from-blue-600 to-cyan-600'
  
  if (gradient === 'purple') gradientClass = 'bg-gradient-to-r from-purple-600 to-pink-600'
  else if (gradient === 'green') gradientClass = 'bg-gradient-to-r from-green-600 to-emerald-600'
  else if (gradient === 'orange') gradientClass = 'bg-gradient-to-r from-orange-600 to-red-600'
  else if (gradient === 'pink') gradientClass = 'bg-gradient-to-r from-pink-600 to-rose-600'
  else if (gradient === 'teal') gradientClass = 'bg-gradient-to-r from-teal-600 to-cyan-600'
  else if (gradient === 'indigo') gradientClass = 'bg-gradient-to-r from-indigo-600 to-blue-600'
  else if (gradient === 'slate') gradientClass = 'bg-gradient-to-r from-slate-700 to-gray-800'
  else if (gradient === 'cyan') gradientClass = 'bg-gradient-to-r from-cyan-600 to-blue-600'
  else if (gradient === 'rose') gradientClass = 'bg-gradient-to-r from-rose-600 to-pink-600'

  return (
    <div className={`${gradientClass} rounded-lg shadow-lg p-4 sm:p-6 mb-6`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
        {actions && <div className="w-full sm:w-auto">{actions}</div>}
      </div>
    </div>
  )
}
