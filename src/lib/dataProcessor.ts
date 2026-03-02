import Papa from 'papaparse'

export type DataRow = Record<string, number | string | null | undefined>

export interface Dataset {
  id: string
  name: string
  data: DataRow[]
  columns: string[]
  features: number[][]
  labels: number[]
  createdAt: Date
}

export interface ProcessedData {
  features: number[][]
  labels: number[]
  featureNames: string[]
  labelName: string
  totalSamples: number
  trainSize: number
  testSize: number
}

export class DataProcessor {
  static async parseCSV(file: File): Promise<Dataset> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing error: ${results.errors[0].message}`))
            return
          }

          const data = results.data as DataRow[]
          const columns = Object.keys(data[0] || {})
          
          resolve({
            id: `dataset_${Date.now()}`,
            name: file.name,
            data,
            columns,
            features: [],
            labels: [],
            createdAt: new Date()
          })
        },
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`))
        }
      })
    })
  }

  static parseJSON(file: File): Promise<Dataset> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const raw = JSON.parse(e.target?.result as string)
          const rows = (Array.isArray(raw) ? raw : [raw]) as DataRow[]
          const columns = Object.keys(rows[0] || {})
          
          resolve({
            id: `dataset_${Date.now()}`,
            name: file.name,
            data: rows,
            columns,
            features: [],
            labels: [],
            createdAt: new Date()
          })
        } catch (error) {
          reject(new Error(`JSON parsing error: ${error}`))
        }
      }
      reader.onerror = () => reject(new Error('File reading error'))
      reader.readAsText(file)
    })
  }

  static preprocessData(
    dataset: Dataset, 
    labelColumn: string, 
    featureColumns: string[],
    testSplit: number = 0.2
  ): ProcessedData {
    if (!dataset.data || dataset.data.length === 0) {
      throw new Error('No data available for preprocessing')
    }

    const features: number[][] = []
    const labels: number[] = []

    dataset.data.forEach(row => {
      const feature: number[] = []
      featureColumns.forEach(col => {
        const value = row[col]
        feature.push(typeof value === 'number' ? value : 0)
      })
      
      const labelValue = row[labelColumn]
      const label = typeof labelValue === 'number' ? labelValue : 
                    typeof labelValue === 'string' ? this.encodeLabel(labelValue) : 0
      
      features.push(feature)
      labels.push(label)
    })

    // 데이터 정규화 (Min-Max)
    const normalizedFeatures = this.normalizeFeatures(features)
    
    // 데이터 분할
    const totalSamples = features.length
    const testSize = Math.floor(totalSamples * testSplit)
    const trainSize = totalSamples - testSize

    return {
      features: normalizedFeatures,
      labels,
      featureNames: featureColumns,
      labelName: labelColumn,
      totalSamples,
      trainSize,
      testSize
    }
  }

  private static normalizeFeatures(features: number[][]): number[][] {
    if (features.length === 0) return []

    const numFeatures = features[0].length
    const normalized: number[][] = []

    for (let j = 0; j < numFeatures; j++) {
      const column = features.map(row => row[j])
      const min = Math.min(...column)
      const max = Math.max(...column)
      const range = max - min || 1

      for (let i = 0; i < features.length; i++) {
        if (!normalized[i]) normalized[i] = []
        normalized[i][j] = (features[i][j] - min) / range
      }
    }

    return normalized
  }

  private static encodeLabel(label: string): number {
    // 간단한 레이블 인코딩 (실제로는 더 복잡한 로직 필요)
    const hash = label.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return hash % 1000 // 0-999 사이의 값으로 변환
  }

  static getDatasetPreview(dataset: Dataset, maxRows: number = 5): DataRow[] {
    return dataset.data.slice(0, maxRows)
  }

  static getDatasetStats(dataset: Dataset): {
    totalRows: number
    totalColumns: number
    columnTypes: Record<string, string>
    missingValues: Record<string, number>
  } {
    if (!dataset.data || dataset.data.length === 0) {
      return {
        totalRows: 0,
        totalColumns: 0,
        columnTypes: {},
        missingValues: {}
      }
    }

    const columnTypes: Record<string, string> = {}
    const missingValues: Record<string, number> = {}

    dataset.columns.forEach(col => {
      const values = dataset.data.map(row => row[col])
      const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '')
      
      // 타입 추론
      const numValues = nonNullValues.filter(v => typeof v === 'number')
      const strValues = nonNullValues.filter(v => typeof v === 'string')
      
      if (numValues.length > strValues.length) {
        columnTypes[col] = 'number'
      } else if (strValues.length > 0) {
        columnTypes[col] = 'string'
      } else {
        columnTypes[col] = 'unknown'
      }

      // 결측값 계산
      missingValues[col] = values.length - nonNullValues.length
    })

    return {
      totalRows: dataset.data.length,
      totalColumns: dataset.columns.length,
      columnTypes,
      missingValues
    }
  }
}
