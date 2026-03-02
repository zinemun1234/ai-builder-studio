import * as tf from '@tensorflow/tfjs'
import { ProcessedData } from './dataProcessor'

export interface TrainingConfig {
  epochs: number
  batchSize: number
  learningRate: number
  validationSplit: number
  optimizer: 'adam' | 'sgd' | 'rmsprop'
  lossFunction: 'meanSquaredError' | 'binaryCrossentropy' | 'categoricalCrossentropy'
  metrics: string[]
}

export interface TrainingProgress {
  epoch: number
  loss: number
  accuracy?: number
  valLoss?: number
  valAccuracy?: number
  timestamp: Date
}

export interface TrainedModel {
  id: string
  name: string
  model: tf.LayersModel
  config: TrainingConfig
  metrics: {
    finalLoss: number
    finalAccuracy?: number
    trainingTime: number
    totalEpochs: number
  }
  createdAt: Date
}

export class ModelTrainer {
  private model: tf.LayersModel | null = null
  private trainingHistory: TrainingProgress[] = []

  createModel(inputShape: number[], outputUnits: number = 1): tf.LayersModel {
    // 모델 아키텍처 정의
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [inputShape[0]],
          units: 64,
          activation: 'relu',
          name: 'hidden1'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu',
          name: 'hidden2'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 16,
          activation: 'relu',
          name: 'hidden3'
        }),
        tf.layers.dense({
          units: outputUnits,
          activation: outputUnits === 1 ? 'sigmoid' : 'softmax',
          name: 'output'
        })
      ]
    })

    this.model = model
    return model
  }

  setModel(model: tf.LayersModel): void {
    this.model = model
  }

  compileModel(config: TrainingConfig): void {
    if (!this.model) {
      throw new Error('Model must be created before compilation')
    }

    const optimizer = this.createOptimizer(config)
    
    this.model.compile({
      optimizer,
      loss: config.lossFunction,
      metrics: config.metrics
    })
  }

  private createOptimizer(config: TrainingConfig): tf.Optimizer {
    switch (config.optimizer) {
      case 'adam':
        return tf.train.adam(config.learningRate)
      case 'sgd':
        return tf.train.sgd(config.learningRate)
      case 'rmsprop':
        return tf.train.rmsprop(config.learningRate)
      default:
        return tf.train.adam(config.learningRate)
    }
  }

  async trainModel(
    data: ProcessedData,
    config: TrainingConfig,
    onProgress?: (progress: TrainingProgress) => void
  ): Promise<TrainedModel> {
    if (!this.model) {
      throw new Error('Model must be created and compiled before training')
    }

    const startTime = Date.now()
    this.trainingHistory = []

    // 데이터를 텐서로 변환
    const features = tf.tensor2d(data.features)
    const labels = tf.tensor2d(data.labels, [data.labels.length, 1])

    // 학습 데이터와 검증 데이터 분할
    const trainSize = data.trainSize
    const valSize = data.totalSamples - trainSize
    
    const trainFeatures = features.slice([0, 0], [trainSize, data.features[0].length])
    const trainLabels = labels.slice([0, 0], [trainSize, 1])
    
    let valFeatures, valLabels
    if (valSize > 0) {
      valFeatures = features.slice([trainSize, 0], [valSize, data.features[0].length])
      valLabels = labels.slice([trainSize, 0], [valSize, 1])
    }

    // 학습 콜백
    const onEpochEnd = async (epoch: number, logs: any) => {
      const progress: TrainingProgress = {
        epoch: epoch + 1,
        loss: logs.loss,
        accuracy: logs.accuracy,
        valLoss: logs.val_loss,
        valAccuracy: logs.val_accuracy,
        timestamp: new Date()
      }

      this.trainingHistory.push(progress)
      onProgress?.(progress)
    }

    // 모델 학습
    const history = await this.model.fit(trainFeatures, trainLabels, {
      epochs: config.epochs,
      batchSize: config.batchSize,
      validationData: valFeatures && valLabels ? [valFeatures, valLabels] : undefined,
      validationSplit: 0, // 이미 수동으로 분할했으므로 0으로 설정
      callbacks: {
        onEpochEnd
      }
    })

    const trainingTime = Date.now() - startTime
    const finalLoss = history.history.loss[history.history.loss.length - 1]
    const finalAccuracy = history.history.accuracy?.[history.history.accuracy.length - 1]

    // 메모리 정리
    features.dispose()
    labels.dispose()
    trainFeatures.dispose()
    trainLabels.dispose()
    if (valFeatures) valFeatures.dispose()
    if (valLabels) valLabels.dispose()

    const finalLossValue = Array.isArray(finalLoss) ? finalLoss[0] : finalLoss
    const finalAccuracyValue = finalAccuracy !== undefined ? 
      (Array.isArray(finalAccuracy) ? finalAccuracy[0] : finalAccuracy) : undefined

    const trainedModel: TrainedModel = {
      id: `model_${Date.now()}`,
      name: `Trained Model ${new Date().toISOString()}`,
      model: this.model!,
      config,
      metrics: {
        finalLoss: typeof finalLossValue === 'number' ? finalLossValue : 0,
        finalAccuracy: finalAccuracyValue,
        trainingTime,
        totalEpochs: config.epochs
      },
      createdAt: new Date()
    }

    return trainedModel
  }

  async predict(model: tf.LayersModel, inputData: number[][]): Promise<number[]> {
    const inputTensor = tf.tensor2d(inputData)
    const predictions = model.predict(inputTensor) as tf.Tensor
    const results = await predictions.data()
    
    // 메모리 정리
    inputTensor.dispose()
    predictions.dispose()

    return Array.from(results)
  }

  async evaluateModel(
    model: tf.LayersModel, 
    testData: number[][], 
    testLabels: number[]
  ): Promise<{ loss: number; accuracy?: number }> {
    const testFeatures = tf.tensor2d(testData)
    const testLabelsTensor = tf.tensor2d(testLabels, [testLabels.length, 1])

    const evaluation = model.evaluate(testFeatures, testLabelsTensor) as tf.Scalar[]
    const lossData = await evaluation[0].data()
    const loss = lossData[0]
    
    let accuracy: number | undefined
    if (evaluation[1]) {
      const accuracyData = await evaluation[1].data()
      accuracy = accuracyData[0]
    }

    // 메모리 정리
    testFeatures.dispose()
    testLabelsTensor.dispose()
    evaluation.forEach(tensor => tensor.dispose())

    return {
      loss,
      accuracy
    }
  }

  getTrainingHistory(): TrainingProgress[] {
    return this.trainingHistory
  }

  async saveModel(model: tf.LayersModel, name: string): Promise<string> {
    try {
      const saveResult = await model.save(`localstorage://${name}`)
      return saveResult.modelArtifactsInfo?.dateSaved?.toString() || new Date().toISOString()
    } catch (error) {
      throw new Error(`Failed to save model: ${error}`)
    }
  }

  async loadModel(name: string): Promise<tf.LayersModel> {
    try {
      const model = await tf.loadLayersModel(`localstorage://${name}`)
      this.model = model
      return model
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to load model: ${errorMessage}`)
    }
  }

  getModelSummary(): string {
    if (!this.model) {
      return 'No model loaded'
    }

    try {
      // TensorFlow.js의 summary()는 void를 반환하므로 직접 문자열 생성
      const layers = this.model.layers
      let summary = `Model Summary:\n`
      summary += `Total layers: ${layers.length}\n\n`
      
      layers.forEach((layer, index) => {
        summary += `Layer ${index + 1}: ${layer.name}\n`
        summary += `  Type: ${layer.getClassName()}\n`
        summary += `  Input shape: ${JSON.stringify(layer.inputSpec)}\n`
        summary += `  Output shape: ${JSON.stringify(layer.outputShape)}\n`
        summary += `  Parameters: ${layer.countParams()}\n\n`
      })
      
      return summary
    } catch (error) {
      return `Error generating summary: ${error}`
    }
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose()
      this.model = null
    }
    this.trainingHistory = []
  }
}
