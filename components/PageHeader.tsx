import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  actions?: ReactNode
  gradient?: 'blue' | 'purple' | 'green' | 'orange' | 'pink'
}

const gradients = {
  blue: 'bg-gradient-to-r from-blue-600 to-indigo-600',
  purple: 'bg-gradient-to-r from-purple-600 to-pink-600',
  green: 'bg-gradient-to-r from-green-600 to-teal-600',
  orange: 'bg-gradient-to-r from-orange-600 to-red-600',
  pink: 'bg-gradient-to-r from-pink-600 to-rose-600',
}

export default function PageHeader({ title, actions, gradient = 'blue' }: PageHeaderProps) {
  return (
    <div className={`${gradients[gradient]} rounded-lg shadow-lg p-6 mb-6`}>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        {actions && <div>{actions}</div>}
      </div>
    </div>
  )
}
