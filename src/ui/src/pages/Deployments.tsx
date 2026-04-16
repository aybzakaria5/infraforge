import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, X, Terminal } from 'lucide-react'
import { StatusDot } from '../components/shared/StatusDot'
import { Timestamp } from '../components/shared/Timestamp'
import { TableSkeleton } from '../components/shared/Skeleton'
import { PipelineFlow } from '../components/flow/PipelineFlow'
import { deployments, type Deployment } from '../mocks/deployments'
import {
  successPipelineNodes,
  successPipelineEdges,
  runningPipelineNodes,
  runningPipelineEdges,
  failedPipelineNodes,
  failedPipelineEdges,
} from '../mocks/pipeline'
import { relativeTime, formatDuration } from '../lib/time'

const statusStyle: Record<string, string> = {
  success: 'text-accent-primary bg-accent-primary/10',
  running: 'text-accent-info bg-accent-info/10',
  pending: 'text-accent-info bg-accent-info/10',
  failed: 'text-accent-danger bg-accent-danger/10',
  rollback: 'text-accent-warning bg-accent-warning/10',
}

// Map specific deployment IDs to pre-built pipelines
const pipelineMap: Record<string, { nodes: typeof successPipelineNodes; edges: typeof successPipelineEdges }> = {
  'dep-f1e2d3c400000001': { nodes: successPipelineNodes, edges: successPipelineEdges },
  'dep-f1e2d3c400000004': { nodes: runningPipelineNodes, edges: runningPipelineEdges },
  'dep-f1e2d3c400000007': { nodes: failedPipelineNodes, edges: failedPipelineEdges },
}

// Mock log lines per stage
const stageLogs: Record<string, string[]> = {
  git: [
    '$ git clone --depth 1 git@github.com:infraforge/api.git',
    'Cloning into /workspace...',
    'Receiving objects: 100% (142/142), done.',
    'Resolving deltas: 100% (87/87), done.',
    'HEAD is now at {sha}',
    '✓ Checkout complete',
  ],
  build: [
    '$ docker build -t {tag} --target production .',
    'Step 1/12 : FROM golang:1.22-alpine AS builder',
    'Step 2/12 : WORKDIR /app',
    'Step 3/12 : COPY go.mod go.sum ./',
    'Step 4/12 : RUN go mod download',
    '  → downloading github.com/jackc/pgx/v5@v5.9.1',
    '  → downloading github.com/prometheus/client_golang@v1.19.0',
    'Step 5/12 : COPY . .',
    'Step 6/12 : RUN CGO_ENABLED=0 go build -o /server ./cmd/server',
    'Step 7/12 : FROM gcr.io/distroless/static:nonroot',
    'Step 8/12 : COPY --from=builder /server /server',
    'Successfully built {tag}',
    '✓ Build complete — {size}',
  ],
  scan: [
    '$ trivy image --severity CRITICAL,HIGH {tag}',
    '',
    'infraforge-api:v1.4.2 (alpine 3.19.1)',
    '==========================================',
    'Total: {total} (CRITICAL: {critical}, HIGH: {high}, MEDIUM: {medium})',
    '',
    '✓ Scan complete',
  ],
  push: [
    '$ docker tag {tag} {registry}/{tag}',
    '$ docker push {registry}/{tag}',
    'The push refers to repository [{registry}]',
    'a1b2c3d4: Pushed',
    'e5f6a7b8: Layer already exists',
    'c9d0e1f2: Pushed',
    'latest: digest: sha256:abc123def456 size: 1234',
    '✓ Push complete',
  ],
  deploy: [
    '$ kubectl set image deployment/{env} app={tag} -n {ns}',
    'deployment.apps/{env} image updated',
    'Waiting for rollout to finish: 1 old replicas are pending termination...',
    'Waiting for rollout to finish: 1 old replicas are pending termination...',
    'deployment "{env}" successfully rolled out',
    '✓ Deploy complete',
  ],
  verify: [
    '$ curl -sf {endpoint}',
    'HTTP/1.1 200 OK',
    'Content-Type: application/json',
    '',
    '{"status":"ok","version":"{tag}"}',
    '',
    'Response time: {rtime}ms',
    '✓ Health check passed',
  ],
}

