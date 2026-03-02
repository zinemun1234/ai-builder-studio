"use client"

import React, { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Brain, Database, Play, Save, Settings } from 'lucide-react'

export const AiModelNode = memo(({ data }: NodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-500 min-w-[150px]">
      <div className="flex items-center pb-2 border-b border-gray-100">
        <div className="rounded-full p-1 bg-blue-100 text-blue-600 mr-2">
          <Brain size={16} />
        </div>
        <div className="text-sm font-bold text-gray-800">{data.label || 'AI Model'}</div>
      </div>
      <div className="pt-2">
        <div className="text-[10px] text-gray-500">Model ID: {data.modelId || 'Not Selected'}</div>
      </div>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-blue-500" />
    </div>
  )
})

export const DatasetNode = memo(({ data }: NodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-green-500 min-w-[150px]">
      <div className="flex items-center pb-2 border-b border-gray-100">
        <div className="rounded-full p-1 bg-green-100 text-green-600 mr-2">
          <Database size={16} />
        </div>
        <div className="text-sm font-bold text-gray-800">{data.label || 'Dataset'}</div>
      </div>
      <div className="pt-2">
        <div className="text-[10px] text-gray-500">Source: {data.source || 'Upload'}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-green-500" />
    </div>
  )
})

export const ActionNode = memo(({ data }: NodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-purple-500 min-w-[150px]">
      <div className="flex items-center pb-2 border-b border-gray-100">
        <div className="rounded-full p-1 bg-purple-100 text-purple-600 mr-2">
          <Play size={16} />
        </div>
        <div className="text-sm font-bold text-gray-800">{data.label || 'Action'}</div>
      </div>
      <div className="pt-2 text-[10px] text-gray-600">
        {data.actionType || 'Predict'}
      </div>
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-purple-500" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-purple-500" />
    </div>
  )
})

AiModelNode.displayName = 'AiModelNode'
DatasetNode.displayName = 'DatasetNode'
ActionNode.displayName = 'ActionNode'
