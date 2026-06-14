'use client'

import { memo } from 'react'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string
  color?: 'green' | 'blue' | 'purple' | 'neutral'
}

const colorClasses = {
  green: 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300',
  blue: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
  purple: 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300',
  neutral: 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300',
}

const MetricCard = memo(function MetricCard({ icon: Icon, label, value, color = 'neutral' }: MetricCardProps) {
  return (
    <div className={`p-4 rounded-lg border border-current/20 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium opacity-75">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <Icon className="w-5 h-5 opacity-50" />
      </div>
    </div>
  )
}, (prev, next) => {
  return prev.label === next.label && prev.value === next.value && prev.color === next.color
})

export { MetricCard }
