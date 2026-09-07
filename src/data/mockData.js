export const domains = [
  'Agriculture',
  'Healthcare',
  'Water Management',
  'Education',
  'Environment',
  'Sanitation',
  'Accessibility',
  'Energy',
  'Urban Development',
  'Rural Livelihoods',
]

export const statusConfig = {
  SUBMITTED: { label: 'Submitted', tone: 'neutral' },
  UNDER_REVIEW: { label: 'Under Review', tone: 'warning' },
  VALIDATED: { label: 'Validated', tone: 'info' },
  MATCHING: { label: 'Matching', tone: 'purple' },
  ASSIGNED: { label: 'Assigned', tone: 'primary' },
  IN_PROGRESS: { label: 'In Progress', tone: 'success' },
  COMPLETED: { label: 'Completed', tone: 'success' },
  DEPLOYED: { label: 'Deployed', tone: 'dark' },
  REJECTED: { label: 'Rejected', tone: 'danger' },
}

export const districts = ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Hazaribagh', 'Giridih', 'Khunti', 'Bokaro', 'Ramgarh']

export const universities = [
  {
    id: 1,
    name: 'NIT Jamshedpur',
    district: 'Jamshedpur',
    expertise: ['Water Management', 'IoT', 'Sustainable Infrastructure'],
    matchScore: 92,
    reason: 'Strong water resources and IoT expertise',
  },
  {
    id: 2,
    name: 'BIT Mesra',
    district: 'Ranchi',
    expertise: ['Agriculture', 'Rural Innovation', 'Data Systems'],
    matchScore: 89,
    reason: 'Excellent rural livelihoods and agriculture research',
  },
  {
    id: 3,
    name: 'RVS College of Engineering & Technology',
    district: 'Jamshedpur',
    expertise: ['Healthcare', 'Smart Cities', 'Energy'],
    matchScore: 86,
    reason: 'Relevant mentoring experience for smart civic systems',
  },
  {
    id: 4,
    name: 'Guru Gobind Singh Educational Society College',
    district: 'Bokaro',
    expertise: ['Sanitation', 'Environment', 'Water Management'],
    matchScore: 83,
    reason: 'Strong community-led sanitation and environment projects',
  },
]

export const mockChallenges = [
  {
    id: 'CH-2041',
    title: 'Irregular drinking water supply in rural Ranchi',
    description:
      'Villages in the Angara block face intermittent water flow, low storage capacity, and high dependence on unreliable tankers. The challenge affects daily health, sanitation, and agricultural productivity.',
    domain: 'Water Management',
    district: 'Ranchi',
    block: 'Angara',
    locality: 'Kusmi Pahari',
    priority: 'High',
    status: 'UNDER_REVIEW',
    severity: 'High',
    urgency: 'Immediate',
    affectedPeople: 4200,
    submittedDate: '2026-08-22',
    location: { lat: 23.3607, lng: 85.3131 },
    evidence: ['water-supply-map.png', 'community-survey.pdf', 'field-video.mp4'],
    aiAnalysis: {
      category: 'Water Management',
      confidence: 94,
      priority: 'High',
      duplicateStatus: 'No',
    },
    recommendedUniversities: universities,
  },
  {
    id: 'CH-2048',
    title: 'Low-cost maternal healthcare screening in remote blocks',
    description:
      'Women in remote areas lack regular screening for anemia, blood pressure, and pregnancy complications, leading to delayed intervention and higher health risk.',
    domain: 'Healthcare',
    district: 'Giridih',
    block: 'Tisri',
    locality: 'Kharaband',
    priority: 'Medium',
    status: 'VALIDATED',
    severity: 'Medium',
    urgency: 'Planned',
    affectedPeople: 1800,
    submittedDate: '2026-08-14',
    location: { lat: 24.1805, lng: 86.2936 },
    evidence: ['health-report.pdf'],
    aiAnalysis: {
      category: 'Healthcare',
      confidence: 88,
      priority: 'Medium',
      duplicateStatus: 'No',
    },
    recommendedUniversities: [universities[2], universities[3]],
  },
  {
    id: 'CH-2051',
    title: 'Smart irrigation and crop advisory for tribal farmers',
    description:
      'Smallholder farmers need climate-responsive crop guidance and affordable irrigation support to reduce crop losses and improve income resilience.',
    domain: 'Agriculture',
    district: 'Khunti',
    block: 'Murhu',
    locality: 'Tamar',
    priority: 'High',
    status: 'ASSIGNED',
    severity: 'High',
    urgency: 'Urgent',
    affectedPeople: 3100,
    submittedDate: '2026-07-28',
    location: { lat: 23.0593, lng: 85.2856 },
    evidence: ['soil-sample.png'],
    aiAnalysis: {
      category: 'Agriculture',
      confidence: 91,
      priority: 'High',
      duplicateStatus: 'No',
    },
    recommendedUniversities: [universities[1], universities[0]],
  },
]

