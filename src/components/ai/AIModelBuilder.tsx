"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Play, Save, Download, BarChart3, Settings, Plus, Trash2, ChevronDown, ChevronUp, Database } from 'lucide-react'
import { DataProcessor, Dataset, ProcessedData } from '@/lib/dataProcessor'
import { ModelTrainer, TrainingConfig, TrainingProgress, TrainedModel } from '@/lib/modelTrainer'
import { IndexedDBModelStorage, StoredModel } from '@/lib/modelStorage'
import * as tf from '@tensorflow/tfjs'

interface AIModelBuilderProps {
  onModelCreate?: (model: TrainedModel) => void
}

interface LayerConfig {
  id: string
  type: 'dense' | 'dropout'
  units?: number
  activation?: 'relu' | 'sigmoid' | 'softmax' | 'tanh'
  rate?: number
}

export default function AIModelBuilder({ onModelCreate }: AIModelBuilderProps) {
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [modelName, setModelName] = useState('')
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [isTraining, setIsTraining] = useState(false)
  const [trainingHistory, setTrainingHistory] = useState<TrainingProgress[]>([])
  const [trainedModel, setTrainedModel] = useState<TrainedModel | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savedModels, setSavedModels] = useState<StoredModel[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [layers, setLayers] = useState<LayerConfig[]>([
    { id: 'l1', type: 'dense', units: 64, activation: 'relu' },
    { id: 'l2', type: 'dropout', rate: 0.2 },
    { id: 'l3', type: 'dense', units: 32, activation: 'relu' }
  ])

  const modelTrainer = new ModelTrainer()
  const modelStorage = new IndexedDBModelStorage()

  useEffect(() => {
    loadSavedModels()
  }, [])

  const loadSavedModels = async () => {
    try {
      await modelStorage.init()
      const models = await modelStorage.listModels()
      setSavedModels(models)
    } catch (error) {
      console.error('Failed to load saved models:', error)
    }
  }

  const handleDatasetUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    
    try {
      let parsedDataset: Dataset
      
      if (file.name.endsWith('.csv')) {
        parsedDataset = await DataProcessor.parseCSV(file)
      } else if (file.name.endsWith('.json')) {
        parsedDataset = await DataProcessor.parseJSON(file)
      } else {
        throw new Error('지원하지 않는 파일 형식입니다. CSV 또는 JSON 파일을 업로드해주세요.')
      }

      setDataset(parsedDataset)
    } catch (error) {
      setError(error instanceof Error ? error.message : '데이터셋 로딩 중 오류가 발생했습니다.')
    }
  }, [])

  // 레이어 추가 함수
  const addLayer = (type: 'dense' | 'dropout') => {
    const newLayer: LayerConfig = type === 'dense' 
      ? { id: Date.now().toString(), type: 'dense', units: 16, activation: 'relu' }
      : { id: Date.now().toString(), type: 'dropout', rate: 0.1 }
    setLayers([...layers, newLayer])
  }

  // 레이어 삭제 함수
  const removeLayer = (id: string) => {
    setLayers(layers.filter(l => l.id !== id))
  }

  // 레이어 업데이트 함수
  const updateLayer = (id: string, updates: Partial<LayerConfig>) => {
    setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l))
  }

  const startTraining = useCallback(async () => {
    if (!dataset || !modelName) {
      setError('데이터셋과 모델 이름을 모두 입력해주세요.')
      return
    }

    setError(null)
    setIsTraining(true)
    setTrainingProgress(0)
    setTrainingHistory([])

    try {
      const labelColumn = dataset.columns[dataset.columns.length - 1]
      const featureColumns = dataset.columns.slice(0, -1)
      const processedData = DataProcessor.preprocessData(dataset, labelColumn, featureColumns)

      const inputShape = [processedData.features[0].length]
      
      // 커스텀 레이어 구조로 모델 생성
      const model = tf.sequential()
      layers.forEach((layer, index) => {
        const config: any = { name: `layer_${index}_${layer.id}` }
        if (index === 0) config.inputShape = inputShape

        if (layer.type === 'dense') {
          config.units = layer.units
          config.activation = layer.activation
          model.add(tf.layers.dense(config))
        } else if (layer.type === 'dropout') {
          config.rate = layer.rate
          model.add(tf.layers.dropout(config))
        }
      })
      
      // 출력 레이어 자동 추가 (분류/회귀 판단)
      const outputUnits = 1 // 임시
      model.add(tf.layers.dense({
        units: outputUnits,
        activation: outputUnits === 1 ? 'sigmoid' : 'softmax',
        name: 'output'
      }))

      // 모델 수동 컴파일 대신 ModelTrainer 활용
      modelTrainer.setModel(model)
      
      const config: TrainingConfig = {
        epochs: 10,
        batchSize: 32,
        learningRate: 0.001,
        validationSplit: 0.2,
        optimizer: 'adam',
        lossFunction: 'meanSquaredError',
        metrics: ['accuracy']
      }

      modelTrainer.compileModel(config)

      // 모델 학습
      const trained = await modelTrainer.trainModel(
        processedData,
        config,
        (progress) => {
          setTrainingProgress((progress.epoch / config.epochs) * 100)
          setTrainingHistory(prev => [...prev, progress])
        }
      )

      trained.name = modelName
      setTrainedModel(trained)
      
      await modelStorage.saveModel(trained)
      await loadSavedModels()

      onModelCreate?.(trained)
    } catch (error) {
      setError(error instanceof Error ? error.message : '모델 학습 중 오류가 발생했습니다.')
    } finally {
      setIsTraining(false)
    }
  }, [dataset, modelName, layers, onModelCreate])

  const saveModel = useCallback(async () => {
    if (!trainedModel) return

    try {
      await modelStorage.saveModel(trainedModel)
      await loadSavedModels()
      alert('모델이 저장되었습니다.')
    } catch (error) {
      setError('모델 저장 중 오류가 발생했습니다.')
    }
  }, [trainedModel])

  const loadModel = useCallback(async (modelId: string) => {
    try {
      const model = await modelStorage.getModelTensor(modelId)
      if (model) {
        modelTrainer.dispose()
        setTrainedModel({
          id: modelId,
          name: `Loaded Model ${modelId}`,
          model,
          config: {
            epochs: 10,
            batchSize: 32,
            learningRate: 0.001,
            validationSplit: 0.2,
            optimizer: 'adam',
            lossFunction: 'meanSquaredError',
            metrics: ['accuracy']
          },
          metrics: {
            finalLoss: 0,
            trainingTime: 0,
            totalEpochs: 10
          },
          createdAt: new Date()
        })
      }
    } catch (error) {
      setError('모델 로딩 중 오류가 발생했습니다.')
    }
  }, [])

  const deleteModel = useCallback(async (modelId: string) => {
    if (!confirm('정말로 이 모델을 삭제하시겠습니까?')) return

    try {
      await modelStorage.deleteModel(modelId)
      await loadSavedModels()
      alert('모델이 삭제되었습니다.')
    } catch (error) {
      setError('모델 삭제 중 오류가 발생했습니다.')
    }
  }, [])

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">AI 모델 직접 개발</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="space-y-6">
        {/* 데이터셋 업로드 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            데이터셋 업로드 (CSV, JSON)
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleDatasetUpload}
              className="hidden"
              id="dataset-upload"
              disabled={isTraining}
            />
            <Button
              asChild
              variant="outline"
              disabled={isTraining}
            >
              <label htmlFor="dataset-upload" className="cursor-pointer flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                파일 선택
              </label>
            </Button>
            {dataset && (
              <span className="text-sm text-gray-600">
                {dataset.name} ({dataset.data.length} 행, {dataset.columns.length} 열)
              </span>
            )}
          </div>
        </div>

        {/* 모델 이름 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            모델 이름
          </label>
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="내 AI 모델 이름"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isTraining}
          />
        </div>

        {/* 고급 설정 토글 */}
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 px-0"
          >
            <Settings size={16} />
            고급 모델 아키텍처 설정
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>

          {showAdvanced && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">신경망 레이어 구성</h4>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => addLayer('dense')} className="h-7 text-[10px] px-2">
                    <Plus size={10} className="mr-1" /> Dense 추가
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => addLayer('dropout')} className="h-7 text-[10px] px-2">
                    <Plus size={10} className="mr-1" /> Dropout 추가
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {layers.map((layer, index) => (
                  <div key={layer.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm">
                    <span className="text-xs font-bold text-gray-300 w-4">{index + 1}</span>
                    <div className="flex-1 flex items-center gap-4">
                      {layer.type === 'dense' ? (
                        <>
                          <div className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">DENSE</div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Units</span>
                            <input 
                              type="number" 
                              value={layer.units} 
                              onChange={(e) => updateLayer(layer.id, { units: parseInt(e.target.value) })}
                              className="w-16 px-2 py-1 border rounded text-xs"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Activation</span>
                            <select 
                              value={layer.activation} 
                              onChange={(e) => updateLayer(layer.id, { activation: e.target.value as any })}
                              className="px-2 py-1 border rounded text-xs"
                            >
                              <option value="relu">ReLU</option>
                              <option value="sigmoid">Sigmoid</option>
                              <option value="softmax">Softmax</option>
                              <option value="tanh">Tanh</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">DROPOUT</div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Rate</span>
                            <input 
                              type="number" 
                              step="0.1"
                              min="0"
                              max="1"
                              value={layer.rate} 
                              onChange={(e) => updateLayer(layer.id, { rate: parseFloat(e.target.value) })}
                              className="w-16 px-2 py-1 border rounded text-xs"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeLayer(layer.id)}
                      className="h-8 w-8 text-gray-300 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 학습 옵션 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            기본 학습 파라미터
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">에포크 수</label>
              <input
                type="number"
                defaultValue="10"
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isTraining}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">학습률</label>
              <input
                type="number"
                defaultValue="0.001"
                step="0.001"
                min="0.0001"
                max="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={isTraining}
              />
            </div>
          </div>
        </div>

        {/* 학습 진행상황 */}
        {isTraining && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>학습 진행중...</span>
              <span>{Math.round(trainingProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${trainingProgress}%` }}
              />
            </div>
            
            {trainingHistory.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  실시간 학습 통계
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">현재 Loss:</span>
                    <span className="ml-2 font-medium">
                      {trainingHistory[trainingHistory.length - 1]?.loss.toFixed(4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">정확도:</span>
                    <span className="ml-2 font-medium">
                      {trainingHistory[trainingHistory.length - 1]?.accuracy 
                        ? `${(trainingHistory[trainingHistory.length - 1].accuracy! * 100).toFixed(2)}%`
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex space-x-4">
          <Button
            onClick={startTraining}
            disabled={!dataset || !modelName || isTraining}
            className="flex-1 items-center bg-blue-600 hover:bg-blue-700 h-12 text-lg font-bold"
          >
            <Play className="w-5 h-5 mr-2" />
            {isTraining ? '학습 중...' : '학습 시작'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={saveModel}
            disabled={!trainedModel}
            className="items-center h-12"
          >
            <Save className="w-5 h-5 mr-2" />
            모델 저장
          </Button>
          
          <Button 
            variant="outline" 
            className="items-center h-12"
            disabled={!trainedModel}
          >
            <Download className="w-5 h-5 mr-2" />
            내보내기
          </Button>
        </div>

        {/* 저장된 모델 목록 */}
        {savedModels.length > 0 && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-gray-400" />
              저장된 모델 보관함
            </h3>
            <div className="space-y-2">
              {savedModels.map((model) => (
                <div key={model.id} className="flex items-center justify-between p-4 bg-gray-50 border rounded-xl hover:border-blue-300 transition-colors group">
                  <div>
                    <div className="font-bold text-gray-800">{model.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      정확도: <span className="text-blue-600 font-bold">{model.metrics.finalAccuracy 
                        ? `${(model.metrics.finalAccuracy * 100).toFixed(2)}%`
                        : 'N/A'
                      }</span> | 생성: {model.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => loadModel(model.id)}
                      className="h-8 text-xs"
                    >
                      로드
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteModel(model.id)}
                      className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