function getLogsForStage(stage: string, dep: Deployment): string[] {
  const lines = stageLogs[stage] || ['No logs available.']
  return lines.map(l =>
    l
      .replace('{sha}', dep.commit_sha.slice(0, 7))
      .replace('{tag}', dep.image_tag)
      .replace(/\{registry\}/g, '123456789012.dkr.ecr.us-east-1.amazonaws.com')
      .replace('{env}', dep.environment_name)
      .replace('{ns}', dep.environment_name)
      .replace('{endpoint}', 'https://api.infraforge.dev/healthz')
      .replace('{rtime}', '23')
      .replace('{total}', String(dep.vulnerabilities))
      .replace('{critical}', '0')
      .replace('{high}', '0')
      .replace('{medium}', String(dep.vulnerabilities))
      .replace('{size}', '48.2 MB')
  )
}

function LogPanel({
  stage,
  dep,
  onClose,
}: {
  stage: string
  dep: Deployment
  onClose: () => void
}) {
  const stageData = dep.stages.find(s => s.name === stage)
  const logs = getLogsForStage(stage, dep)

  return (
    <div className="fixed top-0 right-0 z-50 h-full w-[440px] bg-bg-secondary border-l border-border-default
      flex flex-col shadow-[-4px_0_12px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-default">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-text-tertiary" />
          <span className="text-[13px] font-medium text-text-primary capitalize">{stage}</span>
          {stageData && (
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium
              ${statusStyle[stageData.status] || ''}`}>
              <StatusDot status={stageData.status} size={4} />
              {stageData.status}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-text-tertiary hover:text-text-primary transition-colors">
          <X size={16} />
        </button>
      </div>

      {stageData && (
        <div className="flex items-center gap-4 px-4 py-2 border-b border-border-default text-[11px] text-text-tertiary">
          <span>Duration: <span className="font-mono text-text-secondary">{formatDuration(stageData.duration_sec)}</span></span>
          {stageData.started_at && (
            <span>Started: <span className="font-mono text-text-secondary">{relativeTime(stageData.started_at)}</span></span>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 bg-bg-primary">
        <pre className="font-mono text-[11px] leading-[1.6] text-text-secondary whitespace-pre-wrap">
          {logs.map((line, i) => (
            <div key={i} className={
              line.startsWith('✓') ? 'text-accent-primary' :
              line.startsWith('$') ? 'text-text-primary' :
              line.startsWith('✗') || line.includes('CRITICAL') ? 'text-accent-danger' :
              ''
            }>
              {line || '\u00A0'}
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
}

function DeploymentDetail({
  dep,
  onBack,
}: {
  dep: Deployment
  onBack: () => void
}) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null)

  const pipeline = useMemo(() => {
    if (pipelineMap[dep.id]) return pipelineMap[dep.id]
    // For deployments without a pre-built pipeline, use the success one as fallback
    return { nodes: successPipelineNodes, edges: successPipelineEdges }
  }, [dep.id])

  const handleNodeClick = (nodeId: string) => {
    // Extract stage name from the node data
    const node = pipeline.nodes.find(n => n.id === nodeId)
    if (node?.data?.stage) {
      setSelectedStage(node.data.stage as string)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[12px] text-text-tertiary hover:text-text-secondary transition-colors"
        >
          <ChevronLeft size={14} />
          Back
        </button>
        <div className="h-4 w-px bg-border-default" />
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium
          ${statusStyle[dep.status] || ''}`}>
          <StatusDot status={dep.status} size={5} />
          {dep.status}
        </span>
        <span className="font-mono text-[13px] text-text-primary">{dep.environment_name}</span>
        <span className="text-[11px] text-text-tertiary">·</span>
        <span className="font-mono text-[12px] text-accent-info">{dep.commit_sha.slice(0, 7)}</span>
      </div>

      {/* Metadata row */}
      <div className="flex items-center gap-4 text-[12px] text-text-tertiary border border-border-default rounded-md bg-bg-secondary px-3 py-2">
        <span>Author: <span className="text-text-secondary">{dep.author}</span></span>
        <span>Image: <span className="font-mono text-text-secondary">{dep.image_tag}</span></span>
        <span>Strategy: <span className="text-text-secondary">{dep.strategy}</span></span>
        {dep.duration_sec > 0 && (
          <span>Duration: <span className="font-mono text-text-secondary">{formatDuration(dep.duration_sec)}</span></span>
        )}
        <Timestamp iso={dep.created_at} className="text-text-tertiary" />
      </div>

      {/* Pipeline */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] text-text-tertiary uppercase tracking-wide">Pipeline</span>
        <PipelineFlow
          nodes={pipeline.nodes}
          edges={pipeline.edges}
          onNodeClick={handleNodeClick}
        />
        <span className="text-[10px] text-text-tertiary">Click a stage to view logs</span>
      </div>

      {/* Commit message */}
      <div className="border border-border-default rounded-md bg-bg-secondary px-3 py-2">
        <span className="text-[11px] text-text-tertiary uppercase tracking-wide">Commit Message</span>
        <p className="text-[13px] text-text-secondary mt-1">{dep.commit_message}</p>
      </div>

      {/* Log panel */}
      {selectedStage && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setSelectedStage(null)} />
          <LogPanel stage={selectedStage} dep={dep} onClose={() => setSelectedStage(null)} />
        </>
      )}
    </div>
  )
}

