"use client"

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Rocket, ShieldCheck, Globe, Share2, Copy, Check, ExternalLink, Loader2 } from 'lucide-react'
import { StoredModel, IndexedDBModelStorage } from '@/lib/modelStorage'

interface ModelDeploymentProps {
  selectedModelId?: string
}

export default function ModelDeployment({ selectedModelId }: ModelDeploymentProps) {
  const [models, setModels] = useState<StoredModel[]>([])
  const [selectedModel, setSelectedModel] = useState<StoredModel | null>(null)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [deploymentStep, setDeploymentStep] = useState<number>(0)

  const modelStorage = new IndexedDBModelStorage()

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      await modelStorage.init()
      const list = await modelStorage.listModels()
      setModels(list)
      if (selectedModelId) {
        const found = list.find(m => m.id === selectedModelId)
        if (found) setSelectedModel(found)
      }
    } catch (err) {
      console.error('Failed to load models for deployment', err)
    }
  }

  const handleDeploy = useCallback(async () => {
    if (!selectedModel) return

    setIsDeploying(true)
    setDeploymentStep(1) // 최적화 중

    try {
      // 1. 모델 최적화 (가상)
      await new Promise(r => setTimeout(r, 1500))
      setDeploymentStep(2) // 보안 검사 중

      // 2. 보안 및 정책 검사 (가상)
      await new Promise(r => setTimeout(r, 1000))
      setDeploymentStep(3) // 클라우드 업로드 중

      // 3. 로컬 저장소 모델 추출 및 가상 엔드포인트 생성
      await new Promise(r => setTimeout(r, 2000))
      
      const fakeUrl = `https://ai-studio.io/api/v1/deploy/${selectedModel.id}`
      setDeployedUrl(fakeUrl)
      setDeploymentStep(4) // 완료
    } catch (err) {
      console.error('Deployment failed', err)
    } finally {
      setIsDeploying(false)
    }
  }, [selectedModel])

  const copyUrl = () => {
    if (!deployedUrl) return
    navigator.clipboard.writeText(deployedUrl)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
          <Rocket size={24} />
        </div>
        <h2 className="text-2xl font-bold">모델 원클릭 배포</h2>
      </div>

      {!deployedUrl ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">배포할 모델 선택</label>
            <div className="grid grid-cols-1 gap-3">
              {models.length > 0 ? (
                models.map(m => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModel(m)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedModel?.id === m.id 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{m.name}</span>
                      <span className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      정확도: {m.metrics.finalAccuracy ? (m.metrics.finalAccuracy * 100).toFixed(2) + '%' : 'N/A'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-xl">
                  학습된 모델이 없습니다.
                </div>
              )}
            </div>
          </div>

          {selectedModel && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
              <ShieldCheck className="text-blue-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-blue-800">보안 배포 준비 완료</h4>
                <p className="text-xs text-blue-700 mt-1">
                  이 모델은 TensorFlow.js 레이어 형식을 사용하며, 배포 시 edge 환경에서 최적의 성능을 낼 수 있도록 자동으로 WebGL/WebGPU 가속 설정이 포함됩니다.
                </p>
              </div>
            </div>
          )}

          <Button
            className="w-full py-6 bg-orange-600 hover:bg-orange-700 text-lg font-bold shadow-orange-200 shadow-lg"
            disabled={!selectedModel || isDeploying}
            onClick={handleDeploy}
          >
            {isDeploying ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" />
                {deploymentStep === 1 && '모델 최적화 중...'}
                {deploymentStep === 2 && '보안 검사 중...'}
                {deploymentStep === 3 && '엔드포인트 생성 중...'}
              </div>
            ) : (
              '지금 바로 배포하기'
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-6 animate-in zoom-in-95 duration-300">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">배포 성공!</h3>
            <p className="text-sm text-gray-500 mt-2">사용자의 모델이 전 세계 어디서든 호출 가능한 API 엔드포인트로 생성되었습니다.</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative group">
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">API Endpoint URL</label>
              <div className="flex items-center justify-between">
                <code className="text-sm text-orange-600 font-mono font-bold truncate pr-10">{deployedUrl}</code>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={copyUrl}
                >
                  {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="flex items-center gap-2" onClick={() => window.open(deployedUrl!, '_blank')}>
                <ExternalLink size={14} /> 테스트 페이지
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Share2 size={14} /> 프로젝트 공유
              </Button>
            </div>
          </div>

          <Button 
            variant="ghost" 
            className="w-full text-gray-400 hover:text-gray-600"
            onClick={() => {
              setDeployedUrl(null)
              setDeploymentStep(0)
            }}
          >
            다른 모델 배포하기
          </Button>
        </div>
      )}
    </div>
  )
}
