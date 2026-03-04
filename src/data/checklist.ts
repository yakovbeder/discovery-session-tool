export interface Question {
  key: string;
  topic: string;
  question: string;
  isCustom?: boolean;
}

export interface Section {
  id: string;
  title: string;
  questions: Question[];
  isCustom?: boolean;
}

export interface StoredData {
  timestamp: string;
  version: string;
  documentTitle?: string;
  documentSubtitle?: string;
  generatorSections?: Section[];
  sections: Record<string, Record<string, string>>;
  customSections?: Section[];
  customQuestions?: Record<string, Question[]>;
  skippedSections?: string[];
}

export const DEFAULT_TITLE = 'OpenShift Discovery Session Checklist';
export const DEFAULT_SUBTITLE =
  'Complete discovery session checklist for OpenShift deployment planning';

export function formatSectionNum(sectionIdx: number): string {
  return `${sectionIdx + 1}`;
}

export function formatQuestionNum(
  sectionIdx: number,
  questionIdx: number,
): string {
  return `${sectionIdx + 1}.${questionIdx + 1}`;
}

export function formatSectionTitle(sectionIdx: number, title: string): string {
  return `${sectionIdx + 1}. ${title}`;
}

export const checklist: Section[] = [
  {
    id: '1.0',
    title: 'Project Scope & Cluster Usage',
    questions: [
      {
        key: '1.1',
        topic: 'Cluster Usage',
        question: 'How many distinct OpenShift clusters are required?',
      },
      {
        key: '1.2',
        topic: 'Cluster Usage',
        question:
          'What is the designated purpose for each cluster (e.g., Non-Production, Production, Management, etc.)?',
      },
    ],
  },
  {
    id: '2.0',
    title: 'Platform Architecture & Design',
    questions: [
      {
        key: '2.1',
        topic: 'Installation',
        question: 'Which installation method will be used: IPI or UPI?',
      },
      {
        key: '2.2',
        topic: 'OCP Version',
        question:
          'What is the target OCP version? (if it differs between clusters, please specify for each)',
      },
      {
        key: '2.3',
        topic: 'Composition',
        question:
          'What is the mix of node types (VMs, Bare-Metal) and their roles (Master, Worker, Infra)?',
      },
      {
        key: '2.4',
        topic: 'Node Breakdown',
        question:
          'What is the planned number of nodes per cluster? Will dedicated infra nodes be used?',
      },
      {
        key: '2.5',
        topic: 'HA & etcd',
        question:
          'Can we confirm high-performance disks (SSDs/NVMe) will be available for etcd on Master nodes?',
      },
    ],
  },
  {
    id: '3.0',
    title: 'Hardware & Operating System',
    questions: [
      {
        key: '3.1',
        topic: 'Hardware',
        question: 'What are the expectations for future hardware growth?',
      },
      {
        key: '3.2',
        topic: 'OS',
        question:
          'Are stakeholders familiar with RHCOS as the immutable OS for cluster nodes?',
      },
      {
        key: '3.3',
        topic: 'OS',
        question: 'What RHEL version will be used for the bastion server?',
      },
    ],
  },
  {
    id: '4.0',
    title: 'Networking & Load Balancing',
    questions: [
      {
        key: '4.1',
        topic: 'Core Networking',
        question:
          'Any non-default SDN network needs to avoid overlap? (e.g., default Pods: 10.128.0.0/14, Services: 172.30.0.0/16)',
      },
      {
        key: '4.2',
        topic: 'DNS',
        question:
          'Proposed cluster domain names? DNS server type (Windows/Linux)?',
      },
      {
        key: '4.3',
        topic: 'Ingress',
        question:
          'TLS termination is preferred at the OCP route level. Are other methods required (e.g., re-encrypt at the application level)?',
      },
      {
        key: '4.4',
        topic: 'Load Balancing',
        question: 'What are the Load Balancing options to be considered?',
      },
      {
        key: '4.5',
        topic: 'Egress',
        question:
          'Do applications need to connect to external components (e.g., DB)?',
      },
    ],
  },
  {
    id: '5.0',
    title: 'Storage Architecture',
    questions: [
      {
        key: '5.1',
        topic: 'Persistent Storage',
        question:
          'What storage is available (e.g., NetApp)? Will ODF be required? Is S3 compatibility needed?',
      },
    ],
  },
  {
    id: '6.0',
    title: 'Security & Compliance',
    questions: [
      {
        key: '6.1',
        topic: 'Authentication',
        question:
          'Which identity provider will be integrated (LDAP (AD) / LDAPS / SSO)?',
      },
      {
        key: '6.2',
        topic: 'Authorization',
        question:
          'How will authorization be managed (Local users, AD users/groups, RBAC)?',
      },
      {
        key: '6.3',
        topic: 'Network Policies',
        question:
          'What is the strategy for implementing Network Policies for traffic segmentation?',
      },
      {
        key: '6.4',
        topic: 'Hardening',
        question:
          'Are there specific security benchmarks to follow? If so, is the Compliance Operator needed?',
      },
      {
        key: '6.5',
        topic: 'Security Tooling',
        question:
          'Is there a plan to integrate tools like Red Hat Advanced Cluster Security (ACS)?',
      },
      {
        key: '6.6',
        topic: 'Service Mesh',
        question: 'Is Service Mesh required for mTLS?',
      },
    ],
  },
  {
    id: '7.0',
    title: 'Image Management',
    questions: [
      {
        key: '7.1',
        topic: 'Installation Type',
        question:
          'What is the type of installation (disconnected / connected)?',
      },
      {
        key: '7.2',
        topic: 'Image Registry',
        question:
          'What is the image registry strategy (e.g., local on bastion, external Quay/JFrog/Harbor)?',
      },
    ],
  },
  {
    id: '8.0',
    title: 'Observability (Monitoring & Logging)',
    questions: [
      {
        key: '8.1',
        topic: 'Monitoring',
        question:
          'Discussion of built-in monitoring capabilities. Is user workload monitoring needed? What are the alert destinations (e.g., alert forwarding)?',
      },
      {
        key: '8.2',
        topic: 'Logging',
        question:
          'Discussion of Cluster Logging components (Loki/Vector). Is there a need to forward logs?',
      },
      {
        key: '8.3',
        topic: 'Tracing',
        question:
          'Is distributed tracing required (e.g., Tempo, Jaeger)?',
      },
    ],
  },
  {
    id: '9.0',
    title: 'Platform Operations & Lifecycle',
    questions: [
      {
        key: '9.1',
        topic: 'Node Management',
        question: 'Procedures for adding/removing/replacing nodes',
      },
      {
        key: '9.2',
        topic: 'Upgrades',
        question:
          'What is the strategy for managing cluster upgrades and platform lifecycle?',
      },
      {
        key: '9.3',
        topic: 'NTP',
        question:
          'Can we confirm a reliable internal NTP source is available for all nodes?',
      },
      {
        key: '9.4',
        topic: 'Backup/Restore',
        question:
          'What is the strategy for backup and restore (etcd, persistent data)? Which tools?',
      },
    ],
  },
  {
    id: '10.0',
    title: 'Automation & Integration',
    questions: [
      {
        key: '10.1',
        topic: 'CI/CD',
        question: 'Which existing CI/CD tools need to be integrated?',
      },
      {
        key: '10.2',
        topic: 'GitOps',
        question: 'Is there an existing GitOps practice in use?',
      },
      {
        key: '10.3',
        topic: 'Cluster Management',
        question:
          'Should a separate management cluster with ACM be considered?',
      },
    ],
  },
];

export const allQuestionKeys = checklist.flatMap((s) =>
  s.questions.map((q) => q.key),
);
