

## ⚠️ 이 프로젝트는 아직 시작한 단계입니다. 


## AI Builder Studio - 프로젝트 생성 가이드

## 프로젝트 개요

AI Builder Studio는 사용자가 직접 AI 모델을 개발하고 워크플로우를 설계하며, 생성된 모델을 실제 애플리케이션으로 통합할 수 있는 완전한 노코드 AI 개발 플랫폼입니다.

### 핵심 기능
- **실제 AI 모델 개발**: TensorFlow.js 기반 브라우저 내 모델 학습
- **데이터셋 처리**: CSV/JSON 파일 자동 전처리 및 정규화
- **비주얼 워크플로우**: React Flow 기반 시각적 워크플로우 설계
- **코드 자동 생성**: 워크플로우 기반 React 컴포넌트 추출
- **모델 예측**: 학습된 모델로 실시간 예측 실행
- **프로젝트 통계**: 대시보드 및 활동 추적

### 기술 스택
- **프론트엔드**: Next.js 15 + TypeScript
- **AI/ML**: TensorFlow.js, Papa Parse
- **UI**: Tailwind CSS + Shadcn/ui
- **데이터 저장**: IndexedDB + localStorage
- **시각화**: React Flow, D3.js
- **상태 관리**: Zustand (예정)

---

## 시작하기

### 1. 환경 설정
```bash
# 프로젝트 클론
git clone <repository-url>
cd ai-builder-studio

# 의존 설치
npm install

# 개발 서버 시작
npm run dev
```

### 2. 첫 AI 모델 만들기
1. **데이터셋 준비**: `ai_training_data.csv` 파일 제공
2. **모델 학습**: AI 모델 개발 탭에서 데이터셋 업로드 및 학습
3. **모델 저장**: 학습 완료된 모델 저장

### 3. 워크플로우 설계
1. **노드 추가**: 데이터셋, AI 모델, 액션 노드를 시각적으로 연결
2. **워크플로우 실행**: 설계된 워크플로우 실행 및 테스트
3. **코드 생성**: 워크플로우 기반 React 코드 자동 생성

---

## 사용 가이드

### AI 모델 개발
```typescript
// 1. 데이터셋 업로드
const handleDatasetUpload = async (file: File) => {
  const dataset = await DataProcessor.parseCSV(file)
  // 데이터 전처리 및 모델 학습
}

// 2. 고급 아키텍처 설정
const layers = [
  { type: 'dense', units: 64, activation: 'relu' },
  { type: 'dropout', rate: 0.2 },
  { type: 'dense', units: 32, activation: 'relu' }
]

// 3. 모델 학습
const model = modelTrainer.createModel(inputShape)
modelTrainer.compileModel(config)
const trained = await modelTrainer.trainModel(data, config, onProgress)
```

### 모델 예측
```typescript
// 모델 선택 및 예측
const model = await modelStorage.getModelTensor(modelId)
const predictions = await modelTrainer.predict(model, inputData)
```

### 워크플로우 설계
```typescript
// 노드 연결 및 워크플로우 생성
const workflow = { nodes, edges }
const generatedCode = generateCodeFromWorkflow(workflow)
```

---

## 고급 기능

### 커스텀 모델 아키텍처
- Dense 레이어 유닛과 파라미터 조절
- Dropout 레이어로 과적합 방지 설정
- 활성화 함수 선택 (ReLU, Sigmoid, Tanh, Softmax)

### 코드 자동 생성
- 워크플로우 기반 React 컴포넌트 생성
- TensorFlow.js 통합 코드 추출
- 즉시 실행 가능한 코드 내보내기기

### 실시간 시각화
- 학습 진행 상황 모니터링
- Loss 및 정확도 그래프 표시
- 모델 성능 분석

---

## 데이터 구조

### 모델 저장 형식
```typescript
interface TrainedModel {
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
```

### 데이터셋 형식
```csv
feature1,feature2,feature3,feature4,label
1.0,2.0,3.0,4.0,1
0.5,1.5,2.5,3.5,0
```

---

## 개발 참고

### 모델 학습 설정
```typescript
const config: TrainingConfig = {
  epochs: 10,
  batchSize: 32,
  learningRate: 0.001,
  validationSplit: 0.2,
  optimizer: 'adam',
  lossFunction: 'meanSquaredError',
  metrics: ['accuracy']
}
```

### 레이어 구성 예시
```typescript
const layers: LayerConfig[] = [
  { id: 'l1', type: 'dense', units: 64, activation: 'relu' },
  { id: 'l2', type: 'dropout', rate: 0.2 },
  { id: 'l3', type: 'dense', units: 32, activation: 'relu' }
]
```

---


---

## 라이선스

MIT License - 자유례 사용 및 수정 가능

---

## 기여 및 지원

이 프로젝트는 AI 개발을 더 쉽게 접근할 수 있도록 설계되었습니다. 질문이나 개선 제안이 있으시면 언제해 주세요.

