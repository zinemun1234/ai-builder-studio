"use client"

import React, { useState } from 'react'
import AIModelBuilder from '@/components/ai/AIModelBuilder'
import VisualWorkflowBuilder from '@/components/ai/VisualWorkflowBuilder'
import ModelPredictor from '@/components/ai/ModelPredictor'
import Dashboard from '@/components/ai/Dashboard'
import ModelOptimization from '@/components/ai/ModelOptimization'
import AdvancedDataProcessing from '@/components/ai/AdvancedDataProcessing'
import ModelInterpretability from '@/components/ai/ModelInterpretability'
import RealTimeCollaboration from '@/components/ai/RealTimeCollaboration'
import { Button } from '@/components/ui/button'
import { Brain, Workflow, Settings, BarChart3, BarChart3 as ChartBar, Zap, Database, Eye, Users } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'model' | 'workflow' | 'predict' | 'optimization' | 'data' | 'interpretability' | 'collaboration'>('dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-xl mr-3 shadow-lg shadow-blue-100">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI Builder Studio</h1>
                <p className="text-xs text-gray-500 font-medium">No-Code AI Development Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </Button>
              <div className="h-6 w-px bg-gray-200 mx-1"></div>
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
                프로젝트 저장
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white p-1 rounded-xl shadow-sm border flex gap-1 w-fit flex-wrap">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2.5 px-6 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-100'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <ChartBar className="w-4 h-4" />
            대시보드
          </button>
          <button
            onClick={() => setActiveTab('model')}
            className={`py-2.5 px-6 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'model'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Brain className="w-4 h-4" />
            AI 모델 개발
          </button>
          <button
            onClick={() => setActiveTab('predict')}
            className={`py-2.5 px-6 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'predict'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            모델 예측
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`py-2.5 px-6 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'workflow'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Workflow className="w-4 h-4" />
            워크플로우 빌더
          </button>
          <button
            onClick={() => setActiveTab('optimization')}
            className={`py-2.5 px-6 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'optimization'
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md shadow-orange-100'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Zap className="w-4 h-4" />
            모델 최적화
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-2.5 px-6 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'data'
                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md shadow-green-100'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Database className="w-4 h-4" />
            데이터 처리
          </button>
          <button
            onClick={() => setActiveTab('interpretability')}
            className={`py-2.5 px-6 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'interpretability'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-100'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Eye className="w-4 h-4" />
            모델 해석
          </button>
          <button
            onClick={() => setActiveTab('collaboration')}
            className={`py-2.5 px-6 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === 'collaboration'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-100'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" />
            실시간 협업
          </button>
        </div>
      </div>

      {/* 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-500">
            <Dashboard />
          </div>
        )}

        {activeTab === 'model' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-2">
              <AIModelBuilder onModelCreate={(model) => console.log('Model created:', model)} />
            </div>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                  <BarChart3 className="text-blue-600 w-5 h-5" />
                  학습 통계 요약
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">평균 정확도</span>
                      <span className="text-2xl font-black text-blue-700">91.4%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">총 모델 수</span>
                      <span className="text-xl font-bold text-gray-700">3개</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">학습 시간</span>
                      <span className="text-xl font-bold text-gray-700">135분</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl shadow-lg text-white">
                <h3 className="text-lg font-bold mb-2">Pro 기능 가이드</h3>
                <p className="text-sm text-blue-100 mb-4 leading-relaxed">
                  더 큰 데이터셋과 GPU 가속 학습이 필요하신가요? 엔터프라이즈 플랜을 확인해보세요.
                </p>
                <Button className="w-full bg-white text-blue-600 font-bold hover:bg-blue-50">
                  업그레이드 하기
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'predict' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ModelPredictor />
          </div>
        )}

        {activeTab === 'workflow' && (
          <div className="h-[700px] animate-in fade-in duration-500">
            <VisualWorkflowBuilder onWorkflowCreate={(workflow) => console.log('Workflow created:', workflow)} />
          </div>
        )}

        {activeTab === 'optimization' && (
          <div className="animate-in fade-in duration-500">
            <ModelOptimization />
          </div>
        )}

        {activeTab === 'data' && (
          <div className="animate-in fade-in duration-500">
            <AdvancedDataProcessing />
          </div>
        )}

        {activeTab === 'interpretability' && (
          <div className="animate-in fade-in duration-500">
            <ModelInterpretability />
          </div>
        )}

        {activeTab === 'collaboration' && (
          <div className="animate-in fade-in duration-500">
            <RealTimeCollaboration />
          </div>
        )}
      </main>
    </div>
  )
}
