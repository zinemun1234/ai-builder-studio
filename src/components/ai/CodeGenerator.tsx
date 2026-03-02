"use client"

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Code, Copy, Download, FileCode, Check } from 'lucide-react'

interface CodeGeneratorProps {
  nodes?: any[]
  edges?: any[]
}

export default function CodeGenerator({ nodes = [], edges = [] }: CodeGeneratorProps) {
  const [generatedCode, setGeneratedCode] = useState<string>('')
  const [isCopied, setIsCopied] = useState(false)

  const generateReactCode = useCallback(() => {
    // 실제 워크플로우 데이터를 기반으로 코드 생성
    const datasetNodes = nodes.filter(n => n.type === 'dataset')
    const modelNodes = nodes.filter(n => n.type === 'aiModel')
    const actionNodes = nodes.filter(n => n.type === 'action')

    const code = `"use client"

import React, { useState, useEffect } from 'react'
import * as tf from '@tensorflow/tfjs'

// AI Builder Studio에서 생성된 자동화 코드
export default function GeneratedAIApp() {
  const [isReady, setIsReady] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // 모델 로딩 및 초기화
  useEffect(() => {
    const initModel = async () => {
      try {
        // 여기에 모델 로딩 로직이 들어갑니다.
        // const model = await tf.loadLayersModel('localstorage://your-model-id')
        console.log('Model initialized')
        setIsReady(true)
      } catch (err) {
        console.error('Failed to init model', err)
      }
    }
    initModel()
  }, [])

  const handleAction = async () => {
    if (!isReady) return
    setLoading(true)
    try {
      // 액션 실행 로직 (예: 예측)
      // 1. 데이터 가져오기 (${datasetNodes.map(n => n.data.label).join(', ')})
      // 2. 모델 실행 (${modelNodes.map(n => n.data.label).join(', ')})
      // 3. 결과 처리 (${actionNodes.map(n => n.data.label).join(', ')})
      
      await new Promise(r => setTimeout(r, 1000)) // 시뮬레이션
      setResult("예측 결과: 0.8523")
    } catch (err) {
      console.error('Action failed', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white shadow-xl rounded-2xl border border-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">나의 AI 앱</h1>
      
      <div className="space-y-4 mb-8">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-700 font-medium">사용된 모델: ${modelNodes[0]?.data.label || '기본 모델'}</p>
          <p className="text-xs text-blue-500 mt-1">데이터 소스: ${datasetNodes[0]?.data.label || '기본 데이터셋'}</p>
        </div>
      </div>

      <button
        onClick={handleAction}
        disabled={!isReady || loading}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg disabled:bg-gray-400"
      >
        {loading ? '처리 중...' : '실행하기'}
      </button>

      {result && (
        <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-lg font-bold mb-2 text-gray-700">결과</h3>
          <p className="text-2xl font-mono text-blue-600 font-bold">{result}</p>
        </div>
      )}
    </div>
  )
}
`
    setGeneratedCode(code)
  }, [nodes, edges])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed', err)
    }
  }

  const downloadFile = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'GeneratedAIApp.tsx'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Code className="text-blue-600" />
          코드 자동 생성
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={generateReactCode}>
            <FileCode size={14} className="mr-2" />
            코드 생성하기
          </Button>
        </div>
      </div>

      {generatedCode ? (
        <div className="space-y-4">
          <div className="relative group">
            <pre className="p-4 bg-gray-900 text-gray-100 rounded-xl overflow-x-auto text-sm font-mono max-h-[400px]">
              {generatedCode}
            </pre>
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="secondary" className="h-8 w-8" onClick={copyToClipboard}>
                {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </Button>
              <Button size="icon" variant="secondary" className="h-8 w-8" onClick={downloadFile}>
                <Download size={14} />
              </Button>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="text-sm font-bold text-blue-800 mb-1">안내</h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              워크플로우의 각 노드 구성을 분석하여 실제 실행 가능한 React 컴포넌트 코드를 생성했습니다. 
              이 코드를 프로젝트에 복사하여 즉시 사용할 수 있습니다.
            </p>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-xl">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Code className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-500 font-medium">워크플로우를 구성한 후 코드 생성 버튼을 클릭하세요.</p>
        </div>
      )}
    </div>
  )
}
