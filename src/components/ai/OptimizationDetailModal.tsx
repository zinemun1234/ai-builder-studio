"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  X, 
  TrendingUp, 
  TrendingDown,
  Award,
  BarChart3,
  Activity,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download
} from 'lucide-react'

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

interface OptimizationDetailModalProps {
  result: OptimizationResult
  optimizationType: 'grid' | 'random' | 'bayesian'
  onCloseAction: () => void
}

export default function OptimizationDetailModal({ 
  result, 
  optimizationType,
  onCloseAction 
}: OptimizationDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'trials' | 'comparison' | 'insights'>('overview')

  // 통계 계산
  const avgAccuracy = result.allResults.reduce((sum, r) => sum + r.accuracy, 0) / result.allResults.length
  const minAccuracy = Math.min(...result.allResults.map(r => r.accuracy))
  const maxAccuracy = Math.max(...result.allResults.map(r => r.accuracy))
  const stdDeviation = Math.sqrt(
    result.allResults.reduce((sum, r) => sum + Math.pow(r.accuracy - avgAccuracy, 2), 0) / result.allResults.length
  )

  // 상위 5개 결과
  const topResults = [...result.allResults]
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 5)

  // 하위 5개 결과
  const bottomResults = [...result.allResults]
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5)

  const exportResults = () => {
    const data = {
      optimizationType,
      timestamp: new Date().toISOString(),
      summary: {
        bestAccuracy: result.bestAccuracy,
        bestLoss: result.bestLoss,
        totalTrials: result.totalTrials,
        executionTime: result.executionTime,
        avgAccuracy,
        minAccuracy,
        maxAccuracy,
        stdDeviation
      },
      bestConfig: result.bestConfig,
      allResults: result.allResults
    }

    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `optimization_results_${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="text-orange-600" />
              최적화 상세 결과
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {optimizationType === 'grid' ? 'Grid Search' : 
               optimizationType === 'random' ? 'Random Search' : 'Bayesian Search'} 분석
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportResults}>
              <Download className="w-4 h-4 mr-2" />
              내보내기
            </Button>
            <Button variant="ghost" size="sm" onClick={onCloseAction}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b px-6">
          <div className="flex gap-1">
            {(['overview', 'trials', 'comparison', 'insights'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-6 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'overview' && '개요'}
                {tab === 'trials' && '시도 내역'}
                {tab === 'comparison' && '비교 분석'}
                {tab === 'insights' && '인사이트'}
              </button>
            ))}
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 최고 성능 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    최고 성능
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-sm text-green-600 mb-1">정확도</div>
                      <div className="text-3xl font-bold text-green-700">
                        {(result.bestAccuracy * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-600 mb-1">손실</div>
                      <div className="text-3xl font-bold text-blue-700">
                        {result.bestLoss.toFixed(4)}
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-sm text-purple-600 mb-1">실행 시간</div>
                      <div className="text-3xl font-bold text-purple-700">
                        {(result.executionTime / 1000).toFixed(1)}s
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 최적 하이퍼파라미터 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-600" />
                    최적 하이퍼파라미터
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">학습률</div>
                      <div className="text-lg font-bold font-mono">{result.bestConfig.learningRate}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">배치 크기</div>
                      <div className="text-lg font-bold font-mono">{result.bestConfig.batchSize}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">에포크</div>
                      <div className="text-lg font-bold font-mono">{result.bestConfig.epochs}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">옵티마이저</div>
                      <div className="text-lg font-bold capitalize">{result.bestConfig.optimizer}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">활성화 함수</div>
                      <div className="text-lg font-bold capitalize">{result.bestConfig.activation}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">드롭아웃</div>
                      <div className="text-lg font-bold font-mono">{result.bestConfig.dropoutRate.toFixed(2)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 통계 요약 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    통계 요약
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>평균 정확도</span>
                        <span className="font-bold">{(avgAccuracy * 100).toFixed(2)}%</span>
                      </div>
                      <Progress value={avgAccuracy * 100} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">최고</div>
                        <div className="text-lg font-bold text-green-600">{(maxAccuracy * 100).toFixed(2)}%</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">최저</div>
                        <div className="text-lg font-bold text-red-600">{(minAccuracy * 100).toFixed(2)}%</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">표준편차</div>
                        <div className="text-lg font-bold">{(stdDeviation * 100).toFixed(2)}%</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">총 시도</div>
                        <div className="text-lg font-bold">{result.totalTrials}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'trials' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    모든 시도 내역
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {result.allResults.map((trial, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={trial.accuracy === result.bestAccuracy ? 'default' : 'secondary'}>
                            시도 {trial.trial}
                          </Badge>
                          <span className="text-sm font-mono">
                            LR: {trial.config.learningRate} | Batch: {trial.config.batchSize} | Epochs: {trial.config.epochs}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{(trial.accuracy * 100).toFixed(2)}%</span>
                          {trial.accuracy === result.bestAccuracy && (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="space-y-6">
              {/* 상위 5개 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    상위 5개 결과
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topResults.map((trial, index) => (
                      <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex justify-between items-center mb-2">
                          <Badge className="bg-green-600">{index + 1}위</Badge>
                          <span className="text-xl font-bold text-green-700">
                            {(trial.accuracy * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>학습률: {trial.config.learningRate} | 배치: {trial.config.batchSize} | 에포크: {trial.config.epochs}</div>
                          <div>옵티마이저: {trial.config.optimizer} | 활성화: {trial.config.activation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 하위 5개 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    하위 5개 결과
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bottomResults.map((trial, index) => (
                      <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant="destructive">{result.totalTrials - index}위</Badge>
                          <span className="text-xl font-bold text-red-700">
                            {(trial.accuracy * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>학습률: {trial.config.learningRate} | 배치: {trial.config.batchSize} | 에포크: {trial.config.epochs}</div>
                          <div>옵티마이저: {trial.config.optimizer} | 활성화: {trial.config.activation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    주요 인사이트
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-900 mb-1">최적 학습률</div>
                        <div className="text-sm text-blue-700">
                          {result.bestConfig.learningRate}의 학습률이 가장 좋은 성능을 보였습니다.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-green-900 mb-1">배치 크기 영향</div>
                        <div className="text-sm text-green-700">
                          배치 크기 {result.bestConfig.batchSize}에서 최고 성능을 달성했습니다.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-purple-900 mb-1">성능 분산</div>
                        <div className="text-sm text-purple-700">
                          표준편차 {(stdDeviation * 100).toFixed(2)}%로 {stdDeviation < 0.05 ? '안정적인' : '다양한'} 결과를 보였습니다.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-orange-900 mb-1">개선 여지</div>
                        <div className="text-sm text-orange-700">
                          최고 성능과 평균 성능의 차이가 {((maxAccuracy - avgAccuracy) * 100).toFixed(2)}%입니다.
                          {maxAccuracy - avgAccuracy > 0.05 ? ' 추가 최적화가 가능합니다.' : ' 이미 최적화가 잘 되어있습니다.'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
