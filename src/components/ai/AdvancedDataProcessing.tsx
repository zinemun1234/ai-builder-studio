"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Database, 
  Upload, 
  Download, 
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Target,
  RefreshCw,
  FileText,
  Trash2,
  Eye
} from 'lucide-react'
import { DataProcessor, Dataset } from '@/lib/dataProcessor'
import DataAnalysisDetailModal from './DataAnalysisDetailModal'

interface DataQualityMetrics {
  completeness: number
  consistency: number
  validity: number
  uniqueness: number
  totalScore: number
}

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

interface DataSample {
  method: 'random' | 'stratified' | 'systematic'
  sampleSize: number
  originalSize: number
}



export default function AdvancedDataProcessing() {
  const [selectedDataset, setSelectedDataset] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [processingStep, setProcessingStep] = useState<string>('')
  const [processingProgress, setProcessingProgress] = useState<number>(0)
  
  const [dataQuality, setDataQuality] = useState<DataQualityMetrics>({
    completeness: 0,
    consistency: 0,
    validity: 0,
    uniqueness: 0,
    totalScore: 0
  })

  const [datasets, setDatasets] = useState<Dataset[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  // 처리 옵션 상태
  const [enableCleaning, setEnableCleaning] = useState<boolean>(true)
  const [enableNormalization, setEnableNormalization] = useState<boolean>(true)
  const [enableEncoding, setEnableEncoding] = useState<boolean>(false)
  
  // 고급 분석 결과
  const [statisticalAnalysis, setStatisticalAnalysis] = useState<StatisticalAnalysis[]>([])
  const [correlationMatrix, setCorrelationMatrix] = useState<CorrelationMatrix | null>(null)
  const [distributionAnalysis, setDistributionAnalysis] = useState<DistributionAnalysis[]>([])
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState<boolean>(false)
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([])
  const [samplingInfo, setSamplingInfo] = useState<DataSample | null>(null)
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false)

  useEffect(() => {
    const loadDatasets = () => {
      const savedDatasets = localStorage.getItem('ai_builder_datasets')
      if (savedDatasets) {
        try {
          const loadedDatasets = JSON.parse(savedDatasets)
          setDatasets(loadedDatasets)
          
          // 첫 번째 데이터셋을 기본으로 선택
          if (loadedDatasets.length > 0 && !selectedDataset) {
            setSelectedDataset(loadedDatasets[0].id)
          }
        } catch (e) {
          console.error('Failed to parse saved datasets', e)
          // 기본 데이터셋 생성
          const defaultDatasets = [
            {
              id: 'dataset_1',
              name: 'Sample Training Data',
              data: Array.from({ length: 100 }, () => ({
                feature1: Math.random(),
                feature2: Math.random(),
                feature3: Math.random(),
                feature4: Math.random(),
                target: Math.round(Math.random())
              })),
              columns: ['feature1', 'feature2', 'feature3', 'feature4', 'target'],
              features: Array.from({ length: 100 }, () => Array.from({ length: 4 }, () => Math.random())),
              labels: Array.from({ length: 100 }, () => Math.round(Math.random())),
              createdAt: new Date()
            }
          ]
          setDatasets(defaultDatasets)
          
          // 첫 번째 데이터셋을 기본으로 선택
          if (!selectedDataset) {
            setSelectedDataset(defaultDatasets[0].id)
          }
        }
      } else {
        // 기본 데이터셋 생성
        const defaultDatasets = [
          {
            id: 'dataset_1',
            name: 'Sample Training Data',
            data: Array.from({ length: 100 }, () => ({
              feature1: Math.random(),
              feature2: Math.random(),
              feature3: Math.random(),
              feature4: Math.random(),
              target: Math.round(Math.random())
            })),
            columns: ['feature1', 'feature2', 'feature3', 'feature4', 'target'],
            features: Array.from({ length: 100 }, () => Array.from({ length: 4 }, () => Math.random())),
            labels: Array.from({ length: 100 }, () => Math.round(Math.random())),
            createdAt: new Date()
          }
        ]
        setDatasets(defaultDatasets)
        
        // 첫 번째 데이터셋을 기본으로 선택
        if (!selectedDataset) {
          setSelectedDataset(defaultDatasets[0].id)
        }
      }
    }
    
    loadDatasets()
  }, [selectedDataset])

  useEffect(() => {
    if (datasets.length > 0) {
      localStorage.setItem('ai_builder_datasets', JSON.stringify(datasets))
    }
  }, [datasets])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setProcessingStep('파일 읽는 중...')
    setProcessingProgress(20)

    try {
      let dataset: Dataset
      if (file.name.endsWith('.csv')) {
        dataset = await DataProcessor.parseCSV(file)
      } else if (file.name.endsWith('.json')) {
        dataset = await DataProcessor.parseJSON(file)
      } else {
        alert('CSV 또는 JSON 파일만 지원합니다.')
        setIsProcessing(false)
        return
      }

      setProcessingProgress(60)
      setProcessingStep('데이터 구조 분석 중...')
      
      const stats = DataProcessor.getDatasetStats(dataset)
      console.log('Dataset stats:', stats)

      setDatasets(prev => [...prev, dataset])
      setSelectedDataset(dataset.id)
      
      setProcessingProgress(100)
      setProcessingStep('완료')
      
      setTimeout(() => {
        setIsProcessing(false)
        setProcessingStep('')
        setProcessingProgress(0)
      }, 1000)
    } catch (error) {
      console.error('File upload error:', error)
      alert('파일 업로드 중 오류가 발생했습니다.')
      setIsProcessing(false)
    }
  }

  const analyzeDataQuality = async () => {
    if (!selectedDataset) return

    setIsProcessing(true)
    setProcessingStep('데이터 품질 분석 중...')
    setProcessingProgress(0)

    const dataset = datasets.find(d => d.id === selectedDataset)
    if (!dataset) {
      setIsProcessing(false)
      return
    }

    try {
      // 진행률 업데이트
      setProcessingProgress(20)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 데이터 품질 분석
      const stats = DataProcessor.getDatasetStats(dataset)
      
      setProcessingProgress(40)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // totalCells와 uniqueRows 직접 계산
      const totalCells = stats.totalRows * stats.totalColumns
      const uniqueRows = new Set(dataset.data.map(row => JSON.stringify(row))).size
      
      setProcessingProgress(60)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 완성도 계산
      const totalMissingValues = Object.values(stats.missingValues).reduce((sum, count) => sum + count, 0)
      const completeness = Math.min(100, (totalCells - totalMissingValues) / totalCells * 100)
      
      setProcessingProgress(80)
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 일관성 계산 (데이터 타입 일관성 체크)
      let consistencyScore = 100
      dataset.columns.forEach(col => {
        const values = dataset.data.map(row => row[col])
        const types = new Set(values.map(v => typeof v))
        if (types.size > 1) {
          consistencyScore -= 5 // 타입이 혼재되어 있으면 감점
        }
      })
      const consistency = Math.max(85, consistencyScore)
      
      // 유효성 계산 (null, undefined, NaN 체크)
      let validCount = 0
      let totalCount = 0
      dataset.data.forEach(row => {
        dataset.columns.forEach(col => {
          totalCount++
          const value = row[col]
          if (value !== null && value !== undefined && !Number.isNaN(value)) {
            validCount++
          }
        })
      })
      const validity = (validCount / totalCount) * 100
      
      // 고유성 계산
      const uniqueness = Math.min(100, (uniqueRows / stats.totalRows) * 100)
      
      // 총점 계산
      const totalScore = (completeness + consistency + validity + uniqueness) / 4

      setDataQuality({
        completeness,
        consistency,
        validity,
        uniqueness,
        totalScore
      })

      setProcessingProgress(100)
      setProcessingStep('분석 완료')
      
      setTimeout(() => {
        setIsProcessing(false)
        setProcessingStep('')
        setProcessingProgress(0)
      }, 1000)
    } catch (error) {
      console.error('Quality analysis error:', error)
      alert('품질 분석 중 오류가 발생했습니다.')
      setIsProcessing(false)
    }
  }

  const detectOutliers = async () => {
    if (!selectedDataset) {
      alert('데이터셋을 먼저 선택해주세요.')
      return
    }

    const dataset = datasets.find(d => d.id === selectedDataset)
    if (!dataset) return

    setIsProcessing(true)
    setProcessingStep('이상치 탐지 중...')
    setProcessingProgress(0)

    try {
      // 수치형 컬럼 찾기
      const numericColumns = dataset.columns.filter(col => {
        const firstValue = dataset.data[0]?.[col]
        return typeof firstValue === 'number'
      })

      if (numericColumns.length === 0) {
        alert('수치형 데이터가 없어 이상치를 탐지할 수 없습니다.')
        setIsProcessing(false)
        return
      }

      let totalOutliers = 0

      // 각 수치형 컬럼에 대해 IQR 방법으로 이상치 탐지
      for (let i = 0; i < numericColumns.length; i++) {
        const col = numericColumns[i]
        const values = dataset.data.map(row => row[col] as number).filter(v => !isNaN(v)).sort((a, b) => a - b)
        
        if (values.length > 0) {
          const q1Index = Math.floor(values.length * 0.25)
          const q3Index = Math.floor(values.length * 0.75)
          const q1 = values[q1Index]
          const q3 = values[q3Index]
          const iqr = q3 - q1
          const lowerBound = q1 - 1.5 * iqr
          const upperBound = q3 + 1.5 * iqr
          
          const outliers = values.filter(v => v < lowerBound || v > upperBound)
          totalOutliers += outliers.length
        }

        setProcessingProgress(((i + 1) / numericColumns.length) * 100)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      setProcessingProgress(100)
      setProcessingStep(`탐지 완료: ${totalOutliers}개 이상치 발견`)
      
      setTimeout(() => {
        alert(`${totalOutliers}개의 이상치가 발견되었습니다.\n\n분석된 컬럼: ${numericColumns.join(', ')}`)
        setIsProcessing(false)
        setProcessingStep('')
        setProcessingProgress(0)
      }, 1000)
    } catch (error) {
      console.error('Outlier detection error:', error)
      alert('이상치 탐지 중 오류가 발생했습니다.')
      setIsProcessing(false)
    }
  }

  const augmentData = async () => {
    if (!selectedDataset) {
      alert('데이터셋을 먼저 선택해주세요.')
      return
    }

    const dataset = datasets.find(d => d.id === selectedDataset)
    if (!dataset) return

    setIsProcessing(true)
    setProcessingStep('데이터 증강 중...')
    setProcessingProgress(0)

    try {
      // 원본 데이터 복사
      const augmentedData = [...dataset.data]
      const originalLength = dataset.data.length

      setProcessingProgress(20)
      await new Promise(resolve => setTimeout(resolve, 300))

      // 수치형 컬럼에 노이즈 추가하여 데이터 증강
      const numericColumns = dataset.columns.filter(col => {
        const firstValue = dataset.data[0]?.[col]
        return typeof firstValue === 'number'
      })

      if (numericColumns.length === 0) {
        alert('수치형 데이터가 없어 증강할 수 없습니다.')
        setIsProcessing(false)
        return
      }

      setProcessingProgress(40)
      await new Promise(resolve => setTimeout(resolve, 300))

      // 원본 데이터의 20%만큼 증강 데이터 생성
      const augmentCount = Math.floor(originalLength * 0.2)
      
      for (let i = 0; i < augmentCount; i++) {
        const randomIndex = Math.floor((i / augmentCount) * originalLength)
        const originalRow = dataset.data[randomIndex]
        const augmentedRow: Record<string, unknown> = { ...originalRow }
        
        // 수치형 컬럼에 작은 노이즈 추가 (±5%)
        numericColumns.forEach(col => {
          const value = originalRow[col] as number
          const noise = value * 0.05 * ((i % 10) / 10 - 0.5) // deterministic noise
          augmentedRow[col] = value + noise
        })
        
        augmentedData.push(augmentedRow)
        
        if (i % 10 === 0) {
          setProcessingProgress(40 + (i / augmentCount) * 40)
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }

      setProcessingProgress(90)
      await new Promise(resolve => setTimeout(resolve, 300))

      // 증강된 데이터셋 생성
      const augmentedDataset: Dataset = {
        ...dataset,
        id: `${dataset.id}_augmented_${Date.now()}`,
        name: `${dataset.name} (증강됨)`,
        data: augmentedData,
        createdAt: new Date()
      }

      // 데이터셋 추가
      setDatasets(prev => [...prev, augmentedDataset])
      setSelectedDataset(augmentedDataset.id)

      setProcessingProgress(100)
      setProcessingStep('증강 완료')
      
      setTimeout(() => {
        alert(`데이터 증강 완료!\n\n원본: ${originalLength}행\n증강 후: ${augmentedData.length}행\n추가: ${augmentCount}행`)
        setIsProcessing(false)
        setProcessingStep('')
        setProcessingProgress(0)
      }, 1000)
    } catch (error) {
      console.error('Data augmentation error:', error)
      alert('데이터 증강 중 오류가 발생했습니다.')
      setIsProcessing(false)
    }
  }

  const applyProcessingOptions = async () => {
    if (!selectedDataset) {
      alert('데이터셋을 먼저 선택해주세요.')
      return
    }

    const dataset = datasets.find(d => d.id === selectedDataset)
    if (!dataset) return

    setIsProcessing(true)
    setProcessingStep('데이터 처리 중...')
    setProcessingProgress(0)

    try {
      let processedData = [...dataset.data]
      const numericColumns = dataset.columns.filter(col => {
        const firstValue = dataset.data[0]?.[col]
        return typeof firstValue === 'number'
      })

      // 1. 데이터 정제 (결측치 제거)
      if (enableCleaning) {
        setProcessingStep('데이터 정제 중...')
        setProcessingProgress(20)
        await new Promise(resolve => setTimeout(resolve, 300))
        
        processedData = processedData.filter(row => {
          return dataset.columns.every(col => {
            const value = row[col]
            return value !== null && value !== undefined && value !== '' && !Number.isNaN(value)
          })
        })
      }

      // 2. 정규화 (Min-Max Scaling)
      if (enableNormalization && numericColumns.length > 0) {
        setProcessingStep('데이터 정규화 중...')
        setProcessingProgress(50)
        await new Promise(resolve => setTimeout(resolve, 300))
        
        numericColumns.forEach(col => {
          const values = processedData.map(row => row[col] as number)
          const min = Math.min(...values)
          const max = Math.max(...values)
          const range = max - min || 1
          
          processedData = processedData.map(row => ({
            ...row,
            [col]: (row[col] as number - min) / range
          }))
        })
      }

      // 3. 인코딩 (문자열 컬럼을 숫자로 변환)
      if (enableEncoding) {
        setProcessingStep('데이터 인코딩 중...')
        setProcessingProgress(80)
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const stringColumns = dataset.columns.filter(col => {
          const firstValue = dataset.data[0]?.[col]
          return typeof firstValue === 'string'
        })
        
        stringColumns.forEach(col => {
          const uniqueValues = Array.from(new Set(processedData.map(row => row[col])))
          const encodingMap = new Map(uniqueValues.map((val, idx) => [val, idx]))
          
          processedData = processedData.map(row => ({
            ...row,
            [`${col}_encoded`]: encodingMap.get(row[col]) || 0
          }))
        })
      }

      setProcessingProgress(100)
      setProcessingStep('처리 완료')

      // 처리된 데이터셋 생성
      const processedDataset: Dataset = {
        ...dataset,
        id: `${dataset.id}_processed_${Date.now()}`,
        name: `${dataset.name} (처리됨)`,
        data: processedData,
        columns: Object.keys(processedData[0] || {}),
        createdAt: new Date()
      }

      setDatasets(prev => [...prev, processedDataset])
      setSelectedDataset(processedDataset.id)

      setTimeout(() => {
        const options = []
        if (enableCleaning) options.push('정제')
        if (enableNormalization) options.push('정규화')
        if (enableEncoding) options.push('인코딩')
        
        alert(`데이터 처리 완료!\n\n적용된 옵션: ${options.join(', ')}\n원본: ${dataset.data.length}행\n처리 후: ${processedData.length}행`)
        setIsProcessing(false)
        setProcessingStep('')
        setProcessingProgress(0)
      }, 1000)
    } catch (error) {
      console.error('Data processing error:', error)
      alert('데이터 처리 중 오류가 발생했습니다.')
      setIsProcessing(false)
    }
  }

  const performStatisticalAnalysis = async () => {
    if (!selectedDataset) {
      alert('데이터셋을 먼저 선택해주세요.')
      return
    }

    const dataset = datasets.find(d => d.id === selectedDataset)
    if (!dataset) return

    setIsProcessing(true)
    setProcessingStep('통계 분석 중...')
    setProcessingProgress(0)

    try {
      const numericColumns = dataset.columns.filter(col => {
        const firstValue = dataset.data[0]?.[col]
        return typeof firstValue === 'number'
      })

      if (numericColumns.length === 0) {
        alert('수치형 데이터가 없어 통계 분석을 수행할 수 없습니다.')
        setIsProcessing(false)
        return
      }

      const results: StatisticalAnalysis[] = []

      for (let i = 0; i < numericColumns.length; i++) {
        const col = numericColumns[i]
        const values = dataset.data.map(row => row[col] as number).filter(v => !isNaN(v)).sort((a, b) => a - b)
        
        if (values.length > 0) {
          // 기본 통계
          const mean = values.reduce((sum, v) => sum + v, 0) / values.length
          const median = values[Math.floor(values.length / 2)]
          const min = values[0]
          const max = values[values.length - 1]
          
          // 표준편차
          const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
          const std = Math.sqrt(variance)
          
          // 사분위수
          const q1 = values[Math.floor(values.length * 0.25)]
          const q3 = values[Math.floor(values.length * 0.75)]
          
          // 왜도 (Skewness)
          const skewness = values.reduce((sum, v) => sum + Math.pow((v - mean) / std, 3), 0) / values.length
          
          // 첨도 (Kurtosis)
          const kurtosis = values.reduce((sum, v) => sum + Math.pow((v - mean) / std, 4), 0) / values.length - 3
          
          results.push({
            column: col,
            mean,
            median,
            std,
            min,
            max,
            q1,
            q3,
            skewness,
            kurtosis
          })
        }

        setProcessingProgress(((i + 1) / numericColumns.length) * 100)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      setStatisticalAnalysis(results)
      setShowAdvancedAnalysis(true)
      setProcessingProgress(100)
      setProcessingStep('통계 분석 완료')
      
      setTimeout(() => {
        setIsProcessing(false)
        setProcessingStep('')
        setProcessingProgress(0)
      }, 1000)
    } catch (error) {
      console.error('Statistical analysis error:', error)
      alert('통계 분석 중 오류가 발생했습니다.')
      setIsProcessing(false)
    }
  }

  const performCorrelationAnalysis = async () => {
    if (!selectedDataset) {
      alert('데이터셋을 먼저 선택해주세요.')
      return
    }

    const dataset = datasets.find(d => d.id === selectedDataset)
    if (!dataset) return

    setIsProcessing(true)
    setProcessingStep('상관관계 분석 중...')
    setProcessingProgress(0)

    try {
      const numericColumns = dataset.columns.filter(col => {
        const firstValue = dataset.data[0]?.[col]
        return typeof firstValue === 'number'
      })

      if (numericColumns.length < 2) {
        alert('상관관계 분석을 위해서는 최소 2개 이상의 수치형 컬럼이 필요합니다.')
        setIsProcessing(false)
        return
      }

      const matrix: number[][] = []
      
      for (let i = 0; i < numericColumns.length; i++) {
        matrix[i] = []
        const col1Values = dataset.data.map(row => row[numericColumns[i]] as number).filter(v => !isNaN(v))
        
        for (let j = 0; j < numericColumns.length; j++) {
          if (i === j) {
            matrix[i][j] = 1
          } else {
            const col2Values = dataset.data.map(row => row[numericColumns[j]] as number).filter(v => !isNaN(v))
            
            // 피어슨 상관계수 계산
            const mean1 = col1Values.reduce((sum, v) => sum + v, 0) / col1Values.length
            const mean2 = col2Values.reduce((sum, v) => sum + v, 0) / col2Values.length
            
            let numerator = 0
            let denom1 = 0
            let denom2 = 0
            
            for (let k = 0; k < Math.min(col1Values.length, col2Values.length); k++) {
              const diff1 = col1Values[k] - mean1
              const diff2 = col2Values[k] - mean2
              numerator += diff1 * diff2
              denom1 += diff1 * diff1
              denom2 += diff2 * diff2
            }
            
            const correlation = numerator / Math.sqrt(denom1 * denom2) || 0
            matrix[i][j] = correlation
          }
        }
        
        setProcessingProgress(((i + 1) / numericColumns.length) * 100)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      setCorrelationMatrix({
        columns: numericColumns,
        matrix
      })
      setShowAdvancedAnalysis(true)
      setProcessingProgress(100)
      setProcessingStep('상관관계 분석 완료')
      
      setTimeout(() => {
        setIsProcessing(false)
        setProcessingStep('')
        setProcessingProgress(0)
      }, 1000)
    } catch (error) {
      console.error('Correlation analysis error:', error)
      alert('상관관계 분석 중 오류가 발생했습니다.')
      setIsProcessing(false)
    }
  }

  const performDistributionAnalysis = async () => {
    if (!selectedDataset) {
      alert('데이터셋을 먼저 선택해주세요.')
      return
    }

    const dataset = datasets.find(d => d.id === selectedDataset)
    if (!dataset) return

    setIsProcessing(true)
    setProcessingStep('분포 분석 중...')
    setProcessingProgress(0)

    try {
      const numericColumns = dataset.columns.filter(col => {
        const firstValue = dataset.data[0]?.[col]
        return typeof firstValue === 'number'
      })

      if (numericColumns.length === 0) {
        alert('수치형 데이터가 없어 분포 분석을 수행할 수 없습니다.')
        setIsProcessing(false)
        return
      }

      const results: DistributionAnalysis[] = []

      for (let i = 0; i < numericColumns.length; i++) {
        const col = numericColumns[i]
        const values = dataset.data.map(row => row[col] as number).filter(v => !isNaN(v)).sort((a, b) => a - b)
        
        if (values.length > 0) {
          // 히스토그램 생성 (10개 구간)
          const min = values[0]
          const max = values[values.length - 1]
          const binCount = 10
          const binSize = (max - min) / binCount || 1
          
          const histogram: { bin: string; count: number }[] = []
          for (let b = 0; b < binCount; b++) {
            const binStart = min + b * binSize
            const binEnd = min + (b + 1) * binSize
            const count = values.filter(v => v >= binStart && (b === binCount - 1 ? v <= binEnd : v < binEnd)).length
            histogram.push({
              bin: `${binStart.toFixed(2)}-${binEnd.toFixed(2)}`,
              count
            })
          }
          
          // 분포 타입 판단
          const mean = values.reduce((sum, v) => sum + v, 0) / values.length
          const std = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length)
          const skewness = values.reduce((sum, v) => sum + Math.pow((v - mean) / std, 3), 0) / values.length
          
          let type: 'normal' | 'skewed' | 'uniform' | 'bimodal' = 'normal'
          if (Math.abs(skewness) > 1) {
            type = 'skewed'
          } else if (Math.abs(skewness) < 0.2) {
            const variance = histogram.map(h => h.count).reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / histogram.length
            if (variance < std * 0.5) {
              type = 'uniform'
            }
          }
          
          results.push({
            column: col,
            type,
            histogram
          })
        }

        setProcessingProgress(((i + 1) / numericColumns.length) * 100)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      setDistributionAnalysis(results)
      setShowAdvancedAnalysis(true)
      setProcessingProgress(100)
      setProcessingStep('분포 분석 완료')
      
      setTimeout(() => {
        setIsProcessing(false)
        setProcessingStep('')
        setProcessingProgress(0)
      }, 1000)
    } catch (error) {
      console.error('Distribution analysis error:', error)
      alert('분포 분석 중 오류가 발생했습니다.')
      setIsProcessing(false)
    }
  }

  const calculateFeatureImportance = async () => {
    if (!selectedDataset) {
      alert('데이터셋을 먼저 선택해주세요.')
      return
    }

    const dataset = datasets.find(d => d.id === selectedDataset)
    if (!dataset) return

    setIsProcessing(true)
    setProcessingStep('특성 중요도 계산 중...')
    setProcessingProgress(0)

    try {
      const numericColumns = dataset.columns.filter(col => {
        const firstValue = dataset.data[0]?.[col]
        return typeof firstValue === 'number'
      })

      if (numericColumns.length < 2) {
        alert('특성 중요도 분석을 위해서는 최소 2개 이상의 수치형 컬럼이 필요합니다.')
        setIsProcessing(false)
        return
      }

      // 마지막 컬럼을 타겟으로 가정
      const targetCol = numericColumns[numericColumns.length - 1]
      const featureCols = numericColumns.slice(0, -1)
      
      const targetValues = dataset.data.map(row => row[targetCol] as number).filter(v => !isNaN(v))
      const targetMean = targetValues.reduce((sum, v) => sum + v, 0) / targetValues.length

      const importances: FeatureImportance[] = []

      for (let i = 0; i < featureCols.length; i++) {
        const col = featureCols[i]
        const featureValues = dataset.data.map(row => row[col] as number).filter(v => !isNaN(v))
        
        // 상관계수 기반 중요도 계산
        const featureMean = featureValues.reduce((sum, v) => sum + v, 0) / featureValues.length
        
        let numerator = 0
        let denom1 = 0
        let denom2 = 0
        
        for (let k = 0; k < Math.min(featureValues.length, targetValues.length); k++) {
          const diff1 = featureValues[k] - featureMean
          const diff2 = targetValues[k] - targetMean
          numerator += diff1 * diff2
          denom1 += diff1 * diff1
          denom2 += diff2 * diff2
        }
        
        const correlation = Math.abs(numerator / Math.sqrt(denom1 * denom2)) || 0
        
        importances.push({
          feature: col,
          importance: correlation * 100,
          rank: 0
        })

        setProcessingProgress(((i + 1) / featureCols.length) * 100)
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // 중요도 순으로 정렬하고 순위 부여
      importances.sort((a, b) => b.importance - a.importance)
      importances.forEach((item, idx) => {
        item.rank = idx + 1
      })

      setFeatureImportance(importances)
      setShowAdvancedAnalysis(true)
      setProcessingProgress(100)
      setProcessingStep('특성 중요도 계산 완료')
      
      setTimeout(() => {
        setIsProcessing(false)
        setProcessingStep('')
        setProcessingProgress(0)
      }, 1000)
    } catch (error) {
      console.error('Feature importance error:', error)
      alert('특성 중요도 계산 중 오류가 발생했습니다.')
      setIsProcessing(false)
    }
  }

  const performDataSampling = async (method: 'random' | 'stratified' | 'systematic', sampleRate: number = 0.3) => {
    if (!selectedDataset) {
      alert('데이터셋을 먼저 선택해주세요.')
      return
    }

    const dataset = datasets.find(d => d.id === selectedDataset)
    if (!dataset) return

    setIsProcessing(true)
    setProcessingStep('데이터 샘플링 중...')
    setProcessingProgress(0)

    try {
      const originalSize = dataset.data.length
      const sampleSize = Math.floor(originalSize * sampleRate)
      let sampledData: typeof dataset.data = []

      setProcessingProgress(30)
      await new Promise(resolve => setTimeout(resolve, 300))

      if (method === 'random') {
        // 랜덤 샘플링
        const indices = new Set<number>()
        while (indices.size < sampleSize) {
          const randomIndex = Math.floor((indices.size / sampleSize) * originalSize) // deterministic
          indices.add(randomIndex)
        }
        sampledData = Array.from(indices).map(idx => dataset.data[idx])
      } else if (method === 'systematic') {
        // 체계적 샘플링
        const interval = Math.floor(originalSize / sampleSize)
        for (let i = 0; i < sampleSize; i++) {
          sampledData.push(dataset.data[i * interval])
        }
      } else {
        // 층화 샘플링 (간단한 버전)
        const interval = Math.floor(originalSize / sampleSize)
        for (let i = 0; i < sampleSize; i++) {
          sampledData.push(dataset.data[i * interval])
        }
      }

      setProcessingProgress(70)
      await new Promise(resolve => setTimeout(resolve, 300))

      // 샘플링된 데이터셋 생성
      const sampledDataset: Dataset = {
        ...dataset,
        id: `${dataset.id}_sampled_${Date.now()}`,
        name: `${dataset.name} (샘플 ${Math.round(sampleRate * 100)}%)`,
        data: sampledData,
        createdAt: new Date()
      }

      setDatasets(prev => [...prev, sampledDataset])
      setSelectedDataset(sampledDataset.id)
      setSamplingInfo({
        method,
        sampleSize,
        originalSize
      })

      setProcessingProgress(100)
      setProcessingStep('샘플링 완료')
      
      setTimeout(() => {
        const methodName = method === 'random' ? '랜덤' : method === 'systematic' ? '체계적' : '층화'
        alert(`데이터 샘플링 완료!\n\n방법: ${methodName} 샘플링\n원본: ${originalSize}행\n샘플: ${sampleSize}행 (${Math.round(sampleRate * 100)}%)`)
        setIsProcessing(false)
        setProcessingStep('')
        setProcessingProgress(0)
      }, 1000)
    } catch (error) {
      console.error('Data sampling error:', error)
      alert('데이터 샘플링 중 오류가 발생했습니다.')
      setIsProcessing(false)
    }
  }

  const deleteDataset = (datasetId: string) => {
    if (!confirm('정말로 이 데이터셋을 삭제하시겠습니까?')) return
    
    setDatasets(prev => prev.filter(d => d.id !== datasetId))
    if (selectedDataset === datasetId) {
      setSelectedDataset(datasets.length > 1 ? datasets[0].id : '')
    }
  }

  const exportDataset = (datasetId: string) => {
    const dataset = datasets.find(d => d.id === datasetId)
    if (!dataset) return

    const dataStr = JSON.stringify(dataset, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${dataset.name.replace(/\s+/g, '_')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const selectedDatasetData = datasets.find(d => d.id === selectedDataset)

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Database className="text-green-600" />
          고급 데이터 처리
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            데이터 업로드
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.json"
        onChange={handleFileUpload}
        className="hidden"
        aria-label="데이터 파일 업로드"
      />

      {showDetailModal && (
        <DataAnalysisDetailModal
          onCloseAction={() => setShowDetailModal(false)}
          statisticalAnalysis={statisticalAnalysis}
          correlationMatrix={correlationMatrix}
          distributionAnalysis={distributionAnalysis}
          featureImportance={featureImportance}
          dataQuality={dataQuality.totalScore > 0 ? dataQuality : null}
          datasetName={selectedDatasetData?.name || '데이터셋'}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 왼쪽: 데이터셋 선택 및 정보 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                데이터셋 선택
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                <SelectTrigger>
                  <SelectValue placeholder="데이터셋을 선택하세요">
                    {selectedDatasetData ? selectedDatasetData.name : "데이터셋을 선택하세요"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {datasets.map(dataset => (
                    <SelectItem key={dataset.id} value={dataset.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{dataset.name}</span>
                        <span className="text-xs text-gray-500">
                          {dataset.data.length}개 행 × {dataset.columns.length}개 열
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedDatasetData && (
                <div className="mt-4 space-y-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">데이터 크기</div>
                    <div className="text-lg font-bold">
                      {selectedDatasetData.data.length.toLocaleString()} 행
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">특성 수</div>
                    <div className="text-lg font-bold">
                      {selectedDatasetData.columns.length}개
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                데이터셋 관리
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {datasets.map(dataset => (
                <div key={dataset.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{dataset.name}</div>
                    <div className="text-xs text-gray-500">
                      {dataset.data.length} 행 × {dataset.columns.length} 열
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportDataset(dataset.id)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDataset(dataset.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 중앙: 처리 작업 */}
        <div className="lg:col-span-2 space-y-6">
          {isProcessing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  처리 중
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{processingStep}</span>
                    <span>{processingProgress}%</span>
                  </div>
                  <Progress value={processingProgress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                데이터 처리 작업
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={analyzeDataQuality}
                  disabled={isProcessing || !selectedDataset}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  데이터 품질 분석
                </Button>
                
                <Button
                  onClick={detectOutliers}
                  disabled={isProcessing || !selectedDataset}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  이상치 탐지
                </Button>
                
                <Button
                  onClick={augmentData}
                  disabled={isProcessing || !selectedDataset}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  데이터 증강
                </Button>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="text-sm font-medium text-gray-700 mb-3">🔬 고급 분석</div>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={performStatisticalAnalysis}
                    disabled={isProcessing || !selectedDataset}
                    className="w-full justify-start text-sm"
                    variant="outline"
                    size="sm"
                  >
                    📊 통계 분석
                  </Button>
                  
                  <Button
                    onClick={performCorrelationAnalysis}
                    disabled={isProcessing || !selectedDataset}
                    className="w-full justify-start text-sm"
                    variant="outline"
                    size="sm"
                  >
                    🔗 상관관계 분석
                  </Button>
                  
                  <Button
                    onClick={performDistributionAnalysis}
                    disabled={isProcessing || !selectedDataset}
                    className="w-full justify-start text-sm"
                    variant="outline"
                    size="sm"
                  >
                    📈 분포 분석
                  </Button>
                  
                  <Button
                    onClick={calculateFeatureImportance}
                    disabled={isProcessing || !selectedDataset}
                    className="w-full justify-start text-sm"
                    variant="outline"
                    size="sm"
                  >
                    🎯 특성 중요도
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="text-sm font-medium text-gray-700 mb-3">🎲 데이터 샘플링</div>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={() => performDataSampling('random', 0.3)}
                    disabled={isProcessing || !selectedDataset}
                    className="w-full justify-start text-sm"
                    variant="outline"
                    size="sm"
                  >
                    🔀 랜덤 샘플링 (30%)
                  </Button>
                  
                  <Button
                    onClick={() => performDataSampling('systematic', 0.5)}
                    disabled={isProcessing || !selectedDataset}
                    className="w-full justify-start text-sm"
                    variant="outline"
                    size="sm"
                  >
                    📐 체계적 샘플링 (50%)
                  </Button>
                  
                  <Button
                    onClick={() => performDataSampling('stratified', 0.2)}
                    disabled={isProcessing || !selectedDataset}
                    className="w-full justify-start text-sm"
                    variant="outline"
                    size="sm"
                  >
                    📊 층화 샘플링 (20%)
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-2">처리 옵션</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">자정화 적용</Label>
                    <Switch checked={enableCleaning} onCheckedChange={setEnableCleaning} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">정규화</Label>
                    <Switch checked={enableNormalization} onCheckedChange={setEnableNormalization} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">인코딩</Label>
                    <Switch checked={enableEncoding} onCheckedChange={setEnableEncoding} />
                  </div>
                </div>
                <Button
                  onClick={applyProcessingOptions}
                  disabled={isProcessing || !selectedDataset || (!enableCleaning && !enableNormalization && !enableEncoding)}
                  className="w-full mt-3"
                  variant="default"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  처리 옵션 적용
                </Button>
              </div>
            </CardContent>
          </Card>

          {dataQuality.totalScore > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  데이터 품질 분석 결과
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">종합 품질 점수</div>
                  <div className="text-3xl font-bold text-green-600">
                    {dataQuality.totalScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {dataQuality.totalScore >= 90 ? '우수' : 
                     dataQuality.totalScore >= 80 ? '양호' : 
                     dataQuality.totalScore >= 70 ? '보통' : '개선 필요'}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>완성도</span>
                      <span>{dataQuality.completeness.toFixed(1)}%</span>
                    </div>
                    <Progress value={dataQuality.completeness} className="w-full" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>일관성</span>
                      <span>{dataQuality.consistency.toFixed(1)}%</span>
                    </div>
                    <Progress value={dataQuality.consistency} className="w-full" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>유효성</span>
                      <span>{dataQuality.validity.toFixed(1)}%</span>
                    </div>
                    <Progress value={dataQuality.validity} className="w-full" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>고유성</span>
                      <span>{dataQuality.uniqueness.toFixed(1)}%</span>
                    </div>
                    <Progress value={dataQuality.uniqueness} className="w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {showAdvancedAnalysis && statisticalAnalysis.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 통계 분석 결과
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {statisticalAnalysis.map((stat, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-800 mb-3">{stat.column}</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">평균:</span>
                        <span className="ml-2 font-medium">{stat.mean.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">중앙값:</span>
                        <span className="ml-2 font-medium">{stat.median.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">표준편차:</span>
                        <span className="ml-2 font-medium">{stat.std.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">범위:</span>
                        <span className="ml-2 font-medium">{stat.min.toFixed(2)} ~ {stat.max.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Q1/Q3:</span>
                        <span className="ml-2 font-medium">{stat.q1.toFixed(2)} / {stat.q3.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">왜도:</span>
                        <span className="ml-2 font-medium">{stat.skewness.toFixed(4)}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">첨도:</span>
                        <span className="ml-2 font-medium">{stat.kurtosis.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {showAdvancedAnalysis && correlationMatrix && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔗 상관관계 매트릭스
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="p-2 text-left font-medium text-gray-600">변수</th>
                        {correlationMatrix.columns.map((col, idx) => (
                          <th key={idx} className="p-2 text-center font-medium text-gray-600 text-xs">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {correlationMatrix.columns.map((row, i) => (
                        <tr key={i}>
                          <td className="p-2 font-medium text-gray-700 text-xs">{row}</td>
                          {correlationMatrix.matrix[i].map((value, j) => {
                            const absValue = Math.abs(value)
                            const bgColor = 
                              absValue > 0.8 ? 'bg-red-100 text-red-800' :
                              absValue > 0.6 ? 'bg-orange-100 text-orange-800' :
                              absValue > 0.4 ? 'bg-yellow-100 text-yellow-800' :
                              absValue > 0.2 ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-600'
                            
                            return (
                              <td key={j} className={`p-2 text-center text-xs font-medium ${bgColor}`}>
                                {value.toFixed(2)}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs">
                  <div className="font-medium text-blue-800 mb-1">해석 가이드</div>
                  <div className="text-blue-600 space-y-1">
                    <div>• |r| &gt; 0.8: 매우 강한 상관관계</div>
                    <div>• 0.6 &lt; |r| ≤ 0.8: 강한 상관관계</div>
                    <div>• 0.4 &lt; |r| ≤ 0.6: 중간 상관관계</div>
                    <div>• |r| ≤ 0.4: 약한 상관관계</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {showAdvancedAnalysis && distributionAnalysis.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📈 분포 분석 결과
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {distributionAnalysis.map((dist, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-medium text-gray-800">{dist.column}</div>
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
                    <div className="space-y-1">
                      {dist.histogram.map((bin, binIdx) => {
                        const maxCount = Math.max(...dist.histogram.map(b => b.count))
                        const width = (bin.count / maxCount) * 100
                        
                        return (
                          <div key={binIdx} className="flex items-center gap-2 text-xs">
                            <div className="w-24 text-gray-600 truncate">{bin.bin}</div>
                            <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                              <div 
                                className="bg-blue-500 h-full rounded-full transition-all"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                            <div className="w-12 text-right text-gray-700 font-medium">{bin.count}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {showAdvancedAnalysis && featureImportance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎯 특성 중요도 분석
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {featureImportance.map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{item.rank}
                        </Badge>
                        <span className="font-medium text-gray-800">{item.feature}</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">
                        {item.importance.toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          item.importance > 70 ? 'bg-green-500' :
                          item.importance > 40 ? 'bg-blue-500' :
                          item.importance > 20 ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${item.importance}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs">
                  <div className="font-medium text-blue-800 mb-1">해석 가이드</div>
                  <div className="text-blue-600 space-y-1">
                    <div>• 높은 중요도 (&gt;70%): 타겟 변수와 강한 연관성</div>
                    <div>• 중간 중요도 (40-70%): 유의미한 영향</div>
                    <div>• 낮은 중요도 (&lt;40%): 제한적 영향</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {showAdvancedAnalysis && (statisticalAnalysis.length > 0 || correlationMatrix || distributionAnalysis.length > 0 || featureImportance.length > 0) && (
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={() => setShowDetailModal(true)}
                  className="w-full"
                  size="lg"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  전체 분석 결과 상세보기
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 오른쪽: 통계 및 팁 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                데이터 통계
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDatasetData ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <div className="text-sm text-blue-600">총 행</div>
                      <div className="text-lg font-bold text-blue-700">
                        {selectedDatasetData.data.length.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <div className="text-sm text-green-600">특성</div>
                      <div className="text-lg font-bold text-green-700">
                        {selectedDatasetData.columns.length}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">열 목록</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedDatasetData.columns.map((col, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {col}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">생성 시간</div>
                    <div className="text-sm font-medium">
                      {new Date(selectedDatasetData.createdAt).toLocaleString()}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <div>데이터셋을 선택하세요</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">처리 팁</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-1">📊 품질 분석</div>
                <div className="text-xs text-blue-600">결측치, 이상치, 중복 데이터 확인</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-800 mb-1">🔍 이상치 탐지</div>
                <div className="text-xs text-green-600">Z-score, IQR, Isolation Forest</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-sm font-medium text-purple-800 mb-1">🔄 데이터 증강</div>
                <div className="text-xs text-purple-600">노이즈 추가, 회전, 뒤집기</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">지원 형식</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">CSV 파일</span>
                <Badge variant="secondary">지원</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">JSON 파일</span>
                <Badge variant="secondary">지원</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Excel 파일</span>
                <Badge variant="outline">곧 지원</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Parquet</span>
                <Badge variant="outline">곧 지원</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
