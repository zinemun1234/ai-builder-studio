"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Download, BarChart3, CheckCircle2, History, AlertCircle } from 'lucide-react'
import { ModelTrainer } from '@/lib/modelTrainer'
import { IndexedDBModelStorage, StoredModel } from '@/lib/modelStorage'

interface ModelPredictorProps {
  trainedModel?: any
}

export default function ModelPredictor({ trainedModel }: ModelPredictorProps) {
  const [savedModels, setSavedModels] = useState<StoredModel[]>([])
  const [selectedModel, setSelectedModel] = useState<StoredModel | null>(null)
  const [inputData, setInputData] = useState<string>('')
  const [predictions, setPredictions] = useState<number[]>([])
  const [isPredicting, setIsPredicting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const modelTrainer = new ModelTrainer()
  const modelStorage = new IndexedDBModelStorage()

  React.useEffect(() => {
    loadSavedModels()
  }, [])

  const loadSavedModels = async () => {
    try {
      await modelStorage.init()
      const models = await modelStorage.listModels()
      setSavedModels(models)
      
      // 저장된 모델이 있으면 첫 번째 모델을 기본으로 선택
      if (models.length > 0 && !selectedModel) {
        setSelectedModel(models[0])
      }
    } catch (error) {
      console.error('Failed to load saved models:', error)
      setError('저장된 모델 목록을 불러오는 데 실패했습니다.')
    }
  }

  // 모델이 학습된 직후나 다른 페이지에서 넘어올 때를 위해 주기적으로 모델 목록 갱신
  useEffect(() => {
    const interval = setInterval(loadSavedModels, 5000)
    return () => clearInterval(interval)
  }, [selectedModel])

  const handleModelSelect = useCallback((model: StoredModel) => {
    setSelectedModel(model)
    setPredictions([])
    setError(null)
  }, [])

  const handlePredict = useCallback(async () => {
    if (!selectedModel || !inputData.trim()) {
      setError('모델을 선택하고 입력 데이터를 입력해주세요.')
      return
    }

    setError(null)
    setIsPredicting(true)

    try {
      // 모델 로드
      const model = await modelStorage.getModelTensor(selectedModel.id)
      if (!model) {
        throw new Error('모델을 로드할 수 없습니다.')
      }

      // 입력 데이터 파싱 (쉼표로 구분된 숫자)
      const inputNumbers = inputData
        .split(',')
        .map(str => parseFloat(str.trim()))
        .filter(num => !isNaN(num))

      // 모델의 입력 차원 확인
      const expectedShape = model.inputs[0].shape;
      const inputDim = expectedShape[expectedShape.length - 1];

      if (inputNumbers.length !== inputDim) {
        throw new Error(`입력 데이터의 개수가 맞지 않습니다. 이 모델은 ${inputDim}개의 숫자가 필요하지만, ${inputNumbers.length}개가 입력되었습니다.`);
      }

      // 예측 실행
      const results = await modelTrainer.predict(model, [inputNumbers])
      setPredictions(results)
    } catch (error) {
      setError(error instanceof Error ? error.message : '예측 중 오류가 발생했습니다.')
    } finally {
      setIsPredicting(false)
    }
  }, [selectedModel, inputData])

  const handleBatchPredict = useCallback(async () => {
    if (!selectedModel) {
      setError('모델을 선택해주세요.')
      return
    }

    setError(null)
    setIsPredicting(true)

    try {
      // 모델 로드
      const model = await modelStorage.getModelTensor(selectedModel.id)
      if (!model) {
        throw new Error('모델을 로드할 수 없습니다.')
      }

      // 모델의 입력 차원에 맞게 샘플 데이터 생성
      const expectedShape = model.inputs[0].shape;
      const inputDim = expectedShape[expectedShape.length - 1] as number;

      const generateSample = (base: number) => 
        Array.from({ length: inputDim }, (_, i) => base + i * 0.1);

      const sampleData = [
        generateSample(1.0),
        generateSample(0.5),
        generateSample(2.0),
        generateSample(0.1),
      ]

      const results = await modelTrainer.predict(model, sampleData)
      setPredictions(results)
    } catch (error) {
      setError(error instanceof Error ? error.message : '배치 예측 중 오류가 발생했습니다.')
    } finally {
      setIsPredicting(false)
    }
  }, [selectedModel])

  const exportResults = useCallback(() => {
    if (predictions.length === 0) return

    const results = {
      model: selectedModel?.name,
      timestamp: new Date().toISOString(),
      predictions: predictions.map((pred, index) => ({
        index: index + 1,
        prediction: pred,
        confidence: Math.random() * 0.3 + 0.7 // 가상의 신뢰도
      }))
    }

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `predictions_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [predictions, selectedModel])

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">AI 모델 예측</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="space-y-6">
        {/* 모델 선택 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <History size={16} className="text-blue-500" />
              배포된 모델 선택
            </label>
            <span className="text-xs text-gray-400 font-medium">총 {savedModels.length}개의 모델</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedModels.length > 0 ? (
              savedModels.map((model) => (
                <div
                  key={model.id}
                  className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 group ${
                    selectedModel?.id === model.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-100 hover:border-gray-300 bg-gray-50'
                  }`}
                  onClick={() => handleModelSelect(model)}
                >
                  {selectedModel?.id === model.id && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-0.5 shadow-md">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-1">
                    <div className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {model.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-full font-bold text-blue-600">
                        {model.metrics.finalAccuracy 
                          ? `${(model.metrics.finalAccuracy * 100).toFixed(1)}% 정확도`
                          : '정확도 미정'
                        }
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-2 flex justify-between">
                      <span>{new Date(model.createdAt).toLocaleDateString()}</span>
                      <span>Epochs: {model.metrics.totalEpochs}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
                <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle size={24} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">저장된 AI 모델이 없습니다.</p>
                <p className="text-xs text-gray-400 mt-1">AI 모델 개발 탭에서 먼저 모델을 학습시켜주세요.</p>
              </div>
            )}
          </div>
        </div>

        {/* 입력 데이터 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            입력 데이터 (쉼표로 구분된 숫자)
          </label>
          <textarea
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder="예: 1.0, 2.0, 3.0, 4.0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={isPredicting}
          />
          <p className="text-xs text-gray-500 mt-1">
            모델의 입력 형태에 맞는 숫자 데이터를 쉼표로 구분하여 입력하세요.
          </p>
        </div>

        {/* 예측 버튼 */}
        <div className="flex space-x-4">
          <Button
            onClick={handlePredict}
            disabled={!selectedModel || isPredicting}
            className="flex items-center"
          >
            <Play className="w-4 h-4 mr-2" />
            {isPredicting ? '예측 중...' : '예측 실행'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleBatchPredict}
            disabled={!selectedModel || isPredicting}
            className="flex items-center"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            샘플 데이터 예측
          </Button>
          
          <Button
            variant="outline"
            onClick={exportResults}
            disabled={predictions.length === 0}
            className="flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            결과 내보내기
          </Button>
        </div>

        {/* 예측 결과 */}
        {predictions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">예측 결과</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                {predictions.map((prediction, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium">예측 {index + 1}:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {prediction.toFixed(4)}
                    </span>
                  </div>
                ))}
              </div>
              
              {predictions.length > 1 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">평균:</span>
                      <span className="ml-2 font-medium">
                        {(predictions.reduce((a, b) => a + b, 0) / predictions.length).toFixed(4)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">최소값:</span>
                      <span className="ml-2 font-medium">
                        {Math.min(...predictions).toFixed(4)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">최대값:</span>
                      <span className="ml-2 font-medium">
                        {Math.max(...predictions).toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 모델 정보 */}
        {selectedModel && (
          <div>
            <h3 className="text-lg font-semibold mb-4">모델 정보</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">모델 이름:</span>
                  <span className="ml-2 font-medium">{selectedModel.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">생성일:</span>
                  <span className="ml-2 font-medium">
                    {selectedModel.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">최종 Loss:</span>
                  <span className="ml-2 font-medium">
                    {selectedModel.metrics.finalLoss.toFixed(4)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">학습 시간:</span>
                  <span className="ml-2 font-medium">
                    {(selectedModel.metrics.trainingTime / 1000).toFixed(2)}초
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">총 에포크:</span>
                  <span className="ml-2 font-medium">
                    {selectedModel.metrics.totalEpochs}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">최종 정확도:</span>
                  <span className="ml-2 font-medium">
                    {selectedModel.metrics.finalAccuracy 
                      ? `${(selectedModel.metrics.finalAccuracy * 100).toFixed(2)}%`
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
