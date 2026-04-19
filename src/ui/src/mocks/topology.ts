import type { Node, Edge } from '@xyflow/react'

export interface InfraNodeData {
  label: string
  type: 'vpc' | 'subnet' | 'eks' | 'rds' | 's3' | 'alb' | 'ecr' | 'iam' | 'kms' | 'route53' | 'nat'
  status: 'healthy' | 'warning' | 'error'
  arn?: string
  cost?: string
  module?: string
  detail?: string
  [key: string]: unknown
}

// --- VPC group node (parent) ---
const vpcNode: Node<InfraNodeData> = {
  id: 'vpc-0a1b2c3d4e5f',
  type: 'vpc',
  position: { x: 0, y: 0 },
  data: {
    label: 'vpc-0a1b2c3d4e5f — infraforge-prod',
    type: 'vpc',
    status: 'healthy',
    arn: 'arn:aws:ec2:us-east-1:123456789012:vpc/vpc-0a1b2c3d4e5f',
    cost: '$32.40/mo',
    module: 'terraform/modules/vpc',
    detail: '10.0.0.0/16 · 3 AZs · Flow logs enabled',
  },
  style: { width: 920, height: 520 },
}

// --- Subnets (children of VPC) ---
const subnetNodes: Node<InfraNodeData>[] = [
  {
    id: 'subnet-pub-1a',
    type: 'service',
    position: { x: 40, y: 60 },
    parentId: 'vpc-0a1b2c3d4e5f',
    extent: 'parent' as const,
    data: {
      label: 'subnet-prod-public-us-east-1a',
      type: 'subnet',
      status: 'healthy',
      arn: 'arn:aws:ec2:us-east-1:123456789012:subnet/subnet-pub-1a',
      module: 'terraform/modules/vpc',
      detail: '10.0.1.0/24 · Public · us-east-1a',
    },
  },
  {
    id: 'subnet-pub-1b',
    type: 'service',
    position: { x: 320, y: 60 },
    parentId: 'vpc-0a1b2c3d4e5f',
    extent: 'parent' as const,
    data: {
      label: 'subnet-prod-public-us-east-1b',
      type: 'subnet',
      status: 'healthy',
      arn: 'arn:aws:ec2:us-east-1:123456789012:subnet/subnet-pub-1b',
      module: 'terraform/modules/vpc',
      detail: '10.0.2.0/24 · Public · us-east-1b',
    },
  },
  {
    id: 'subnet-pub-1c',
    type: 'service',
    position: { x: 600, y: 60 },
    parentId: 'vpc-0a1b2c3d4e5f',
    extent: 'parent' as const,
    data: {
      label: 'subnet-prod-public-us-east-1c',
      type: 'subnet',
      status: 'healthy',
      arn: 'arn:aws:ec2:us-east-1:123456789012:subnet/subnet-pub-1c',
      module: 'terraform/modules/vpc',
      detail: '10.0.3.0/24 · Public · us-east-1c',
    },
  },
  {
    id: 'subnet-priv-1a',
    type: 'service',
    position: { x: 40, y: 180 },
    parentId: 'vpc-0a1b2c3d4e5f',
    extent: 'parent' as const,
    data: {
      label: 'subnet-prod-private-us-east-1a',
      type: 'subnet',
      status: 'healthy',
      arn: 'arn:aws:ec2:us-east-1:123456789012:subnet/subnet-priv-1a',
      module: 'terraform/modules/vpc',
      detail: '10.0.10.0/24 · Private · us-east-1a',
    },
  },
  {
    id: 'subnet-priv-1b',
    type: 'service',
    position: { x: 320, y: 180 },
    parentId: 'vpc-0a1b2c3d4e5f',
    extent: 'parent' as const,
    data: {
      label: 'subnet-prod-private-us-east-1b',
      type: 'subnet',
      status: 'healthy',
      arn: 'arn:aws:ec2:us-east-1:123456789012:subnet/subnet-priv-1b',
      module: 'terraform/modules/vpc',
      detail: '10.0.11.0/24 · Private · us-east-1b',
    },
  },
  {
    id: 'subnet-priv-1c',
    type: 'service',
    position: { x: 600, y: 180 },
    parentId: 'vpc-0a1b2c3d4e5f',
    extent: 'parent' as const,
    data: {
      label: 'subnet-prod-private-us-east-1c',
      type: 'subnet',
      status: 'healthy',
      arn: 'arn:aws:ec2:us-east-1:123456789012:subnet/subnet-priv-1c',
      module: 'terraform/modules/vpc',
      detail: '10.0.12.0/24 · Private · us-east-1c',
    },
  },
  // NAT Gateway
  {
    id: 'nat-gw-01',
    type: 'service',
    position: { x: 40, y: 310 },
    parentId: 'vpc-0a1b2c3d4e5f',
    extent: 'parent' as const,
    data: {
      label: 'nat-0a1b2c3d4e5f',
      type: 'nat',
      status: 'healthy',
      arn: 'arn:aws:ec2:us-east-1:123456789012:natgateway/nat-0a1b2c3d4e5f',
      cost: '$45.00/mo',
      module: 'terraform/modules/vpc',
      detail: 'Elastic IP · us-east-1a',
    },
  },
]

