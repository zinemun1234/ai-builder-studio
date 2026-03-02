import { TrainedModel } from './modelTrainer'
import * as tf from '@tensorflow/tfjs'

export interface StoredModel {
  id: string
  name: string
  description?: string
  config: any
  metrics: {
    finalLoss: number
    finalAccuracy?: number
    trainingTime: number
    totalEpochs: number
  }
  createdAt: Date
  updatedAt: Date
  modelPath: string
}

export interface ModelStorage {
  saveModel(model: TrainedModel): Promise<void>
  loadModel(id: string): Promise<StoredModel | null>
  deleteModel(id: string): Promise<void>
  listModels(): Promise<StoredModel[]>
  getModelTensor(id: string): Promise<tf.LayersModel | null>
}

export class IndexedDBModelStorage implements ModelStorage {
  private dbName = 'AIModelStorage'
  private storeName = 'models'
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          store.createIndex('name', 'name', { unique: false })
          store.createIndex('createdAt', 'createdAt', { unique: false })
        }
      }
    })
  }

  async saveModel(model: TrainedModel): Promise<void> {
    if (!this.db) await this.init()

    // 모델을 localStorage에 저장
    const modelPath = `model_${model.id}`
    await model.model.save(`localstorage://${modelPath}`)

    // 메타데이터를 IndexedDB에 저장
    const storedModel: StoredModel = {
      id: model.id,
      name: model.name,
      config: model.config,
      metrics: model.metrics,
      createdAt: model.createdAt,
      updatedAt: new Date(),
      modelPath
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(storedModel)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async loadModel(id: string): Promise<StoredModel | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async deleteModel(id: string): Promise<void> {
    if (!this.db) await this.init()

    // 먼저 메타데이터를 가져와 모델 경로 확인
    const model = await this.loadModel(id)
    if (model) {
      // localStorage에서 모델 삭제
      try {
        localStorage.removeItem(`tensorflowjs_models/${model.modelPath}/model_info`)
        localStorage.removeItem(`tensorflowjs_models/${model.modelPath}/model_topology`)
        localStorage.removeItem(`tensorflowjs_models/${model.modelPath}/model_weights`)
      } catch (error) {
        console.warn('Failed to delete model from localStorage:', error)
      }
    }

    // IndexedDB에서 메타데이터 삭제
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async listModels(): Promise<StoredModel[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || [])
    })
  }

  async getModelTensor(id: string): Promise<tf.LayersModel | null> {
    const model = await this.loadModel(id)
    if (!model) return null

    try {
      const loadedModel = await tf.loadLayersModel(`localstorage://${model.modelPath}`)
      return loadedModel
    } catch (error) {
      console.error('Failed to load model tensor:', error)
      return null
    }
  }

  async updateModel(id: string, updates: Partial<StoredModel>): Promise<void> {
    if (!this.db) await this.init()

    const existing = await this.loadModel(id)
    if (!existing) throw new Error('Model not found')

    const updated: StoredModel = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(updated)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async searchModels(query: string): Promise<StoredModel[]> {
    const models = await this.listModels()
    const lowerQuery = query.toLowerCase()
    
    return models.filter(model => 
      model.name.toLowerCase().includes(lowerQuery) ||
      model.description?.toLowerCase().includes(lowerQuery)
    )
  }

  async getStorageStats(): Promise<{
    totalModels: number
    totalStorageSize: number
    oldestModel: Date | null
    newestModel: Date | null
  }> {
    const models = await this.listModels()
    
    let totalSize = 0
    let oldest: Date | null = null
    let newest: Date | null = null

    models.forEach(model => {
      // localStorage 크기 추정 (정확하지 않음)
      try {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.includes(model.modelPath)) {
            const itemSize = localStorage.getItem(key)?.length || 0
            totalSize += itemSize
          }
        })
      } catch (error) {
        // localStorage 접근 실패 시 무시
      }

      if (!oldest || model.createdAt < oldest) oldest = model.createdAt
      if (!newest || model.createdAt > newest) newest = model.createdAt
    })

    return {
      totalModels: models.length,
      totalStorageSize: totalSize,
      oldestModel: oldest,
      newestModel: newest
    }
  }
}
