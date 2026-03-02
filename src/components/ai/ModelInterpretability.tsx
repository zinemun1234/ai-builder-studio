"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  Eye, 
  Brain, 
  BarChart3, 
  TrendingUp, 
  Target,
  Zap,
  Download,
  Play,
  Pause,
  Settings,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'
import { IndexedDBModelStorage, StoredModel } from '@/lib/modelStorage'
import * as tf from '@tensorflow/tfjs'

interface FeatureImportance {
  name: string
  importance: number
  impact: 'positive' | 'negative' | 'neutral'
  description: string
}

interface ModelInterpretation {
  featureImportance: FeatureImportance[]
  shapValues: Array<{
    feature: string
    value: number
    impact: number
  }>
  partialDependence: Array<{
    feature: string
    values: number[]
    predictions: number[]
  }>
  overallAccuracy: number
  confidence: number
}

export default function ModelInterpretability() {
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [interpretationMethod, setInterpretationMethod] = useState<'lime' | 'shap' | 'permutation'>('shap')
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const [analysisProgress, setAnalysisProgress] = useState<number>(0)
  const [analysisStep, setAnalysisStep] = useState<string>('')
  const [interpretation, setInterpretation] = useState<ModelInterpretation | null>(null)
  const [showDetailedView, setShowDetailedView] = useState<boolean>(false)
  
  const [models, setModels] = useState([
    { id: 'model_1', name: 'Classification Model v1', accuracy: 0.85, type: 'classification' },
    { id: 'model_2', name: 'Regression Model v2', accuracy: 0.92, type: 'regression' },
    { id: 'model_3', name: 'Neural Network v3', accuracy: 0.78, type: 'neural_network' }
  ])
  const modelStorage = React.useMemo(() => new IndexedDBModelStorage(), [])

  useEffect(() => {
    const loadSavedModels = async () => {
      try {
        await modelStorage.init()
        const storedModels = await modelStorage.listModels()
        if (storedModels.length > 0) {
          const loadedModels = storedModels.map((model: StoredModel) => ({
            id: model.id,
            name: model.name,
            accuracy: model.metrics?.finalAccuracy || 0.85,
            type: 'classification' // 기본값으로 설정
          }))
          setModels(loadedModels)
          
          // 첫 번째 모델을 기본으로 선택
          if (loadedModels.length > 0 && !selectedModel) {
            setSelectedModel(loadedModels[0].id)
          }
        } else {
          // 기본 모델 목록 사용
          const defaultModels = [
            { id: 'model_1', name: 'Classification Model v1', accuracy: 0.85, type: 'classification' },
            { id: 'model_2', name: 'Regression Model v2', accuracy: 0.92, type: 'regression' },
            { id: 'model_3', name: 'Neural Network v3', accuracy: 0.78, type: 'neural_network' }
          ]
          setModels(defaultModels)
          
          // 첫 번째 모델을 기본으로 선택
          if (!selectedModel) {
            setSelectedModel(defaultModels[0].id)
          }
        }
      } catch (e) {
        console.error('Failed to load saved models:', e)
        // 기본 모델 목록 사용
        const defaultModels = [
          { id: 'model_1', name: 'Classification Model v1', accuracy: 0.85, type: 'classification' },
          { id: 'model_2', name: 'Regression Model v2', accuracy: 0.92, type: 'regression' },
          { id: 'model_3', name: 'Neural Network v3', accuracy: 0.78, type: 'neural_network' }
        ]
        setModels(defaultModels)
        
        // 첫 번째 모델을 기본으로 선택
        if (!selectedModel) {
          setSelectedModel(defaultModels[0].id)
        }
      }
    }
    
    loadSavedModels()
  }, [selectedModel, modelStorage])

  const startInterpretation = async () => {
    if (!selectedModel) {
      alert('분석할 모델을 선택해주세요.')
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setAnalysisStep('모델 로딩 중...')

    try {
      // 모델 로딩 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAnalysisProgress(20)
      setAnalysisStep('데이터 준비 중...')

      // 가상의 모델과 데이터 생성
      const model = await createVirtualModel()
      const testData = generateTestData()
      
      setAnalysisProgress(40)
      setAnalysisStep('특성 중요도 계산 중...')

      // 특성 중요도 계산
      const featureImportance = await calculateFeatureImportance(model, testData)
      
      setAnalysisProgress(60)
      setAnalysisStep('SHAP 값 계산 중...')

      // SHAP 값 계산
      const shapValues = await calculateSHAPValues(model, testData)
      
      setAnalysisProgress(80)
      setAnalysisStep('부분 의존성 분석 중...')

      // 부분 의존성 계산
      const partialDependence = await calculatePartialDependence(model, testData)
      
      setAnalysisProgress(100)
      setAnalysisStep('분석 완료')

      const result: ModelInterpretation = {
        featureImportance,
        shapValues,
        partialDependence,
        overallAccuracy: 0.85,
        confidence: 0.9
      }

      setInterpretation(result)
      
      setTimeout(() => {
        setIsAnalyzing(false)
        setAnalysisStep('')
        setAnalysisProgress(0)
      }, 1000)
    } catch (error) {
      console.error('Interpretation error:', error)
      setIsAnalyzing(false)
    }
  }

  const createVirtualModel = async () => {
    // 가상의 모델 생성 (실제로는 저장된 모델을 로드)
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [4], units: 10, activation: 'relu' }),
        tf.layers.dense({ units: 5, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    })
    
    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    })

    return model
  }

  const generateTestData = () => {
    // 가상의 테스트 데이터 생성
    return {
      features: Array.from({ length: 100 }, () => Array.from({ length: 4 }, () => Math.random())),
      labels: Array.from({ length: 100 }, () => Math.round(Math.random())),
      featureNames: ['feature1', 'feature2', 'feature3', 'feature4']
    }
  }

  const calculateFeatureImportance = async (model: tf.LayersModel, testData: { features: number[][], labels: number[], featureNames: string[] }): Promise<FeatureImportance[]> => {
    // Permutation Importance 시뮬레이션
    const features = testData.featureNames
    const importance: FeatureImportance[] = []

    for (let i = 0; i < features.length; i++) {
      const featureName = features[i]
      const baseImportance = Math.random()
      
      // 특성 중요도 계산 (시뮬레이션)
      const importanceValue = baseImportance + Math.random() * 0.3
      let impact: 'positive' | 'negative' | 'neutral'
      let description = ''

      if (importanceValue > 0.7) {
        impact = 'positive'
        description = `${featureName}은(는) 예측에 긍정적인 영향을 미칩니다`
      } else if (importanceValue < 0.3) {
        impact = 'negative'
        description = `${featureName}은(는) 예측에 부정적인 영향을 미칩니다`
      } else {
        impact = 'neutral'
        description = `${featureName}은(는) 예측에 미미한 영향을 미칩니다`
      }

      importance.push({
        name: featureName,
        importance: importanceValue,
        impact,
        description
      })
    }

    // 중요도 순으로 정렬
    return importance.sort((a, b) => b.importance - a.importance)
  }

  const calculateSHAPValues = async (model: tf.LayersModel, testData: { features: number[][], labels: number[], featureNames: string[] }) => {
    // SHAP 값 계산 시뮬레이션
    const shapValues = []
    const features = testData.featureNames

    // 첫 번째 샘플에 대한 SHAP 값만 계산
    const sample = testData.features[0]
    for (let j = 0; j < features.length; j++) {
      const value = sample[j]
      const impact = (Math.random() - 0.5) * 2 // -1에서 1 사이의 값
      
      shapValues.push({
        feature: features[j],
        value,
        impact
      })
    }

    return shapValues
  }

  const calculatePartialDependence = async (model: tf.LayersModel, testData: { features: number[][], labels: number[], featureNames: string[] }) => {
    // 부분 의존성 계산 시뮬레이션
    const partialDependence = []
    const features = testData.featureNames

    for (const feature of features) {
      const values = Array.from({ length: 50 }, (_, i) => i / 50) // 0에서 1까지의 값
      const predictions = values.map(() => Math.random()) // 가상의 예측 값

      partialDependence.push({
        feature,
        values,
        predictions
      })
    }

    return partialDependence
  }

  const getImpactColor = (impact: FeatureImportance['impact']) => {
    switch (impact) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      case 'neutral': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const getImpactIcon = (impact: FeatureImportance['impact']) => {
    switch (impact) {
      case 'positive': return <TrendingUp className="w-4 h-4" />
      case 'negative': return <AlertTriangle className="w-4 h-4" />
      case 'neutral': return <Target className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  const exportResults = () => {
    if (!interpretation) return

    const results = {
      modelId: selectedModel,
      method: interpretationMethod,
      timestamp: new Date().toISOString(),
      featureImportance: interpretation.featureImportance,
      shapValues: interpretation.shapValues.slice(0, 10), // 첫 10개 샘플만
      partialDependence: interpretation.partialDependence,
      overallAccuracy: interpretation.overallAccuracy,
      confidence: interpretation.confidence
    }

    const dataStr = JSON.stringify(results, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `model_interpretation_${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const selectedModelData = models.find(m => m.id === selectedModel)

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Eye className="text-purple-600" />
          모델 해석 가능성
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportResults} disabled={!interpretation}>
            <Download className="w-4 h-4 mr-2" />
            결과 내보내기
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            설정
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 왼쪽: 모델 선택 및 설정 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                모델 선택
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedModel} onValueChange={(value: string) => setSelectedModel(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="분석할 모델을 선택하세요">
                    {selectedModelData ? selectedModelData.name : "분석할 모델을 선택하세요"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {models.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex justify-between w-full">
                        <span>{model.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {(model.accuracy * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedModelData && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">모델 정확도</div>
                  <div className="text-lg font-bold text-green-600">
                    {(selectedModelData.accuracy * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedModelData.type}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                해석 방법
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={interpretationMethod} onValueChange={(value: string) => setInterpretationMethod(value as 'lime' | 'shap' | 'permutation')}>
                <SelectTrigger>
                  <SelectValue>
                    {interpretationMethod === 'lime' ? 'LIME' : 
                     interpretationMethod === 'shap' ? 'SHAP' : 'Permutation'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lime">LIME</SelectItem>
                  <SelectItem value="shap">SHAP</SelectItem>
                  <SelectItem value="permutation">Permutation</SelectItem>
                </SelectContent>
              </Select>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">상세 분석</span>
                  <Switch
                    checked={showDetailedView}
                    onCheckedChange={setShowDetailedView}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">자동 새로고침</span>
                  <Switch />
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-1">
                  {interpretationMethod === 'lime' ? '🍋 LIME' : 
                   interpretationMethod === 'shap' ? '🎯 SHAP' : '🔄 Permutation'}
                </div>
                <div className="text-xs text-blue-600">
                  {interpretationMethod === 'lime' ? '국소적 해석 가능성' :
                   interpretationMethod === 'shap' ? '게임 이론 기반' :
                   '특성 순열 중요도'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={startInterpretation}
            disabled={isAnalyzing || !selectedModel}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                분석 중...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                해석 시작
              </>
            )}
          </Button>
        </div>

        {/* 중앙: 분석 진행 및 결과 */}
        <div className="lg:col-span-2 space-y-6">
          {isAnalyzing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  모델 해석 중
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{analysisStep}</span>
                    <span>{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} className="w-full" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm text-purple-600">분석 방법</div>
                    <div className="text-lg font-bold text-purple-700 capitalize">
                      {interpretationMethod}
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600">처리 샘플</div>
                    <div className="text-lg font-bold text-blue-700">100개</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {interpretation && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    특성 중요도
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {interpretation.featureImportance.map((feature) => (
                      <div key={feature.name} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getImpactIcon(feature.impact)}
                            <span className="font-medium">{feature.name}</span>
                          </div>
                          <Badge 
                            variant={feature.impact === 'positive' ? 'default' : 'secondary'}
                            className={getImpactColor(feature.impact)}
                          >
                            {(feature.importance * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <Progress value={feature.importance * 100} className="w-full mb-2" />
                        <div className="text-xs text-gray-600">{feature.description}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    SHAP 값 분석
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">평균 SHAP 영향력</div>
                    <div className="text-2xl font-bold text-purple-700">
                      {Math.abs(interpretation.shapValues[0]?.impact || 0.5).toFixed(3)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-gray-600 mb-2">SHAP 값 분석</div>
                    {interpretation.shapValues.map((shap, index) => (
                      <div key={index} className="flex justify-between p-2 bg-gray-50 rounded text-xs">
                        <span>{shap.feature}:</span>
                        <span className={shap.impact > 0 ? 'text-green-600' : 'text-red-600'}>
                          {shap.impact.toFixed(3)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* 오른쪽: 통계 및 요약 */}
        <div className="space-y-6">
          {interpretation && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    해석 요약
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">전체 신뢰도</div>
                    <div className="text-3xl font-bold text-green-600">
                      {(interpretation.confidence * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <div className="text-sm text-blue-600">정확도</div>
                      <div className="text-lg font-bold text-blue-700">
                        {(interpretation.overallAccuracy * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg text-center">
                      <div className="text-sm text-purple-600">특성 수</div>
                      <div className="text-lg font-bold text-purple-700">
                        {interpretation.featureImportance.length}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">주요 특성</div>
                    {interpretation.featureImportance.slice(0, 3).map((feature, index) => (
                      <div key={feature.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{index + 1}. {feature.name}</span>
                        <Badge variant="secondary">
                          {(feature.importance * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">해석 팁</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-800 mb-1">🎯 긍정적 특성</div>
                    <div className="text-xs text-green-600">
                      예측에 도움이 되는 중요한 특성들
                    </div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-sm font-medium text-red-800 mb-1">⚠️ 부정적 특성</div>
                    <div className="text-xs text-red-600">
                      예측을 방해하는 특성들
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800 mb-1">📊 SHAP 값</div>
                    <div className="text-xs text-blue-600">
                      개별 예측에 대한 특성 기여도
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">모델 신뢰도</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">해석 가능성</span>
                    <Badge className="bg-green-100 text-green-800">높음</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">예측 일관성</span>
                    <Badge className="bg-blue-100 text-blue-800">안정적</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">특성 중요도</span>
                    <Badge className="bg-purple-100 text-purple-800">명확함</Badge>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
