"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { X, Download, TrendingUp, BarChart3, Activity, Target } from 'lucide-react'

interface StatisticalAnalysis {
  column: string
  mean: number
  median: number
  std: number
  min: number
  max: number
  q1: number
  q3: number
  skewness: number
  kurtosis: number
}

interface CorrelationMatrix {
  columns: string[]
  matrix: number[][]
}

interface DistributionAnalysis {
  column: string
  type: 'normal' | 'skewed' | 'uniform' | 'bimodal'
  histogram: { bin: string; count: number }[]
}

interface FeatureImportance {
  feature: string
  importance: number
  rank: number
}

interface DataQualityMetrics {
  completeness: number
  consistency: number
  validity: number
  uniqueness: number
  totalScore: number
}

interface DataAnalysisDetailModalProps {
  onCloseAction: () => void
  statisticalAnalysis: StatisticalAnalysis[]
  correlationMatrix: CorrelationMatrix | null
  distributionAnalysis: DistributionAnalysis[]
  featureImportance: FeatureImportance[]
  dataQuality: DataQualityMetrics | null
  datasetName: string
}

export default function DataAnalysisDetailModal({
  onCloseAction,
  statisticalAnalysis,
  correlationMatrix,
  distributionAnalysis,
  featureImportance,
  dataQuality,
  datasetName
}: DataAnalysisDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'statistics' | 'correlation' | 'distribution' | 'importance'>('overview')

  const exportResults = () => {
    const results = {
      dataset: datasetName,
      timestamp: new Date().toISOString(),
      dataQuality,
      statisticalAnalysis,
      correlationMatrix,
      distributionAnalysis,
      featureImportance
    }

    const dataStr = JSON.stringify(results, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `analysis_${datasetName.replace(/\s+/g, '_')}_${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">데이터 분석 상세 결과</h2>
            <p className="text-sm text-gray-600 mt-1">데이터셋: {datasetName}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportResults}>
              <Download className="w-4 h-4 mr-2" />
              JSON 내보내기
            </Button>
            <Button variant="ghost" size="sm" onClick={onCloseAction}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b bg-gray-50">
          <div className="flex gap-1 p-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              개요
            </button>
            <button
              onClick={() => setActiveTab('statistics')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'statistics'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              통계 분석
            </button>
            <button
              onClick={() => setActiveTab('correlation')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'correlation'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              상관관계
            </button>
            <button
              onClick={() => setActiveTab('distribution')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'distribution'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              분포 분석
            </button>
            <button
              onClick={() => setActiveTab('importance')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'importance'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              특성 중요도
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    분석 요약
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dataQuality && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">종합 품질 점수</div>
                        <div className="text-4xl font-bold text-green-600">
                          {dataQuality.totalScore.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {dataQuality.totalScore >= 90 ? '우수' : 
                           dataQuality.totalScore >= 80 ? '양호' : 
                           dataQuality.totalScore >= 70 ? '보통' : '개선 필요'}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>완성도</span>
                            <span>{dataQuality.completeness.toFixed(1)}%</span>
                          </div>
                          <Progress value={dataQuality.completeness} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>일관성</span>
                            <span>{dataQuality.consistency.toFixed(1)}%</span>
                          </div>
                          <Progress value={dataQuality.consistency} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>유효성</span>
                            <span>{dataQuality.validity.toFixed(1)}%</span>
                          </div>
                          <Progress value={dataQuality.validity} className="h-2" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <div className="text-sm text-blue-600 mb-1">통계 분석</div>
                      <div className="text-2xl font-bold text-blue-700">
                        {statisticalAnalysis.length}
                      </div>
                      <div className="text-xs text-blue-600">개 변수 분석</div>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <div className="text-sm text-purple-600 mb-1">분포 분석</div>
                      <div className="text-2xl font-bold text-purple-700">
                        {distributionAnalysis.length}
                      </div>
                      <div className="text-xs text-purple-600">개 분포 확인</div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <div className="text-sm text-green-600 mb-1">특성 중요도</div>
                      <div className="text-2xl font-bold text-green-700">
                        {featureImportance.length}
                      </div>
                      <div className="text-xs text-green-600">개 특성 평가</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {featureImportance.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">주요 인사이트</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-800 mb-1">
                        🎯 가장 중요한 특성
                      </div>
                      <div className="text-sm text-blue-600">
                        {featureImportance[0]?.feature} ({featureImportance[0]?.importance.toFixed(2)}%)
                      </div>
                    </div>
                    
                    {correlationMatrix && correlationMatrix.matrix.length > 0 && (
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-sm font-medium text-purple-800 mb-1">
                          🔗 강한 상관관계
                        </div>
                        <div className="text-sm text-purple-600">
                          {(() => {
                            let maxCorr = 0
                            let pair = ['', '']
                            for (let i = 0; i < correlationMatrix.matrix.length; i++) {
                              for (let j = i + 1; j < correlationMatrix.matrix[i].length; j++) {
                                const corr = Math.abs(correlationMatrix.matrix[i][j])
                                if (corr > maxCorr && corr < 1) {
                                  maxCorr = corr
                                  pair = [correlationMatrix.columns[i], correlationMatrix.columns[j]]
                                }
                              }
                            }
                            return `${pair[0]} ↔ ${pair[1]} (r=${maxCorr.toFixed(2)})`
                          })()}
                        </div>
                      </div>
                    )}
                    
                    {distributionAnalysis.length > 0 && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-sm font-medium text-green-800 mb-1">
                          📊 분포 특성
                        </div>
                        <div className="text-sm text-green-600">
                          정규분포: {distributionAnalysis.filter(d => d.type === 'normal').length}개, 
                          편향분포: {distributionAnalysis.filter(d => d.type === 'skewed').length}개
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    상세 통계 분석
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statisticalAnalysis.length > 0 ? (
                    <div className="space-y-4">
                      {statisticalAnalysis.map((stat, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-800 mb-3 text-lg">{stat.column}</div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="p-3 bg-white rounded">
                              <span className="text-gray-600 block mb-1">평균</span>
                              <span className="font-bold text-blue-600">{stat.mean.toFixed(4)}</span>
                            </div>
                            <div className="p-3 bg-white rounded">
                              <span className="text-gray-600 block mb-1">중앙값</span>
                              <span className="font-bold text-blue-600">{stat.median.toFixed(4)}</span>
                            </div>
                            <div className="p-3 bg-white rounded">
                              <span className="text-gray-600 block mb-1">표준편차</span>
                              <span className="font-bold text-blue-600">{stat.std.toFixed(4)}</span>
                            </div>
                            <div className="p-3 bg-white rounded">
                              <span className="text-gray-600 block mb-1">범위</span>
                              <span className="font-bold text-blue-600">{(stat.max - stat.min).toFixed(2)}</span>
                            </div>
                            <div className="p-3 bg-white rounded">
                              <span className="text-gray-600 block mb-1">최소값</span>
                              <span className="font-bold text-green-600">{stat.min.toFixed(4)}</span>
                            </div>
                            <div className="p-3 bg-white rounded">
                              <span className="text-gray-600 block mb-1">Q1 (25%)</span>
                              <span className="font-bold text-green-600">{stat.q1.toFixed(4)}</span>
                            </div>
                            <div className="p-3 bg-white rounded">
                              <span className="text-gray-600 block mb-1">Q3 (75%)</span>
                              <span className="font-bold text-green-600">{stat.q3.toFixed(4)}</span>
                            </div>
                            <div className="p-3 bg-white rounded">
                              <span className="text-gray-600 block mb-1">최대값</span>
                              <span className="font-bold text-green-600">{stat.max.toFixed(4)}</span>
                            </div>
                            <div className="p-3 bg-white rounded">
                              <span className="text-gray-600 block mb-1">왜도</span>
                              <span className="font-bold text-purple-600">{stat.skewness.toFixed(4)}</span>
                            </div>
                            <div className="p-3 bg-white rounded">
                              <span className="text-gray-600 block mb-1">첨도</span>
                              <span className="font-bold text-purple-600">{stat.kurtosis.toFixed(4)}</span>
                            </div>
                            <div className="p-3 bg-white rounded col-span-2">
                              <span className="text-gray-600 block mb-1">IQR</span>
                              <span className="font-bold text-orange-600">{(stat.q3 - stat.q1).toFixed(4)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      통계 분석 데이터가 없습니다.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'correlation' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    상관관계 매트릭스
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {correlationMatrix ? (
                    <div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr>
                              <th className="p-2 text-left font-medium text-gray-600 border">변수</th>
                              {correlationMatrix.columns.map((col, idx) => (
                                <th key={idx} className="p-2 text-center font-medium text-gray-600 text-xs border">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {correlationMatrix.columns.map((row, i) => (
                              <tr key={i}>
                                <td className="p-2 font-medium text-gray-700 text-xs border">{row}</td>
                                {correlationMatrix.matrix[i].map((value, j) => {
                                  const absValue = Math.abs(value)
                                  const bgColor = 
                                    absValue > 0.8 ? 'bg-red-100 text-red-800' :
                                    absValue > 0.6 ? 'bg-orange-100 text-orange-800' :
                                    absValue > 0.4 ? 'bg-yellow-100 text-yellow-800' :
                                    absValue > 0.2 ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-600'
                                  
                                  return (
                                    <td key={j} className={`p-2 text-center text-xs font-medium border ${bgColor}`}>
                                      {value.toFixed(2)}
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <div className="font-medium text-blue-800 mb-2">해석 가이드</div>
                        <div className="text-sm text-blue-600 space-y-1">
                          <div>• |r| &gt; 0.8: 매우 강한 상관관계 (다중공선성 주의)</div>
                          <div>• 0.6 &lt; |r| ≤ 0.8: 강한 상관관계</div>
                          <div>• 0.4 &lt; |r| ≤ 0.6: 중간 상관관계</div>
                          <div>• 0.2 &lt; |r| ≤ 0.4: 약한 상관관계</div>
                          <div>• |r| ≤ 0.2: 매우 약한 상관관계</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      상관관계 분석 데이터가 없습니다.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'distribution' && (
            <div className="space-y-4">
              {distributionAnalysis.length > 0 ? (
                distributionAnalysis.map((dist, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{dist.column}</CardTitle>
                        <Badge variant={
                          dist.type === 'normal' ? 'default' :
                          dist.type === 'uniform' ? 'secondary' :
                          'outline'
                        }>
                          {dist.type === 'normal' ? '정규분포' :
                           dist.type === 'uniform' ? '균등분포' :
                           dist.type === 'skewed' ? '편향분포' : '이봉분포'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {dist.histogram.map((bin, binIdx) => {
                          const maxCount = Math.max(...dist.histogram.map(b => b.count))
                          const width = (bin.count / maxCount) * 100
                          
                          return (
                            <div key={binIdx} className="flex items-center gap-3">
                              <div className="w-32 text-sm text-gray-600 font-mono">{bin.bin}</div>
                              <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all flex items-center justify-end pr-2"
                                  style={{ width: `${width}%` }}
                                >
                                  {width > 15 && (
                                    <span className="text-xs text-white font-medium">{bin.count}</span>
                                  )}
                                </div>
                              </div>
                              {width <= 15 && (
                                <div className="w-12 text-sm text-gray-700 font-medium">{bin.count}</div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8 text-gray-500">
                    분포 분석 데이터가 없습니다.
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'importance' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    특성 중요도 순위
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {featureImportance.length > 0 ? (
                    <div className="space-y-3">
                      {featureImportance.map((item, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                                item.rank === 1 ? 'bg-yellow-500' :
                                item.rank === 2 ? 'bg-gray-400' :
                                item.rank === 3 ? 'bg-orange-600' :
                                'bg-blue-500'
                              }`}>
                                #{item.rank}
                              </div>
                              <div>
                                <div className="font-medium text-gray-800 text-lg">{item.feature}</div>
                                <div className="text-xs text-gray-500">
                                  {item.importance > 70 ? '매우 높은 중요도' :
                                   item.importance > 40 ? '높은 중요도' :
                                   item.importance > 20 ? '중간 중요도' : '낮은 중요도'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                {item.importance.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                item.importance > 70 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                item.importance > 40 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                item.importance > 20 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                'bg-gradient-to-r from-gray-400 to-gray-500'
                              }`}
                              style={{ width: `${item.importance}%` }}
                            />
                          </div>
                        </div>
                      ))}
                      
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <div className="font-medium text-blue-800 mb-2">해석 가이드</div>
                        <div className="text-sm text-blue-600 space-y-1">
                          <div>• 높은 중요도 (&gt;70%): 타겟 변수 예측에 핵심적인 역할</div>
                          <div>• 중간 중요도 (40-70%): 유의미한 영향을 미치는 특성</div>
                          <div>• 낮은 중요도 (&lt;40%): 제한적이거나 간접적인 영향</div>
                          <div className="mt-2 pt-2 border-t border-blue-200">
                            💡 중요도가 낮은 특성은 모델 단순화를 위해 제거를 고려할 수 있습니다.
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      특성 중요도 데이터가 없습니다.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