export default function Deployments() {
  const [selected, setSelected] = useState<Deployment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  if (selected) {
    return <DeploymentDetail dep={selected} onBack={() => setSelected(null)} />
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-text-tertiary">{deployments.length} deployments</span>
      </div>

      <div className="border border-border-default rounded-md bg-bg-secondary overflow-x-auto">
        <table className="w-full text-[13px] min-w-[800px]">
          <thead>
            <tr className="border-b border-border-default text-text-tertiary text-[11px] uppercase tracking-wide">
              <th className="text-left px-3 py-1.5 font-normal">Status</th>
              <th className="text-left px-3 py-1.5 font-normal">Environment</th>
              <th className="text-left px-3 py-1.5 font-normal">Commit</th>
              <th className="text-left px-3 py-1.5 font-normal">Author</th>
              <th className="text-left px-3 py-1.5 font-normal">Strategy</th>
              <th className="text-left px-3 py-1.5 font-normal">Vulns</th>
              <th className="text-right px-3 py-1.5 font-normal">Duration</th>
              <th className="text-right px-3 py-1.5 font-normal">When</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <TableSkeleton rows={6} cols={8} /> : deployments.map(dep => (
              <tr
                key={dep.id}
                onClick={() => setSelected(dep)}
                className="border-b border-border-default last:border-0 hover:bg-bg-tertiary
                  transition-colors duration-150 cursor-pointer"
              >
                <td className="px-3 py-1.5">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium
                    ${statusStyle[dep.status] || ''}`}>
                    <StatusDot status={dep.status} size={5} />
                    {dep.status}
                  </span>
                </td>
                <td className="px-3 py-1.5 font-mono text-text-primary">{dep.environment_name}</td>
                <td className="px-3 py-1.5">
                  <div className="flex flex-col">
                    <span className="font-mono text-text-secondary">{dep.commit_sha.slice(0, 7)}</span>
                    <span className="text-[11px] text-text-tertiary truncate max-w-[220px]">{dep.commit_message}</span>
                  </div>
                </td>
                <td className="px-3 py-1.5 text-text-tertiary">{dep.author}</td>
                <td className="px-3 py-1.5 text-text-tertiary">{dep.strategy}</td>
                <td className="px-3 py-1.5">
                  {dep.vulnerabilities > 0 ? (
                    <span className="font-mono text-accent-warning">{dep.vulnerabilities}</span>
                  ) : (
                    <span className="font-mono text-text-tertiary">0</span>
                  )}
                </td>
                <td className="px-3 py-1.5 text-right font-mono text-text-secondary">
                  {dep.duration_sec > 0 ? formatDuration(dep.duration_sec) : '—'}
                </td>
                <td className="px-3 py-1.5 text-right">
                  <Timestamp iso={dep.created_at} className="text-text-tertiary" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