export const projects = [
  {
    id: 'PRJ-101',
    name: 'WaterGrid for Rural Ranchi',
    challengeId: 'CH-2041',
    challengeTitle: 'Irregular drinking water supply in rural Ranchi',
    university: 'NIT Jamshedpur',
    status: 'IN_PROGRESS',
    progress: 64,
    industryPartner: 'Jharkhand GreenTech',
    deadline: '2026-11-15',
    startDate: '2026-08-01',
    expectedCompletion: '2026-12-20',
    domain: 'Water Management',
    stages: ['Research', 'Prototype', 'Testing', 'Pilot', 'Deployment'],
    milestones: [
      { name: 'Research', status: 'done', description: 'Baseline survey and demand mapping', dueDate: '2026-08-15', progress: 100 },
      { name: 'Prototype', status: 'done', description: 'IoT enabled supply monitoring prototype', dueDate: '2026-09-02', progress: 100 },
      { name: 'Testing', status: 'active', description: 'Pilot validation in selected villages', dueDate: '2026-10-10', progress: 72 },
      { name: 'Pilot', status: 'pending', description: 'Deploy field-sensing and analytics', dueDate: '2026-11-18', progress: 18 },
      { name: 'Deployment', status: 'pending', description: 'Scalable rollout for district clusters', dueDate: '2026-12-20', progress: 0 },
    ],
  },
  {
    id: 'PRJ-104',
    name: 'Arogya Connect',
    challengeId: 'CH-2048',
    challengeTitle: 'Low-cost maternal healthcare screening in remote blocks',
    university: 'RVS College of Engineering & Technology',
    status: 'ACTIVE',
    progress: 48,
    industryPartner: 'CareNest Health',
    deadline: '2026-10-30',
    startDate: '2026-07-12',
    expectedCompletion: '2026-11-18',
    domain: 'Healthcare',
    stages: ['Research', 'Prototype', 'Testing', 'Pilot', 'Deployment'],
    milestones: [
      { name: 'Research', status: 'done', description: 'Community risk mapping', dueDate: '2026-07-30', progress: 100 },
      { name: 'Prototype', status: 'done', description: 'Mobile screening workflow', dueDate: '2026-08-18', progress: 100 },
      { name: 'Testing', status: 'active', description: 'Pilot at CHC centres', dueDate: '2026-09-22', progress: 68 },
      { name: 'Pilot', status: 'pending', description: 'Digital dashboards and referral loops', dueDate: '2026-10-15', progress: 24 },
      { name: 'Deployment', status: 'pending', description: 'Block-level roll-out', dueDate: '2026-11-18', progress: 0 },
    ],
  },
]

export const governmentStats = {
  totalChallenges: 128,
  activeChallenges: 46,
  resolvedChallenges: 29,
  activeProjects: 38,
  universitiesParticipating: 24,
  industryPartners: 42,
  solutionsDeployed: 12,
  peopleBenefited: 186400,
}

export const challengeDensity = [
  { district: 'Ranchi', value: 28 },
  { district: 'Jamshedpur', value: 19 },
  { district: 'Dhanbad', value: 15 },
  { district: 'Bokaro', value: 14 },
  { district: 'Hazaribagh', value: 11 },
  { district: 'Khunti', value: 9 },
  { district: 'Ramgarh', value: 7 },
  { district: 'Giridih', value: 13 },
]

export const dashboardCards = [
  { label: 'Total submitted challenges', value: 12, change: '+18%' },
  { label: 'Under review', value: 4, change: '+2' },
  { label: 'In progress', value: 6, change: '+12%' },
  { label: 'Resolved', value: 2, change: '+5%' },
]

export const userRoles = {
  CITIZEN: 'Citizen',
  HEI_ADMIN: 'University',
  FACULTY: 'Faculty',
  INDUSTRY: 'Industry',
  GOVERNMENT: 'Government',
  ADMIN: 'Admin',
}

export const mockUsers = {
  citizen: {
    id: 100,
    name: 'Asha Kumari',
    email: 'citizen@sihportal.in',
    role: 'CITIZEN',
    avatar: 'AK',
  },
  university: {
    id: 101,
    name: 'NIT Jamshedpur',
    email: 'admin@nitjsr.ac.in',
    role: 'HEI_ADMIN',
    avatar: 'NIT',
  },
  faculty: {
    id: 102,
    name: 'Dr. Neelam Sinha',
    email: 'faculty@nitjsr.ac.in',
    role: 'FACULTY',
    avatar: 'NS',
  },
  industry: {
    id: 103,
    name: 'Jharkhand GreenTech',
    email: 'partnership@greentech.in',
    role: 'INDUSTRY',
    avatar: 'JG',
  },
  government: {
    id: 104,
    name: 'State Innovation Cell',
    email: 'admin@jharinnovate.in',
    role: 'GOVERNMENT',
    avatar: 'SI',
  },
}
