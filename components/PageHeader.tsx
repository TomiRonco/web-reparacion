import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  actions?: ReactNode
  gradient?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'teal' | 'indigo' | 'slate'
}

const gradients = {
  blue: 'bg-gradient-to-r from-blue-600 to-blue-700',
  purple: 'bg-gradient-to-r from-purple-600 to-purple-700',
  green: 'bg-gradient-to-r from-green-600 to-green-700',
  orange: 'bg-gradient-to-r from-orange-600 to-orange-700',
  pink: 'bg-gradient-to-r from-pink-600 to-pink-700',
  teal: 'bg-gradient-to-r from-teal-600 to-teal-700',
  indigo: 'bg-gradient-to-r from-indigo-600 to-indigo-700',
  slate: 'bg-gradient-to-r from-slate-700 to-slate-800',
}

export default function PageHeader({ title, actions, gradient = 'blue' }: PageHeaderProps) {
  return (
    <div className={`${gradients[gradient]} rounded-lg shadow-lg p-4 sm:p-6 mb-6`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
        {actions && <div className="w-full sm:w-auto">{actions}</div>}
      </div>
    </div>
  )
}
