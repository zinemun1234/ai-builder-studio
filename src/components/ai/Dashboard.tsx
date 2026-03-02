"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  Database, 
  Clock, 
  Users, 
  Activity,
  Brain,
  Target,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { IndexedDBModelStorage, StoredModel } from '@/lib/modelStorage'

interface DashboardStats {
  totalModels: number
  totalTrainingTime: number
  averageAccuracy: number
  recentActivity: Array<{
    id: string
    type: 'model_created' | 'model_trained' | 'model_used'
    modelName: string
    timestamp: Date
    accuracy?: number
  }>
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalModels: 0,
    totalTrainingTime: 0,
    averageAccuracy: 0,
    recentActivity: []
  })
  const [models, setModels] = useState<StoredModel[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const modelStorage = new IndexedDBModelStorage()

  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      await modelStorage.init()
      const storedModels = await modelStorage.listModels()
      setModels(storedModels)

      // 통계 데이터 계산
      const totalModels = storedModels.length
      const totalTrainingTime = storedModels.reduce((sum, model) => sum + model.metrics.trainingTime, 0)
      const accuracies = storedModels
        .filter(m => m.metrics.finalAccuracy !== undefined)
        .map(m => m.metrics.finalAccuracy!)
      
      const averageAccuracy = accuracies.length > 0 
        ? accuracies.reduce((a, b) => a + b, 0) / accuracies.length 
        : 0

      // 최근 활동 생성
      const recentActivity = storedModels
        .slice(-5)
        .reverse()
        .map(model => ({
          id: model.id,
          type: 'model_created' as const,
          modelName: model.name,
          timestamp: model.createdAt,
          accuracy: model.metrics.finalAccuracy
        }))

      setStats({
        totalModels,
        totalTrainingTime,
        averageAccuracy,
        recentActivity
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}시간 ${minutes % 60}분`
    if (minutes > 0) return `${minutes}분 ${seconds % 60}초`
    return `${seconds}초`
  }

  const formatAccuracy = (accuracy: number) => {
    return `${(accuracy * 100).toFixed(1)}%`
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">대시보드 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="text-blue-600" />
          AI Builder Studio 대시보드
        </h2>
        <Button variant="outline" size="sm" onClick={loadDashboardData}>
          새로고침
        </Button>
      </div>

      {/* 주요 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">총 모델 수</span>
            </div>
            <div className="bg-white/20 rounded-full p-1">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold">{stats.totalModels}</div>
          <div className="text-xs opacity-75">개 모델</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">평균 정확도</span>
            </div>
            <div className="bg-white/20 rounded-full p-1">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold">{formatAccuracy(stats.averageAccuracy)}</div>
          <div className="text-xs opacity-75">성능 지표</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">총 학습 시간</span>
            </div>
            <div className="bg-white/20 rounded-full p-1">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold">{formatTime(stats.totalTrainingTime)}</div>
          <div className="text-xs opacity-75">누적 학습</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">활성 사용자</span>
            </div>
            <div className="bg-white/20 rounded-full p-1">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold">1</div>
          <div className="text-xs opacity-75">현재 접속</div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Activity className="text-gray-600" />
          최근 활동
        </h3>
        
        {stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    activity.type === 'model_created' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'model_trained' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{activity.modelName}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {activity.accuracy && (
                    <span className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-green-600">
                      {formatAccuracy(activity.accuracy)}
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.type === 'model_created' ? 'bg-blue-100 text-blue-700' :
                    activity.type === 'model_trained' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {activity.type === 'model_created' ? '생성됨' :
                     activity.type === 'model_trained' ? '학습됨' : '사용됨'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">활동 내역이 없습니다</p>
            <p className="text-xs text-gray-400 mt-1">AI 모델을 생성하면 활동이 표시됩니다</p>
          </div>
        )}
      </div>

      {/* 저장된 모델 목록 */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Database className="text-gray-600" />
          저장된 모델 목록
        </h3>
        
        {models.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <div key={model.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {model.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(model.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-blue-600">
                    {model.metrics.finalAccuracy 
                      ? formatAccuracy(model.metrics.finalAccuracy)
                      : '정확도 미정'
                    }
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="block text-gray-400">학습 시간</span>
                    <span className="font-medium text-gray-700">{formatTime(model.metrics.trainingTime)}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">에포크 수</span>
                    <span className="font-medium text-gray-700">{model.metrics.totalEpochs}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
            <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">저장된 모델이 없습니다</p>
            <p className="text-xs text-gray-400 mt-1">AI 모델 개발 탭에서 모델을 생성해보세요</p>
          </div>
        )}
      </div>
    </div>
  )
}