// --- Services outside VPC (or logically connected) ---
const serviceNodes: Node<InfraNodeData>[] = [
  {
    id: 'alb-infraforge-prod',
    type: 'service',
    position: { x: 100, y: -120 },
    data: {
      label: 'alb-infraforge-prod',
      type: 'alb',
      status: 'healthy',
      arn: 'arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/alb-infraforge-prod/a1b2c3d4e5f6',
      cost: '$22.50/mo',
      module: 'terraform/modules/eks',
      detail: 'Application LB · 3 target groups · HTTPS:443',
    },
  },
  {
    id: 'route53-infraforge',
    type: 'service',
    position: { x: 500, y: -120 },
    data: {
      label: 'infraforge.dev',
      type: 'route53',
      status: 'healthy',
      arn: 'arn:aws:route53:::hostedzone/Z0123456789ABCDEF',
      cost: '$0.50/mo',
      module: 'terraform/modules/vpc',
      detail: 'Hosted zone · 12 records · ALIAS → ALB',
    },
  },
  {
    id: 'eks-infraforge-prod',
    type: 'service',
    position: { x: 200, y: 600 },
    data: {
      label: 'eks-infraforge-prod',
      type: 'eks',
      status: 'healthy',
      arn: 'arn:aws:eks:us-east-1:123456789012:cluster/infraforge-prod',
      cost: '$73.00/mo',
      module: 'terraform/modules/eks',
      detail: 'v1.29 · 3 nodes (t3.large) · Managed node group · IRSA enabled',
    },
  },
  {
    id: 'rds-infraforge-prod',
    type: 'service',
    position: { x: 600, y: 600 },
    data: {
      label: 'infraforge-prod-db',
      type: 'rds',
      status: 'healthy',
      arn: 'arn:aws:rds:us-east-1:123456789012:db:infraforge-prod-db',
      cost: '$48.20/mo',
      module: 'terraform/modules/rds',
      detail: 'PostgreSQL 15.4 · db.t3.medium · Multi-AZ · 100 GiB gp3',
    },
  },
  {
    id: 'ecr-infraforge',
    type: 'service',
    position: { x: -150, y: 750 },
    data: {
      label: 'ecr-infraforge',
      type: 'ecr',
      status: 'healthy',
      arn: 'arn:aws:ecr:us-east-1:123456789012:repository/infraforge',
      cost: '$2.10/mo',
      module: 'terraform/modules/ecr',
      detail: '2 repositories · 34 images · Lifecycle: keep last 10',
    },
  },
  {
    id: 's3-infraforge-artifacts',
    type: 'service',
    position: { x: 550, y: 750 },
    data: {
      label: 'infraforge-artifacts-prod',
      type: 's3',
      status: 'healthy',
      arn: 'arn:aws:s3:::infraforge-artifacts-prod',
      cost: '$1.84/mo',
      module: 'terraform/modules/s3',
      detail: 'Versioned · SSE-S3 · Lifecycle: 90d → IA, 365d → Glacier',
    },
  },
  {
    id: 's3-infraforge-tfstate',
    type: 'service',
    position: { x: 850, y: 750 },
    data: {
      label: 'infraforge-tfstate-prod',
      type: 's3',
      status: 'healthy',
      arn: 'arn:aws:s3:::infraforge-tfstate-prod',
      cost: '$0.12/mo',
      module: 'terraform/environments/aws',
      detail: 'Versioned · SSE-S3 · DynamoDB lock table',
    },
  },
]

