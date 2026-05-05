'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, FileText, Clock, Users, Calendar } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const monthlyData = [
  { month: 'Oct', sermons: 4, duration: 180 },
  { month: 'Nov', sermons: 6, duration: 240 },
  { month: 'Déc', sermons: 8, duration: 320 },
  { month: 'Jan', sermons: 5, duration: 200 },
  { month: 'Fév', sermons: 7, duration: 280 },
]

const preacherData = [
  { name: 'Pasteur Jean-Marc Dubois', sermons: 12, color: '#6366f1' },
  { name: 'Pasteur Marie-Claire Laurent', sermons: 8, color: '#8b5cf6' },
  { name: 'Pasteur David Kouassi', sermons: 5, color: '#ec4899' },
  { name: 'Autres', sermons: 5, color: '#94a3b8' },
]

const themeData = [
  { theme: 'Foi', count: 8 },
  { theme: 'Amour', count: 6 },
  { theme: 'Prière', count: 5 },
  { theme: 'Grâce', count: 4 },
  { theme: 'Louange', count: 3 },
  { theme: 'Pardon', count: 4 },
]

const stats = [
  {
    title: 'Total prédications',
    value: '30',
    change: '+12%',
    changeType: 'positive' as const,
    icon: FileText,
    description: 'vs mois dernier',
  },
  {
    title: 'Durée moyenne',
    value: '42 min',
    change: '+5%',
    changeType: 'positive' as const,
    icon: Clock,
    description: 'par prédication',
  },
  {
    title: 'Prédicateurs actifs',
    value: '4',
    change: '=',
    changeType: 'neutral' as const,
    icon: Users,
    description: 'ce mois-ci',
  },
  {
    title: 'Fréquence',
    value: '2,1',
    change: '+0,3',
    changeType: 'positive' as const,
    icon: Calendar,
    description: 'prédications / semaine',
  },
]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('month')

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Statistiques</h1>
          <p className="mt-1 text-slate-600">Analysez l&apos;activité de vos prédications</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
            <SelectItem value="quarter">Ce trimestre</SelectItem>
            <SelectItem value="year">Cette année</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                  <span
                    className={
                      stat.changeType === 'positive'
                        ? 'text-green-600'
                        : stat.changeType === 'negative'
                          ? 'text-red-600'
                          : 'text-slate-600'
                    }
                  >
                    {stat.change}
                  </span>
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des prédications</CardTitle>
            <CardDescription>Nombre de prédications par mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sermons"
                  stroke="#6366f1"
                  strokeWidth={2}
                  name="Prédications"
                  dot={{ fill: '#6366f1', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Durée totale par mois</CardTitle>
            <CardDescription>En minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="duration" fill="#8b5cf6" name="Durée (min)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par prédicateur</CardTitle>
            <CardDescription>Nombre de prédications par personne</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={preacherData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name.split(' ').slice(1, 2).join(' ')} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="sermons"
                >
                  {preacherData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thèmes les plus abordés</CardTitle>
            <CardDescription>Nombre de prédications par thème</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={themeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="theme" type="category" stroke="#64748b" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#ec4899" name="Prédications" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Prédications les plus populaires
          </CardTitle>
          <CardDescription>Basé sur les vues et partages (démonstration)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: 'La foi en action', preacher: 'Pasteur Jean-Marc Dubois', views: 245, date: '14 fév. 2026' },
              { title: "L'amour du prochain", preacher: 'Pasteur Marie-Claire Laurent', views: 198, date: '9 fév. 2026' },
              { title: 'La puissance de la prière', preacher: 'Pasteur David Kouassi', views: 167, date: '12 fév. 2026' },
            ].map((sermon, index) => (
              <div
                key={index}
                className="flex flex-col justify-between gap-2 rounded-lg border p-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{sermon.title}</p>
                    <p className="text-sm text-slate-500">
                      {sermon.preacher} — {sermon.date}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-semibold text-slate-900">{sermon.views}</p>
                  <p className="text-xs text-slate-500">vues</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
