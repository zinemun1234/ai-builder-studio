"use client"

import React, { useState, useCallback, useMemo } from 'react'
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  addEdge, 
  Connection, 
  Edge, 
  Node,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button } from '@/components/ui/button'
import { Play, Save, Download, Plus, Trash2, Code, X } from 'lucide-react'
import { AiModelNode, DatasetNode, ActionNode } from './CustomNodes'
import CodeGenerator from './CodeGenerator'

const initialNodes: Node[] = [
  {
    id: 'node-1',
    type: 'dataset',
    position: { x: 250, y: 50 },
    data: { label: '훈련 데이터셋', source: 'CSV Upload' },
  },
  {
    id: 'node-2',
    type: 'aiModel',
    position: { x: 250, y: 200 },
    data: { label: '신경망 모델 (Dense)', modelId: 'model_123' },
  },
  {
    id: 'node-3',
    type: 'action',
    position: { x: 250, y: 350 },
    data: { label: '예측 실행', actionType: 'Predict' },
  },
]

const initialEdges: Edge[] = [
  { 
    id: 'edge-1-2', 
    source: 'node-1', 
    target: 'node-2', 
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    style: { stroke: '#3b82f6', strokeWidth: 2 }
  },
  { 
    id: 'edge-2-3', 
    source: 'node-2', 
    target: 'node-3', 
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
    style: { stroke: '#a855f7', strokeWidth: 2 }
  },
]

const nodeTypes = {
  aiModel: AiModelNode,
  dataset: DatasetNode,
  action: ActionNode,
}

interface VisualWorkflowBuilderProps {
  onWorkflowCreate?: (workflow: any) => void
}

export default function VisualWorkflowBuilder({ onWorkflowCreate }: VisualWorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [isExecuting, setIsExecuting] = useState(false)
  const [showCodeGenerator, setShowCodeGenerator] = useState(false)

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      const edgeStyle = params.source.includes('dataset') 
        ? { stroke: '#10b981', strokeWidth: 2 }
        : params.source.includes('model')
        ? { stroke: '#3b82f6', strokeWidth: 2 }
        : { stroke: '#a855f7', strokeWidth: 2 }

      const newEdge: Edge = {
        id: `e-${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: (edgeStyle as any).stroke },
        style: edgeStyle
      }
      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges]
  )

  const addNode = useCallback((type: 'aiModel' | 'dataset' | 'action') => {
    const id = `${type}-${Date.now()}`
    const newNode: Node = {
      id,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { 
        label: type === 'aiModel' ? '새 AI 모델' : type === 'dataset' ? '새 데이터셋' : '새 액션',
        ...(type === 'aiModel' && { modelId: 'None' }),
        ...(type === 'dataset' && { source: 'None' }),
        ...(type === 'action' && { actionType: 'Predict' })
      },
    }
    setNodes((nds) => nds.concat(newNode))
  }, [setNodes])

  const executeWorkflow = useCallback(async () => {
    setIsExecuting(true)
    // 워크플로우 실행 로직 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsExecuting(false)
    alert('워크플로우 실행이 완료되었습니다.')
  }, [])

  const saveWorkflow = useCallback(() => {
    const workflow = { nodes, edges }
    localStorage.setItem('ai-builder-workflow', JSON.stringify(workflow))
    alert('워크플로우가 저장되었습니다.')
  }, [nodes, edges])

  const toggleCodeGenerator = useCallback(() => {
    setShowCodeGenerator(!showCodeGenerator)
  }, [showCodeGenerator])

  return (
    <div className="w-full h-full min-h-[600px] border rounded-lg overflow-hidden bg-gray-50 relative flex">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
          
          <Panel position="top-right" className="flex flex-col gap-2">
            <div className="bg-white p-2 rounded-md shadow-md flex flex-col gap-2">
              <h4 className="text-xs font-bold text-gray-500 px-1">노드 추가</h4>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => addNode('dataset')} className="text-green-600 border-green-200 hover:bg-green-50">
                  <Plus size={14} className="mr-1" /> 데이터
                </Button>
                <Button size="sm" variant="outline" onClick={() => addNode('aiModel')} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                  <Plus size={14} className="mr-1" /> 모델
                </Button>
                <Button size="sm" variant="outline" onClick={() => addNode('action')} className="text-purple-600 border-purple-200 hover:bg-purple-50">
                  <Plus size={14} className="mr-1" /> 액션
                </Button>
              </div>
            </div>
            
            <div className="bg-white p-2 rounded-md shadow-md flex gap-2">
              <Button size="sm" onClick={executeWorkflow} disabled={isExecuting}>
                <Play size={14} className="mr-2" /> {isExecuting ? '실행 중...' : '워크플로우 실행'}
              </Button>
              <Button size="sm" variant="secondary" onClick={saveWorkflow}>
                <Save size={14} className="mr-2" /> 저장
              </Button>
              <Button size="sm" variant="outline" onClick={toggleCodeGenerator}>
                <Code size={14} className="mr-2" /> {showCodeGenerator ? '코드 닫기' : '코드 생성'}
              </Button>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {showCodeGenerator && (
        <div className="w-[450px] border-l bg-white overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="sticky top-0 bg-white z-10 p-4 border-b flex justify-between items-center">
            <h3 className="font-bold text-lg">워크플로우 코드</h3>
            <Button variant="ghost" size="icon" onClick={() => setShowCodeGenerator(false)}>
              <X size={20} />
            </Button>
          </div>
          <CodeGenerator nodes={nodes} edges={edges} />
        </div>
      )}
    </div>
  )
}
