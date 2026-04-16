import type { Node, Edge } from '@xyflow/react'

export interface PipelineNodeData {
  label: string
  stage: 'git' | 'build' | 'scan' | 'push' | 'deploy' | 'verify'
  status: 'success' | 'running' | 'failed' | 'pending'
  duration_sec: number
  [key: string]: unknown
}

export interface GitNodeData extends PipelineNodeData {
  stage: 'git'
  commit_sha: string
  author: string
  message: string
}

export interface BuildNodeData extends PipelineNodeData {
  stage: 'build'
  image_size: string
}

export interface ScanNodeData extends PipelineNodeData {
  stage: 'scan'
  critical: number
  high: number
  medium: number
}

export interface PushNodeData extends PipelineNodeData {
  stage: 'push'
  registry: string
  image_tag: string
}

export interface DeployNodeData extends PipelineNodeData {
  stage: 'deploy'
  environment: string
  strategy: string
}

export interface VerifyNodeData extends PipelineNodeData {
  stage: 'verify'
  endpoint: string
  response_time_ms: number
  health_status: 'pass' | 'fail' | 'pending'
}

// Successful pipeline (dep-f1e2d3c400000001, api-gateway-prod)
export const successPipelineNodes: Node[] = [
  {
    id: 'pipe-s-git',
    type: 'gitNode',
    position: { x: 0, y: 0 },
    data: {
      label: 'Git',
      stage: 'git',
      status: 'success',
      duration_sec: 1.2,
      commit_sha: 'a1b2c3d',
      author: 'Ayoub Zakarya',
      message: 'fix: resolve race condition in rate limiter',
    } satisfies GitNodeData,
  },
  {
    id: 'pipe-s-build',
    type: 'buildNode',
    position: { x: 240, y: 0 },
    data: {
      label: 'Build',
      stage: 'build',
      status: 'success',
      duration_sec: 42.3,
      image_size: '48.2 MB',
    } satisfies BuildNodeData,
  },
  {
    id: 'pipe-s-scan',
    type: 'scanNode',
    position: { x: 480, y: 0 },
    data: {
      label: 'Scan',
      stage: 'scan',
      status: 'success',
      duration_sec: 18.7,
      critical: 0,
      high: 0,
      medium: 2,
    } satisfies ScanNodeData,
  },
  {
    id: 'pipe-s-push',
    type: 'pushNode',
    position: { x: 720, y: 0 },
    data: {
      label: 'Push',
      stage: 'push',
      status: 'success',
      duration_sec: 8.4,
      registry: '123456789012.dkr.ecr.us-east-1.amazonaws.com',
      image_tag: 'infraforge-api:v1.4.2',
    } satisfies PushNodeData,
  },
  {
    id: 'pipe-s-deploy',
    type: 'deployNode',
    position: { x: 960, y: 0 },
    data: {
      label: 'Deploy',
      stage: 'deploy',
      status: 'success',
      duration_sec: 67.2,
      environment: 'api-gateway-prod',
      strategy: 'canary',
    } satisfies DeployNodeData,
  },
  {
    id: 'pipe-s-verify',
    type: 'verifyNode',
    position: { x: 1200, y: 0 },
    data: {
      label: 'Verify',
      stage: 'verify',
      status: 'success',
      duration_sec: 16.5,
      endpoint: 'https://api.infraforge.dev/healthz',
      response_time_ms: 23,
      health_status: 'pass',
    } satisfies VerifyNodeData,
  },
]

export const successPipelineEdges: Edge[] = [
  { id: 'pe-s-1', source: 'pipe-s-git', target: 'pipe-s-build', type: 'smoothstep', animated: true, style: { stroke: '#22c55e' } },
  { id: 'pe-s-2', source: 'pipe-s-build', target: 'pipe-s-scan', type: 'smoothstep', animated: true, style: { stroke: '#22c55e' } },
  { id: 'pe-s-3', source: 'pipe-s-scan', target: 'pipe-s-push', type: 'smoothstep', animated: true, style: { stroke: '#22c55e' } },
  { id: 'pe-s-4', source: 'pipe-s-push', target: 'pipe-s-deploy', type: 'smoothstep', animated: true, style: { stroke: '#22c55e' } },
  { id: 'pe-s-5', source: 'pipe-s-deploy', target: 'pipe-s-verify', type: 'smoothstep', animated: true, style: { stroke: '#22c55e' } },
]