// --- Security / IAM nodes ---
const securityNodes: Node<InfraNodeData>[] = [
  {
    id: 'iam-eks-cluster-role',
    type: 'security',
    position: { x: -150, y: 500 },
    data: {
      label: 'infraforge-eks-cluster-role',
      type: 'iam',
      status: 'healthy',
      arn: 'arn:aws:iam::123456789012:role/infraforge-eks-cluster-role',
      module: 'terraform/modules/iam',
      detail: 'AmazonEKSClusterPolicy · AmazonEKSServicePolicy',
    },
  },
  {
    id: 'iam-eks-node-role',
    type: 'security',
    position: { x: -150, y: 620 },
    data: {
      label: 'infraforge-eks-node-role',
      type: 'iam',
      status: 'healthy',
      arn: 'arn:aws:iam::123456789012:role/infraforge-eks-node-role',
      module: 'terraform/modules/iam',
      detail: 'AmazonEKSWorkerNodePolicy · AmazonEKS_CNI_Policy · AmazonEC2ContainerRegistryReadOnly',
    },
  },
  {
    id: 'kms-infraforge',
    type: 'security',
    position: { x: 900, y: 600 },
    data: {
      label: 'infraforge-kms-key',
      type: 'kms',
      status: 'healthy',
      arn: 'arn:aws:kms:us-east-1:123456789012:key/mrk-a1b2c3d4e5f6',
      cost: '$1.00/mo',
      module: 'terraform/modules/eks',
      detail: 'Symmetric · EKS secrets encryption · Auto-rotation enabled',
    },
  },
]

export const topologyNodes: Node<InfraNodeData>[] = [
  vpcNode,
  ...subnetNodes,
  ...serviceNodes,
  ...securityNodes,
]

export const topologyEdges: Edge[] = [
  // Route53 → ALB (active traffic)
  { id: 'e-r53-alb', source: 'route53-infraforge', target: 'alb-infraforge-prod', type: 'animated', style: { stroke: '#22c55e' } },

  // ALB → public subnets
  { id: 'e-alb-pub1a', source: 'alb-infraforge-prod', target: 'subnet-pub-1a', type: 'smoothstep' },
  { id: 'e-alb-pub1b', source: 'alb-infraforge-prod', target: 'subnet-pub-1b', type: 'smoothstep' },
  { id: 'e-alb-pub1c', source: 'alb-infraforge-prod', target: 'subnet-pub-1c', type: 'smoothstep' },

  // Public subnets → private subnets (security boundary)
  { id: 'e-pub1a-priv1a', source: 'subnet-pub-1a', target: 'subnet-priv-1a', type: 'dashed' },
  { id: 'e-pub1b-priv1b', source: 'subnet-pub-1b', target: 'subnet-priv-1b', type: 'dashed' },
  { id: 'e-pub1c-priv1c', source: 'subnet-pub-1c', target: 'subnet-priv-1c', type: 'dashed' },

  // Private subnets → NAT gateway
  { id: 'e-priv1a-nat', source: 'subnet-priv-1a', target: 'nat-gw-01', type: 'smoothstep' },

  // ALB → EKS (active traffic)
  { id: 'e-alb-eks', source: 'alb-infraforge-prod', target: 'eks-infraforge-prod', type: 'animated', style: { stroke: '#22c55e' } },

  // EKS → RDS (active traffic)
  { id: 'e-eks-rds', source: 'eks-infraforge-prod', target: 'rds-infraforge-prod', type: 'animated', style: { stroke: '#22c55e' } },

  // EKS → ECR (pulls images)
  { id: 'e-eks-ecr', source: 'eks-infraforge-prod', target: 'ecr-infraforge', type: 'smoothstep' },

  // EKS → S3 artifacts
  { id: 'e-eks-s3', source: 'eks-infraforge-prod', target: 's3-infraforge-artifacts', type: 'smoothstep' },

  // IAM → EKS (security links)
  { id: 'e-iam-cluster-eks', source: 'iam-eks-cluster-role', target: 'eks-infraforge-prod', type: 'dashed', label: 'cluster role' },
  { id: 'e-iam-node-eks', source: 'iam-eks-node-role', target: 'eks-infraforge-prod', type: 'dashed', label: 'node role' },

  // IAM node role → ECR (image pull)
  { id: 'e-iam-node-ecr', source: 'iam-eks-node-role', target: 'ecr-infraforge', type: 'dashed' },

  // KMS → EKS (encryption)
  { id: 'e-kms-eks', source: 'kms-infraforge', target: 'eks-infraforge-prod', type: 'dashed', label: 'encryption' },

  // KMS → RDS (encryption)
  { id: 'e-kms-rds', source: 'kms-infraforge', target: 'rds-infraforge-prod', type: 'dashed' },

  // RDS sits in private subnets
  { id: 'e-rds-priv1a', source: 'rds-infraforge-prod', target: 'subnet-priv-1a', type: 'dashed' },
  { id: 'e-rds-priv1b', source: 'rds-infraforge-prod', target: 'subnet-priv-1b', type: 'dashed' },
]
