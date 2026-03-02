"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { 
  Brain, 
  Target, 
  Zap, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw,
  TrendingUp,
  Clock,
  Award,
  BarChart3
} from 'lucide-react'
import { ModelTrainer } from '@/lib/modelTrainer'
import { IndexedDBModelStorage, StoredModel } from '@/lib/modelStorage'
import OptimizationDetailModal from './OptimizationDetailModal'

interface HyperparameterConfig {
  learningRate: number
  batchSize: number
  epochs: number
  optimizer: 'adam' | 'sgd' | 'rmsprop'
  activation: 'relu' | 'sigmoid' | 'tanh' | 'softmax'
  dropoutRate: number
  validationSplit: number
  earlyStopping: boolean
  patience: number
}

interface OptimizationResult {
  bestConfig: HyperparameterConfig
  bestAccuracy: number
  bestLoss: number
  totalTrials: number
  executionTime: number
  allResults: Array<{
    config: HyperparameterConfig
    accuracy: number
    loss: number
    trial: number
  }>
}

export default function ModelOptimization() {
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [optimizationType, setOptimizationType] = useState<'grid' | 'random' | 'bayesian'>('grid')
  const [totalTrials, setTotalTrials] = useState<number>(10)
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false)
  const [currentTrial, setCurrentTrial] = useState<number>(0)
  const [currentProgress, setCurrentProgress] = useState<number>(0)
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false)
  
  const [baseConfig, setBaseConfig] = useState<HyperparameterConfig>({
    learningRate: 0.001,
    batchSize: 32,
    epochs: 10,
    optimizer: 'adam',
    activation: 'relu',
    dropoutRate: 0.2,
    validationSplit: 0.2,
    earlyStopping: true,
    patience: 3
  })

  const [savedModels, setSavedModels] = useState<Array<{id: string, name: string, accuracy?: number}>>([])
  const modelStorage = React.useMemo(() => new IndexedDBModelStorage(), [])

  useEffect(() => {
    const loadSavedModels = async () => {
      try {
        await modelStorage.init()
        const models = await modelStorage.listModels()
        const loadedModels = models.map((model: StoredModel) => ({
          id: model.id,
          name: model.name,
          accuracy: model.metrics?.finalAccuracy || 0.85
        }))
        
        // 기본 모델 목록과 저장된 모델 합치기
        const defaultModels = [
          { id: 'model_1', name: 'Classification Model v1', accuracy: 0.85 },
          { id: 'model_2', name: 'Regression Model v2', accuracy: 0.92 },
          { id: 'model_3', name: 'Neural Network v3', accuracy: 0.78 }
        ]
        
        const allModels = loadedModels.length > 0 ? loadedModels : defaultModels
        setSavedModels(allModels)
        
        // 첫 번째 모델을 기본으로 선택
        if (allModels.length > 0 && !selectedModel) {
          setSelectedModel(allModels[0].id)
        }
      } catch (e) {
        console.error('Failed to load saved models:', e)
        // 기본 모델 목록
        const defaultModels = [
          { id: 'model_1', name: 'Classification Model v1', accuracy: 0.85 },
          { id: 'model_2', name: 'Regression Model v2', accuracy: 0.92 },
          { id: 'model_3', name: 'Neural Network v3', accuracy: 0.78 }
        ]
        setSavedModels(defaultModels)
        
        // 첫 번째 모델을 기본으로 선택
        if (!selectedModel) {
          setSelectedModel(defaultModels[0].id)
        }
      }
    }
    
    loadSavedModels()
  }, [selectedModel, modelStorage])

  const startOptimization = async () => {
    if (!selectedModel) {
      alert('최적화할 모델을 선택해주세요.')
      return
    }

    setIsOptimizing(true)
    setCurrentProgress(0)
    setCurrentTrial(0)

    const trainer = new ModelTrainer()
    const results = []
    let bestAccuracy = 0
    let bestLoss = Infinity
    let bestConfig = baseConfig

    // eslint-disable-next-line react-hooks/purity
    const startTime = performance.now()

    for (let i = 0; i < totalTrials; i++) {
      setCurrentTrial(i + 1)
      setCurrentProgress((i / totalTrials) * 100)

      // 하이퍼파라미터 조합 생성
      const config = generateConfig(i)
      
      try {
        // 모델 생성 및 학습 시뮬레이션
        trainer.createModel([4], 1)
        
        // 학습 프로세스 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 1000)) // 1초 대기
        
        // 가상의 학습 결과 생성 (시뮬레이션)
        // eslint-disable-next-line react-hooks/purity
        const randomFactor1 = Math.random()
        // eslint-disable-next-line react-hooks/purity
        const randomFactor2 = Math.random()
        
        const accuracy = 0.7 + (i / totalTrials) * 0.2 + (randomFactor1 - 0.5) * 0.1
        const loss = 0.5 - (i / totalTrials) * 0.3 + (randomFactor2 - 0.5) * 0.1
        
        results.push({
          config,
          accuracy: Math.min(0.95, Math.max(0.6, accuracy)),
          loss: Math.max(0.01, Math.min(0.8, loss)),
          trial: i + 1
        })

        if (accuracy > bestAccuracy || (accuracy === bestAccuracy && loss < bestLoss)) {
          bestAccuracy = accuracy
          bestLoss = loss
          bestConfig = config
        }

        trainer.dispose()
      } catch (error) {
        console.error('Trial failed:', error)
      }
    }

    // eslint-disable-next-line react-hooks/purity
    const endTime = performance.now()

    setOptimizationResult({
      bestConfig,
      bestAccuracy,
      bestLoss,
      totalTrials,
      executionTime: endTime - startTime,
      allResults: results
    })

    setIsOptimizing(false)
    setCurrentProgress(100)
  }

  const generateConfig = (trial: number): HyperparameterConfig => {
    if (optimizationType === 'grid') {
      // Grid Search - 정해진 값들 중에서 선택
      const learningRates = [0.001, 0.01, 0.1]
      const batchSizes = [16, 32, 64]
      const epochs = [10, 20, 30]
      
      return {
        ...baseConfig,
        learningRate: learningRates[trial % learningRates.length],
        batchSize: batchSizes[Math.floor(trial / learningRates.length) % batchSizes.length],
        epochs: epochs[Math.floor(trial / (learningRates.length * batchSizes.length)) % epochs.length]
      }
    } else if (optimizationType === 'random') {
      // Random Search - 랜덤 값 선택
      const optimizers: Array<'adam' | 'sgd' | 'rmsprop'> = ['adam', 'sgd', 'rmsprop']
      const activations: Array<'relu' | 'sigmoid' | 'tanh' | 'softmax'> = ['relu', 'sigmoid', 'tanh', 'softmax']
      
      return {
        ...baseConfig,
        learningRate: 10 ** (-3 + (trial % 10) / 10 * 3),
        batchSize: [16, 32, 64][trial % 3],
        epochs: 5 + (trial % 25),
        optimizer: optimizers[trial % optimizers.length],
        activation: activations[trial % activations.length],
        dropoutRate: (trial % 5) / 10
      }
    } else {
      // Bayesian Search - 간단한 시뮬레이션
      return {
        ...baseConfig,
        learningRate: 0.001 + (trial / totalTrials) * 0.009,
        batchSize: 16 + Math.floor((trial / totalTrials) * 48),
        epochs: 10 + Math.floor((trial / totalTrials) * 20)
      }
    }
  }

  const resetOptimization = () => {
    setOptimizationResult(null)
    setCurrentTrial(0)
    setCurrentProgress(0)
    setIsOptimizing(false)
  }

  const selectedModelData = savedModels.find(m => m.id === selectedModel)

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="text-orange-600" />
          모델 최적화
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetOptimization}>
            <RotateCcw className="w-4 h-4 mr-2" />
            초기화
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            설정
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 모델 선택 및 최적화 설정 */}
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
                  <SelectValue placeholder="최적화할 모델을 선택하세요">
                    {selectedModelData ? selectedModelData.name : "최적화할 모델을 선택하세요"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {savedModels.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex justify-between w-full">
                        <span>{model.name}</span>
                        {model.accuracy && (
                          <Badge variant="secondary" className="ml-2">
                            {(model.accuracy * 100).toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedModelData && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">현재 정확도</div>
                  <div className="text-lg font-bold text-green-600">
                    {((selectedModelData.accuracy || 0) * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                최적화 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>최적화 방식</Label>
                <Select value={optimizationType} onValueChange={(value: string) => setOptimizationType(value as 'grid' | 'random' | 'bayesian')}>
                  <SelectTrigger>
                    <SelectValue>
                      {optimizationType === 'grid' ? 'Grid Search' : 
                       optimizationType === 'random' ? 'Random Search' : 'Bayesian Search'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid Search</SelectItem>
                    <SelectItem value="random">Random Search</SelectItem>
                    <SelectItem value="bayesian">Bayesian Search</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>시도 횟수: {totalTrials}</Label>
                <Slider
                  value={[totalTrials]}
                  onValueChange={(value) => setTotalTrials(value[0])}
                  max={50}
                  min={5}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">학습률</Label>
                  <span className="text-sm font-mono">{baseConfig.learningRate}</span>
                </div>
                <Slider
                  value={[baseConfig.learningRate]}
                  onValueChange={(value) => setBaseConfig(prev => ({ ...prev, learningRate: value[0] }))}
                  max={0.1}
                  min={0.0001}
                  step={0.0001}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">배치 크기</Label>
                  <span className="text-sm font-mono">{baseConfig.batchSize}</span>
                </div>
                <Slider
                  value={[baseConfig.batchSize]}
                  onValueChange={(value) => setBaseConfig(prev => ({ ...prev, batchSize: value[0] }))}
                  max={128}
                  min={8}
                  step={8}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">에포크 수</Label>
                  <span className="text-sm font-mono">{baseConfig.epochs}</span>
                </div>
                <Slider
                  value={[baseConfig.epochs]}
                  onValueChange={(value) => setBaseConfig(prev => ({ ...prev, epochs: value[0] }))}
                  max={100}
                  min={5}
                  step={5}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">조기 종료</Label>
                <Switch
                  checked={baseConfig.earlyStopping}
                  onCheckedChange={(checked) => setBaseConfig(prev => ({ ...prev, earlyStopping: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={startOptimization}
            disabled={isOptimizing || !selectedModel}
            className="w-full"
            size="lg"
          >
            {isOptimizing ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                최적화 중 ({currentTrial}/{totalTrials})
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                최적화 시작
              </>
            )}
          </Button>
        </div>

        {/* 중앙: 진행 상황 및 결과 */}
        <div className="space-y-6">
          {isOptimizing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  최적화 진행 중
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>전체 진행률</span>
                    <span>{currentProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={currentProgress} className="w-full" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600">현재 시도</div>
                    <div className="text-xl font-bold text-blue-700">{currentTrial}/{totalTrials}</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600">최고 정확도</div>
                    <div className="text-xl font-bold text-green-700">
                      {optimizationResult ? (optimizationResult.bestAccuracy * 100).toFixed(1) : '0.0'}%
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">현재 테스트 중인 설정</div>
                  <div className="text-xs space-y-1 font-mono">
                    <div>LR: {baseConfig.learningRate}</div>
                    <div>Batch: {baseConfig.batchSize}</div>
                    <div>Epochs: {baseConfig.epochs}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {optimizationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  최적화 결과
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm text-green-600 mb-1">최고 성능</div>
                  <div className="text-2xl font-bold text-green-700">
                    {(optimizationResult.bestAccuracy * 100).toFixed(2)}%
                  </div>
                  <div className="text-sm text-green-600">
                    Loss: {optimizationResult.bestLoss.toFixed(4)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-700">최적 하이퍼파라미터</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="text-gray-600">학습률:</span>
                      <span className="ml-2 font-mono">{optimizationResult.bestConfig.learningRate}</span>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="text-gray-600">배치:</span>
                      <span className="ml-2 font-mono">{optimizationResult.bestConfig.batchSize}</span>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="text-gray-600">에포크:</span>
                      <span className="ml-2 font-mono">{optimizationResult.bestConfig.epochs}</span>
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <span className="text-gray-600">옵티마이저:</span>
                      <span className="ml-2 font-mono">{optimizationResult.bestConfig.optimizer}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600">총 시도</div>
                    <div className="text-lg font-bold text-blue-700">{optimizationResult.totalTrials}</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm text-purple-600">실행 시간</div>
                    <div className="text-lg font-bold text-purple-700">
                      {(optimizationResult.executionTime / 1000).toFixed(1)}s
                    </div>
                  </div>
                </div>

                <Button className="w-full" variant="outline" onClick={() => setShowDetailModal(true)}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  상세 결과 보기
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 오른쪽: 통계 및 히스토리 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                최적화 통계
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                <div className="text-sm text-orange-600 mb-1">예상 개선 효과</div>
                <div className="text-3xl font-bold text-orange-700">
                  {selectedModelData ? 
                    (((optimizationResult?.bestAccuracy || 0.85) - (selectedModelData.accuracy || 0.8)) * 100).toFixed(1) : 
                    '5.0'}%
                </div>
                <div className="text-xs text-orange-600 mt-1">정확도 향상</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">최적화 방식</span>
                  <span className="font-medium capitalize">{optimizationType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">탐색 공간</span>
                  <span className="font-medium">{totalTrials}개 조합</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">평균 실행 시간</span>
                  <span className="font-medium">~1.2초/시도</span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">성능 분포</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>최고: {(optimizationResult?.bestAccuracy || 0.85 * 100).toFixed(1)}%</span>
                    <span>평균: {((optimizationResult?.bestAccuracy || 0.85) * 95).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full w-[85%]"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">최적화 팁</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-1">🎯 정확도 우선</div>
                <div className="text-xs text-blue-600">Grid Search로 체계적으로 탐색</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-800 mb-1">⚡ 속도 우선</div>
                <div className="text-xs text-green-600">Random Search로 빠르게 탐색</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-sm font-medium text-purple-800 mb-1">🧠 지능 탐색</div>
                <div className="text-xs text-purple-600">Bayesian Search로 효율적 탐색</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">성능 기준</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">우수</span>
                <Badge className="bg-green-100 text-green-800">90%+</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">양호</span>
                <Badge className="bg-blue-100 text-blue-800">80-89%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">보통</span>
                <Badge className="bg-yellow-100 text-yellow-800">70-79%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">개선 필요</span>
                <Badge className="bg-red-100 text-red-800">&lt;70%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 상세 결과 모달 */}
      {showDetailModal && optimizationResult && (
        <OptimizationDetailModal
          result={optimizationResult}
          optimizationType={optimizationType}
          onCloseAction={() => setShowDetailModal(false)}
        />
      )}
    </div>
  )
}
