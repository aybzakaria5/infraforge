import type { Node, Edge } from '@xyflow/react'
import type { MicroserviceNodeData } from '../components/flow/nodes/MicroserviceNode'

interface ServiceMapDef {
  nodes: Node<MicroserviceNodeData>[]
  edges: Edge[]
}

// Per-environment service topologies
const serviceMaps: Record<string, ServiceMapDef> = {
  // api-gateway-prod — full production stack
  'env-a1b2c3d400000001': {
    nodes: [
      { id: 'svc-ingress', type: 'microservice', position: { x: 0, y: 60 }, data: { label: 'ingress-nginx', health: 'healthy', reqRate: '142.8 req/s' } },
      { id: 'svc-api', type: 'microservice', position: { x: 200, y: 0 }, data: { label: 'api-gateway', health: 'healthy', reqRate: '142.8 req/s' } },
      { id: 'svc-auth', type: 'microservice', position: { x: 200, y: 120 }, data: { label: 'auth-service', health: 'healthy', reqRate: '38.4 req/s' } },
      { id: 'svc-worker', type: 'microservice', position: { x: 420, y: 0 }, data: { label: 'worker-service', health: 'healthy', reqRate: '12.1 req/s' } },
      { id: 'svc-db', type: 'microservice', position: { x: 420, y: 120 }, data: { label: 'postgresql', health: 'healthy', reqRate: '84.2 qps' } },
      { id: 'svc-cache', type: 'microservice', position: { x: 620, y: 60 }, data: { label: 'redis', health: 'healthy', reqRate: '210.5 ops/s' } },
    ],
    edges: [
      { id: 'e-in-api', source: 'svc-ingress', target: 'svc-api', type: 'animated', style: { stroke: '#22c55e' }, label: '142.8/s' },
      { id: 'e-in-auth', source: 'svc-ingress', target: 'svc-auth', type: 'smoothstep', label: '38.4/s' },
      { id: 'e-api-worker', source: 'svc-api', target: 'svc-worker', type: 'smoothstep', label: '12.1/s' },
      { id: 'e-api-db', source: 'svc-api', target: 'svc-db', type: 'smoothstep', label: '84.2/s' },
      { id: 'e-auth-db', source: 'svc-auth', target: 'svc-db', type: 'smoothstep' },
      { id: 'e-worker-cache', source: 'svc-worker', target: 'svc-cache', type: 'smoothstep' },
      { id: 'e-api-cache', source: 'svc-api', target: 'svc-cache', type: 'smoothstep' },
    ],
  },

  // auth-service-staging
  'env-a1b2c3d400000002': {
    nodes: [
      { id: 'svc-ingress', type: 'microservice', position: { x: 0, y: 40 }, data: { label: 'ingress-nginx', health: 'healthy', reqRate: '8.2 req/s' } },
      { id: 'svc-auth', type: 'microservice', position: { x: 200, y: 40 }, data: { label: 'auth-service', health: 'healthy', reqRate: '8.2 req/s' } },
      { id: 'svc-db', type: 'microservice', position: { x: 420, y: 0 }, data: { label: 'postgresql', health: 'healthy', reqRate: '14.6 qps' } },
      { id: 'svc-cache', type: 'microservice', position: { x: 420, y: 80 }, data: { label: 'redis', health: 'healthy', reqRate: '22.3 ops/s' } },
    ],
    edges: [
      { id: 'e-in-auth', source: 'svc-ingress', target: 'svc-auth', type: 'animated', style: { stroke: '#22c55e' }, label: '8.2/s' },
      { id: 'e-auth-db', source: 'svc-auth', target: 'svc-db', type: 'smoothstep', label: '14.6/s' },
      { id: 'e-auth-cache', source: 'svc-auth', target: 'svc-cache', type: 'smoothstep', label: '22.3/s' },
    ],
  },

  // payment-service-dev
  'env-a1b2c3d400000003': {
    nodes: [
      { id: 'svc-api', type: 'microservice', position: { x: 0, y: 40 }, data: { label: 'payment-api', health: 'healthy', reqRate: '3.2 req/s' } },
      { id: 'svc-processor', type: 'microservice', position: { x: 220, y: 0 }, data: { label: 'payment-processor', health: 'healthy', reqRate: '1.8 req/s' } },
      { id: 'svc-db', type: 'microservice', position: { x: 220, y: 80 }, data: { label: 'postgresql', health: 'healthy', reqRate: '6.4 qps' } },
      { id: 'svc-queue', type: 'microservice', position: { x: 440, y: 40 }, data: { label: 'sqs-queue', health: 'healthy', reqRate: '1.8 msg/s' } },
    ],
    edges: [
      { id: 'e-api-proc', source: 'svc-api', target: 'svc-processor', type: 'animated', style: { stroke: '#22c55e' }, label: '1.8/s' },
      { id: 'e-api-db', source: 'svc-api', target: 'svc-db', type: 'smoothstep', label: '6.4/s' },
      { id: 'e-proc-queue', source: 'svc-processor', target: 'svc-queue', type: 'smoothstep', label: '1.8/s' },
    ],
  },

  // worker-v2-canary
  'env-a1b2c3d400000004': {
    nodes: [
      { id: 'svc-queue', type: 'microservice', position: { x: 0, y: 40 }, data: { label: 'sqs-queue', health: 'healthy', reqRate: '24.6 msg/s' } },
      { id: 'svc-worker', type: 'microservice', position: { x: 220, y: 0 }, data: { label: 'worker-v2', health: 'healthy', reqRate: '18.3 job/s' } },
      { id: 'svc-worker-canary', type: 'microservice', position: { x: 220, y: 80 }, data: { label: 'worker-v3-canary', health: 'degraded', reqRate: '6.3 job/s' } },
      { id: 'svc-db', type: 'microservice', position: { x: 440, y: 0 }, data: { label: 'postgresql', health: 'healthy', reqRate: '32.1 qps' } },
      { id: 'svc-s3', type: 'microservice', position: { x: 440, y: 80 }, data: { label: 's3-results', health: 'healthy', reqRate: '4.2 put/s' } },
    ],
    edges: [
      { id: 'e-q-w', source: 'svc-queue', target: 'svc-worker', type: 'animated', style: { stroke: '#22c55e' }, label: '18.3/s' },
      { id: 'e-q-wc', source: 'svc-queue', target: 'svc-worker-canary', type: 'animated', style: { stroke: '#eab308' }, label: '6.3/s' },
      { id: 'e-w-db', source: 'svc-worker', target: 'svc-db', type: 'smoothstep' },
      { id: 'e-wc-db', source: 'svc-worker-canary', target: 'svc-db', type: 'smoothstep' },
      { id: 'e-w-s3', source: 'svc-worker', target: 'svc-s3', type: 'smoothstep' },
    ],
  },

  // ml-pipeline-experiment — failed
  'env-a1b2c3d400000007': {
    nodes: [
      { id: 'svc-api', type: 'microservice', position: { x: 0, y: 40 }, data: { label: 'ml-api', health: 'down', reqRate: '0 req/s' } },
      { id: 'svc-trainer', type: 'microservice', position: { x: 220, y: 0 }, data: { label: 'model-trainer', health: 'down', reqRate: '0 job/s' } },
      { id: 'svc-store', type: 'microservice', position: { x: 220, y: 80 }, data: { label: 'feature-store', health: 'down', reqRate: '0 qps' } },
      { id: 'svc-db', type: 'microservice', position: { x: 440, y: 40 }, data: { label: 'postgresql', health: 'healthy', reqRate: '0.1 qps' } },
    ],
    edges: [
      { id: 'e-api-trainer', source: 'svc-api', target: 'svc-trainer', type: 'smoothstep', style: { stroke: '#ef4444' } },
      { id: 'e-api-store', source: 'svc-api', target: 'svc-store', type: 'smoothstep', style: { stroke: '#ef4444' } },
      { id: 'e-store-db', source: 'svc-store', target: 'svc-db', type: 'smoothstep' },
    ],
  },
}

// Default topology for environments without a specific map
const defaultMap: ServiceMapDef = {
  nodes: [
    { id: 'svc-ingress', type: 'microservice', position: { x: 0, y: 40 }, data: { label: 'ingress-nginx', health: 'healthy', reqRate: '—' } },
    { id: 'svc-app', type: 'microservice', position: { x: 220, y: 40 }, data: { label: 'app-service', health: 'healthy', reqRate: '—' } },
    { id: 'svc-db', type: 'microservice', position: { x: 440, y: 40 }, data: { label: 'postgresql', health: 'healthy', reqRate: '—' } },
  ],
  edges: [
    { id: 'e-in-app', source: 'svc-ingress', target: 'svc-app', type: 'animated', style: { stroke: '#22c55e' } },
    { id: 'e-app-db', source: 'svc-app', target: 'svc-db', type: 'smoothstep' },
  ],
}

export function getServiceMap(envId: string): ServiceMapDef {
  return serviceMaps[envId] || defaultMap
}