// Running pipeline (dep-f1e2d3c400000004, worker-v2-canary)
export const runningPipelineNodes: Node[] = [
  {
    id: 'pipe-r-git',
    type: 'gitNode',
    position: { x: 0, y: 0 },
    data: {
      label: 'Git',
      stage: 'git',
      status: 'success',
      duration_sec: 1.0,
      commit_sha: 'd4e5f6a',
      author: 'Ayoub Zakarya',
      message: 'feat: implement batch job retry with exponential backoff',
    } satisfies GitNodeData,
  },
  {
    id: 'pipe-r-build',
    type: 'buildNode',
    position: { x: 240, y: 0 },
    data: {
      label: 'Build',
      stage: 'build',
      status: 'success',
      duration_sec: 38.7,
      image_size: '52.8 MB',
    } satisfies BuildNodeData,
  },
  {
    id: 'pipe-r-scan',
    type: 'scanNode',
    position: { x: 480, y: 0 },
    data: {
      label: 'Scan',
      stage: 'scan',
      status: 'success',
      duration_sec: 15.3,
      critical: 0,
      high: 1,
      medium: 3,
    } satisfies ScanNodeData,
  },
  {
    id: 'pipe-r-push',
    type: 'pushNode',
    position: { x: 720, y: 0 },
    data: {
      label: 'Push',
      stage: 'push',
      status: 'success',
      duration_sec: 7.1,
      registry: '123456789012.dkr.ecr.us-east-1.amazonaws.com',
      image_tag: 'worker:v3.0.0-rc1',
    } satisfies PushNodeData,
  },
  {
    id: 'pipe-r-deploy',
    type: 'deployNode',
    position: { x: 960, y: 0 },
    data: {
      label: 'Deploy',
      stage: 'deploy',
      status: 'running',
      duration_sec: 0,
      environment: 'worker-v2-canary',
      strategy: 'canary',
    } satisfies DeployNodeData,
  },
  {
    id: 'pipe-r-verify',
    type: 'verifyNode',
    position: { x: 1200, y: 0 },
    data: {
      label: 'Verify',
      stage: 'verify',
      status: 'pending',
      duration_sec: 0,
      endpoint: 'https://worker-canary.infraforge.dev/healthz',
      response_time_ms: 0,
      health_status: 'pending',
    } satisfies VerifyNodeData,
  },
]

export const runningPipelineEdges: Edge[] = [
  { id: 'pe-r-1', source: 'pipe-r-git', target: 'pipe-r-build', type: 'smoothstep', animated: true, style: { stroke: '#22c55e' } },
  { id: 'pe-r-2', source: 'pipe-r-build', target: 'pipe-r-scan', type: 'smoothstep', animated: true, style: { stroke: '#22c55e' } },
  { id: 'pe-r-3', source: 'pipe-r-scan', target: 'pipe-r-push', type: 'smoothstep', animated: true, style: { stroke: '#22c55e' } },
  { id: 'pe-r-4', source: 'pipe-r-push', target: 'pipe-r-deploy', type: 'smoothstep', animated: true, style: { stroke: '#3b82f6' } },
  { id: 'pe-r-5', source: 'pipe-r-deploy', target: 'pipe-r-verify', type: 'smoothstep' },
]

// Failed pipeline (dep-f1e2d3c400000007, ml-pipeline-experiment)
export const failedPipelineNodes: Node[] = [
  {
    id: 'pipe-f-git',
    type: 'gitNode',
    position: { x: 0, y: 0 },
    data: {
      label: 'Git',
      stage: 'git',
      status: 'success',
      duration_sec: 1.3,
      commit_sha: 'a7b8c9d',
      author: 'Priya Sharma',
      message: 'feat: add feature store integration for model serving',
    } satisfies GitNodeData,
  },
  {
    id: 'pipe-f-build',
    type: 'buildNode',
    position: { x: 240, y: 0 },
    data: {
      label: 'Build',
      stage: 'build',
      status: 'success',
      duration_sec: 98.4,
      image_size: '312.7 MB',
    } satisfies BuildNodeData,
  },
  {
    id: 'pipe-f-scan',
    type: 'scanNode',
    position: { x: 480, y: 0 },
    data: {
      label: 'Scan',
      stage: 'scan',
      status: 'success',
      duration_sec: 45.2,
      critical: 2,
      high: 3,
      medium: 8,
    } satisfies ScanNodeData,
  },
  {
    id: 'pipe-f-push',
    type: 'pushNode',
    position: { x: 720, y: 0 },
    data: {
      label: 'Push',
      stage: 'push',
      status: 'success',
      duration_sec: 12.8,
      registry: '123456789012.dkr.ecr.us-east-1.amazonaws.com',
      image_tag: 'ml-pipeline:v0.3.0',
    } satisfies PushNodeData,
  },
  {
    id: 'pipe-f-deploy',
    type: 'deployNode',
    position: { x: 960, y: 0 },
    data: {
      label: 'Deploy',
      stage: 'deploy',
      status: 'success',
      duration_sec: 134.1,
      environment: 'ml-pipeline-experiment',
      strategy: 'rolling',
    } satisfies DeployNodeData,
  },
  {
    id: 'pipe-f-verify',
    type: 'verifyNode',
    position: { x: 1200, y: 0 },
    data: {
      label: 'Verify',
      stage: 'verify',
      status: 'failed',
      duration_sec: 20.7,
      endpoint: 'https://ml-exp.infraforge.dev/healthz',
      response_time_ms: 5032,
      health_status: 'fail',
    } satisfies VerifyNodeData,
  },
]

export const failedPipelineEdges: Edge[] = [
  { id: 'pe-f-1', source: 'pipe-f-git', target: 'pipe-f-build', type: 'smoothstep', animated: true, style: { stroke: '#22c55e' } },
  { id: 'pe-f-2', source: 'pipe-f-build', target: 'pipe-f-scan', type: 'smoothstep', animated: true, style: { stroke: '#22c55e' } },
  { id: 'pe-f-3', source: 'pipe-f-scan', target: 'pipe-f-push', type: 'smoothstep', animated: true, style: { stroke: '#22c55e' } },
  { id: 'pe-f-4', source: 'pipe-f-push', target: 'pipe-f-deploy', type: 'smoothstep', animated: true, style: { stroke: '#22c55e' } },
  { id: 'pe-f-5', source: 'pipe-f-deploy', target: 'pipe-f-verify', type: 'smoothstep', style: { stroke: '#ef4444' } },
]
