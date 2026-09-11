import { DepartmentEvent, UserProfile, ApprovalTimelineRecord, RegistrationRecord, SystemNotification, AuditLogEntry, FeedbackRecord } from '../types';

export const DEMO_USERS: Record<string, UserProfile> = {
  faculty: {
    id: 'user-faculty-01',
    name: 'Faculty Coordinator (CSBS & IoT)',
    email: 'faculty.csbsiot@vignan.ac.in',
    role: 'FACULTY',
    departmentId: 'dept-csbsiot-vignan',
    departmentName: 'Department of CSBS & IoT',
    identifier: 'VUG-FAC-041',
    designation: 'Faculty Coordinator • Dept. of CSBS & IoT',
    avatarUrl: ''
  },
  hod: {
    id: 'user-hod-01',
    name: 'Head of Department (CSBS & IoT)',
    email: 'hod.csbsiot@vignan.ac.in',
    role: 'HOD',
    departmentId: 'dept-csbsiot-vignan',
    departmentName: 'Department of CSBS & IoT',
    identifier: 'VUG-HOD-01',
    designation: 'Head of Department (CSBS & IoT) • Statutory Review Authority',
    avatarUrl: ''
  },
  student: {
    id: 'user-student-01',
    name: 'Varun Maddu',
    email: 'student.varun@vignan.ac.in',
    role: 'STUDENT',
    departmentId: 'dept-csbsiot-vignan',
    departmentName: 'Department of CSBS & IoT',
    identifier: '221FA04001',
    designation: '3rd Year B.Tech CSBS & IoT (Roll: 221FA04001)',
    avatarUrl: ''
  },
  public: {
    id: 'user-public-01',
    name: 'University Guest / Visitor',
    email: 'visitor@vignan.ac.in',
    role: 'PUBLIC',
    departmentId: 'dept-all',
    departmentName: 'Vignan University Campus',
    identifier: 'VUG-VISITOR',
    designation: 'Prospective Student / Campus Visitor',
    avatarUrl: ''
  }
};

export const INITIAL_EVENTS: DepartmentEvent[] = [
  {
    id: 'EVT-GENAI-8841',
    title: 'Generative AI Workshop: From Prompting to Prototyping',
    shortDescription: 'Hands-on intensive workshop transitioning students from fundamental prompt engineering to building end-to-end autonomous agent workflows.',
    description: 'An intensive technical immersion into enterprise-grade Generative AI engineering. Designed for CSBS & IoT undergraduates, this program bridges transformer theory with production RAG implementations using pgvector and LangGraph orchestrations, fostering hands-on mastery over autonomous agentic workflows.',
    objectives: [
      'Demystify LLM tokenization, temperature, system conditioning, and vector embeddings through practical code sandboxes.',
      'Equip students to connect vector databases (pgvector/ChromaDB) with local embedding pipelines for verifiable semantic search.',
      'Deliver working knowledge of ethical AI parameters, academic integrity safeguards, and hallucination reduction strategies.'
    ],
    category: 'Workshop',
    eventType: 'Hands-on Technical Workshop',
    departmentId: 'dept-cse',
    departmentName: 'Department of CSBS & IoT',
    organizerId: 'user-faculty-01',
    organizerName: 'Faculty Coordinator (CSBS & IoT)',
    organizerContact: 'faculty.csbsiot@vignan.ac.in • Ext: 4192',
    organizerDesignation: 'Assoc. Professor • AI & Robotics Lab',
    posterUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
    date: '2026-09-18',
    startTime: '09:30',
    endTime: '13:00',
    venue: 'Turing Auditorium',
    locationDetails: 'Turing Hall, Gate 1 & 2 Main Tier-1 Lab Complex',
    capacity: 200,
    registeredCount: 184,
    registrationDeadline: '2026-09-17',
    registrationRequired: true,
    targetAudience: '2nd & 3rd Year B.Tech CSBS & IoT Undergraduates',
    eligibility: 'Basic proficiency in Python 3.10+ and foundational data structures.',
    participationInstructions: 'Bring personal laptop with Python 3.10+ installed and Git configured. Cloud sandbox tokens and API credentials will be provisioned directly at gate check-in.',
    externalLink: '',
    speaker: {
      name: 'Faculty Coordinator (AI Lab)',
      designation: 'Director, Campus AI & Autonomous Systems Research Lab',
      organization: 'Ex-Google Research Fellow • Carnegie Mellon Alum',
      bio: 'Dr. Jenkins holds a doctorate in Distributed Cognitive Systems from Carnegie Mellon. Her lab focuses on low-latency inference on edge silicon and provable alignment bounds for agent architectures.',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'
    },
    agenda: [
      {
        id: 'ag-1',
        time: '09:30 AM - 10:15 AM',
        sessionTitle: 'Keynote: Theoretical Foundations of Transformer Architectures',
        description: 'Attention layers, query-key vectors, self-attention matrices, and quantization benchmarks.',
        durationMinutes: 45
      },
      {
        id: 'ag-2',
        time: '10:15 AM - 11:30 AM',
        sessionTitle: 'Hands-on Sandbox: Prompt Chaining & Multi-agent Orchestration',
        description: 'Building modular pipelines using LangGraph and function-calling schemas in cloud notebooks.',
        durationMinutes: 75
      },
      {
        id: 'ag-3',
        time: '11:45 AM - 12:45 PM',
        sessionTitle: 'Building Production RAG with Vector Embeddings',
        description: 'Chunking university documentation, cosine indexing via pgvector, and hybrid keyword-vector reranking.',
        durationMinutes: 60
      },
      {
        id: 'ag-4',
        time: '12:45 PM - 01:00 PM',
        sessionTitle: 'Project Submission, Q&A, and Verified Digital Credential Issuance',
        description: 'Code artifact commit to GitHub Classroom, rapid gate scan checkout, and micro-credential verification.',
        durationMinutes: 15
      }
    ],
    requirements: {
      prerequisites: 'Foundations of Computer Science, Python OOP basics, familiarity with terminal/CLI.',
      thingsToBring: 'Laptop with charger, campus ID card, wired headphones.',
      softwareTools: 'Python 3.10+, VS Code or Cursor IDE, Git, browser with Chrome/Firefox.',
      otherInstructions: 'Complimentary high-speed campus sandbox Wi-Fi will be authenticated through Student Pass ID.'
    },
    status: 'PENDING_REVIEW', // In pending state so HOD review demo is immediately ready!
    academicCredits: 2.0,
    syllabusMapping: 'CSBS-IOT-8402: Advanced Artificial Intelligence (Module 4 & 5 Outcome Aligned)',
    createdAt: '2026-09-08T08:15:00Z',
    updatedAt: '2026-09-08T08:45:00Z',
    submittedAt: '2026-09-08T08:45:00Z',
    version: 1
  },
  {
    id: 'EVT-MICRO-8840',
    title: 'Cloud Native Microservices Bootcamp',
    shortDescription: 'Deep dive into containerization, Kubernetes clusters, service meshes, and distributed tracing.',
    description: 'Learn how to architect, containerize, and deploy resilient microservices systems using Docker, Kubernetes, and gRPC in real university cloud clusters.',
    objectives: [
      'Understand container namespaces and cgroups.',
      'Deploy multi-tier container topologies with ingress controllers.',
      'Monitor distributed transactions with OpenTelemetry.'
    ],
    category: 'Technical',
    eventType: 'Technical Bootcamp',
    departmentId: 'dept-cse',
    departmentName: 'Department of CSBS & IoT',
    organizerId: 'user-faculty-02',
    organizerName: 'Cloud & IoT Lab Coordinator (CSBS & IoT)',
    organizerContact: 'faculty.cloud@vignan.ac.in',
    organizerDesignation: 'Cloud Infrastructure Fellow',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
    date: '2026-09-20',
    startTime: '14:00',
    endTime: '17:00',
    venue: 'Networking Lab 4',
    locationDetails: 'Advanced Systems Lab Complex, Room 402',
    capacity: 60,
    registeredCount: 52,
    registrationDeadline: '2026-09-19',
    registrationRequired: true,
    targetAudience: '3rd & 4th Year CSBS & IoT Students',
    eligibility: 'Linux command line fluency.',
    participationInstructions: 'SSH keys will be validated on local workstations.',
    speaker: {
      name: 'Cloud & IoT Lab Coordinator (CSBS & IoT)',
      designation: 'Lead Systems Architect',
      organization: 'Cloud Infrastructure Foundation',
      bio: '15 years architecting large-scale telecom distributed backends.',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
    },
    agenda: [
      {
        id: 'ag-201',
        time: '02:00 PM - 03:15 PM',
        sessionTitle: 'Docker Internals & OCI Spec',
        description: 'Building multi-stage scratch containers with minimal attack surfaces.',
        durationMinutes: 75
      },
      {
        id: 'ag-202',
        time: '03:30 PM - 05:00 PM',
        sessionTitle: 'Kubernetes Ingress & Canary Deployments',
        description: 'Hands-on deployment to live k3s department sandbox.',
        durationMinutes: 90
      }
    ],
    requirements: {
      prerequisites: 'Basic Docker knowledge, terminal proficiency.',
      thingsToBring: 'Personal laptop with SSH client installed.',
      softwareTools: 'Docker Desktop / Podman, kubectl, Minikube.'
    },
    status: 'PUBLISHED',
    academicCredits: 1.5,
    syllabusMapping: 'CSBS-IOT-7201: Distributed Cloud Computing',
    createdAt: '2026-09-05T10:00:00Z',
    updatedAt: '2026-09-06T11:00:00Z',
    submittedAt: '2026-09-06T10:30:00Z',
    publishedAt: '2026-09-06T11:00:00Z',
    hodReviewerName: 'Head of Department (CSBS & IoT)',
    hodReviewComment: 'Approved. Essential curriculum tie-in for Cloud Computing lab requirements.',
    digitalSignatureHash: '0x8f9a2c41e8bd0192ea94c7b80',
    version: 2
  },
  {
    id: 'EVT-HACK-8839',
    title: 'ACM 24-Hour Hackathon: Campus Hack 2026',
    shortDescription: 'The annual flagship 24-hour university hackathon addressing real-world sustainability, fintech, and AI challenges.',
    description: 'Campus Hack brings together 350+ student developers, designers, and domain innovators for 24 hours of non-stop rapid prototyping, supported by industry mentors and $5,000 in grand prize awards.',
    objectives: [
      'Build fully functional MVP solving sustainability or education challenges.',
      'Collaborate across interdisciplinary student teams under strict deadline pressure.',
      'Present live architectural demonstrations to university and industry judges.'
    ],
    category: 'Hackathon',
    eventType: 'Department Flagship Competition',
    departmentId: 'dept-cse',
    departmentName: 'Department of CSBS & IoT',
    organizerId: 'user-faculty-03',
    organizerName: 'Cybersecurity & IoT Coordinator (CSBS & IoT)',
    organizerContact: 'e.rostova@cs.campus.edu',
    organizerDesignation: 'Student Affairs Faculty Liaison',
    posterUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200',
    date: '2026-09-23',
    startTime: '10:00',
    endTime: '10:00',
    venue: 'Open Atrium & Lab Complex',
    locationDetails: 'Central Campus Engineering Quadrant (Cap: 350)',
    capacity: 350,
    registeredCount: 310,
    registrationDeadline: '2026-09-21',
    registrationRequired: true,
    targetAudience: 'All University Students across Engineering, Sciences & Design',
    eligibility: 'Open to enrolled students in teams of 2 to 4 members.',
    participationInstructions: 'Check-in begins at 08:30 AM at Central Atrium Gate A. Bring valid university ID and sleeping gear if staying overnight.',
    speaker: {
      name: 'Cybersecurity Mentors',
      designation: 'Chair of Student Innovations',
      organization: 'ACM University Student Chapter',
      bio: 'Leading student technical competitive chapters and mentor networks.',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
    },
    agenda: [
      {
        id: 'ag-301',
        time: 'Day 1, 10:00 AM',
        sessionTitle: 'Opening Ceremony & Problem Statement Unveiling',
        description: 'Track disclosures: Clean Energy, AI for Good, Financial Inclusion.',
        durationMinutes: 60
      },
      {
        id: 'ag-302',
        time: 'Day 1, 09:00 PM',
        sessionTitle: 'Midpoint Architectural Review & Mentor Checkpoint',
        description: 'Code sanity checks and deployment testing.',
        durationMinutes: 120
      },
      {
        id: 'ag-303',
        time: 'Day 2, 10:00 AM',
        sessionTitle: 'Final Code Freeze & Jury Expo',
        description: 'Live 3-minute stage demonstrations in front of the jury.',
        durationMinutes: 180
      }
    ],
    requirements: {
      prerequisites: 'Git repository initialized on GitHub / GitLab, valid student status.',
      thingsToBring: 'Hardware accessories, personal laptops, extension cords.',
      softwareTools: 'Free choice of technology stack.'
    },
    status: 'PUBLISHED',
    academicCredits: 4.0,
    syllabusMapping: 'NAAC Metric 3.3.2 Co-Curricular Innovation & Project Incubation',
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-09-02T14:00:00Z',
    submittedAt: '2026-09-02T10:00:00Z',
    publishedAt: '2026-09-02T14:00:00Z',
    hodReviewerName: 'Head of Department (CSBS & IoT)',
    hodReviewComment: 'Approved department flagship. Budget and 24-hr facility access cleared with campus security.',
    digitalSignatureHash: '0x9923a1f4b008d72e61ba90',
    version: 3
  },
  {
    id: 'EVT-DB-8838',
    title: 'Industry Expert Talk: Scaling Distributed Databases',
    shortDescription: 'CockroachDB VP on consensus algorithms, Raft replication, multi-region transactions, and geo-partitioning.',
    description: 'An exclusive technical session with veteran database architects from CockroachDB exploring the engineering realities of globally distributed SQL databases, Raft consensus consensus, and ACID guarantees.',
    objectives: [
      'Grasp Raft consensus state machines and log replication.',
      'Analyze two-phase commit overhead in WAN environments.',
      'Explore geo-partitioning architectures for sub-10ms transactional reads.'
    ],
    category: 'Guest Lecture',
    eventType: 'Industry Expert Talk',
    departmentId: 'dept-cse',
    departmentName: 'Department of CSBS & IoT',
    organizerId: 'user-faculty-01',
    organizerName: 'Faculty Coordinator (CSBS & IoT)',
    organizerContact: 'faculty.csbsiot@vignan.ac.in',
    organizerDesignation: 'Assoc. Professor',
    posterUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1200',
    date: '2026-09-26',
    startTime: '10:00',
    endTime: '12:30',
    venue: 'Ramanujan Seminar Hall',
    locationDetails: 'Block B, 2nd Floor (Cap: 120)',
    capacity: 120,
    registeredCount: 114,
    registrationDeadline: '2026-09-25',
    registrationRequired: true,
    targetAudience: 'Undergraduate CSBS & IoT Students',
    eligibility: 'Basic database management systems (DBMS) coursework.',
    participationInstructions: 'Seating on first-come-first-admitted basis for confirmed pass holders.',
    speaker: {
      name: 'Marcus Chen',
      designation: 'VP of Distributed Infrastructure',
      organization: 'CockroachDB Labs',
      bio: 'Leading database researcher specializing in Paxos/Raft consensus and hybrid logical clocks.',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'
    },
    agenda: [
      {
        id: 'ag-401',
        time: '10:00 AM - 11:30 AM',
        sessionTitle: 'Distributed Transactions & Hybrid Logical Clocks',
        description: 'Overcoming clock drift in distributed commit protocols.',
        durationMinutes: 90
      },
      {
        id: 'ag-402',
        time: '11:30 AM - 12:30 PM',
        sessionTitle: 'Live Architecture Teardown & Interactive Q&A',
        description: 'Simulating region partition failures and automatic leader re-election.',
        durationMinutes: 60
      }
    ],
    requirements: {
      prerequisites: 'Relational database concepts (ACID, transaction isolation levels).',
      thingsToBring: 'Notebook or tablet for notes.',
      softwareTools: 'None required.'
    },
    status: 'PUBLISHED',
    academicCredits: 1.0,
    syllabusMapping: 'CSBS-IOT-5401: Database Management Systems & Advanced Storage',
    createdAt: '2026-09-03T11:00:00Z',
    updatedAt: '2026-09-04T09:00:00Z',
    submittedAt: '2026-09-03T15:00:00Z',
    publishedAt: '2026-09-04T09:00:00Z',
    hodReviewerName: 'Head of Department (CSBS & IoT)',
    hodReviewComment: 'Approved with distinguished industrial sync certification.',
    digitalSignatureHash: '0x17bfa00921ec3d4f88910',
    version: 1
  },
  {
    id: 'EVT-COMP-8837',
    title: 'Competitive Programming League: Division 1',
    shortDescription: 'Speed algorithmic challenges focusing on advanced dynamic programming and graph theory.',
    description: 'Bi-weekly algorithmic arena hosted on the campus judging server. Test problem-solving under extreme time constraints with automated test-suite evaluations.',
    objectives: [
      'Master segment trees, Fenwick trees, and lowest common ancestor queries.',
      'Optimize algorithm runtime to meet strict 1.0s and 256MB memory limits.'
    ],
    category: 'Competition',
    eventType: 'Algorithmic Arena',
    departmentId: 'dept-cse',
    departmentName: 'Department of CSBS & IoT',
    organizerId: 'user-faculty-04',
    organizerName: 'Data Systems Coordinator (CSBS & IoT)',
    organizerContact: 'faculty.algo@vignan.ac.in',
    organizerDesignation: 'Theoretical CS Chair',
    posterUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200',
    date: '2026-09-28',
    startTime: '16:30',
    endTime: '19:30',
    venue: 'Turing Lab Alpha & Online Sync',
    locationDetails: 'Turing Hall Floor 1',
    capacity: 150,
    registeredCount: 142,
    registrationDeadline: '2026-09-27',
    registrationRequired: true,
    targetAudience: 'Competitive Programmers & Algorithm Enthusiasts',
    eligibility: 'Proficiency in C++, Java, or Python.',
    participationInstructions: 'Bring personal laptop or use lab workstations.',
    speaker: {
      name: 'Data Systems Coordinator (CSBS & IoT)',
      designation: 'ICPC World Finals Coach',
      organization: 'Dept. of Department of CSBS & IoT',
      bio: 'Author of 3 algorithmic textbooks and coach of national championship squads.',
      imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400'
    },
    agenda: [
      {
        id: 'ag-501',
        time: '04:30 PM - 07:00 PM',
        sessionTitle: 'Live 2.5-hour Contest Arena',
        description: '6 problems of increasing algorithmic complexity.',
        durationMinutes: 150
      },
      {
        id: 'ag-502',
        time: '07:00 PM - 07:30 PM',
        sessionTitle: 'Problem Editorial & Solution Walkthrough',
        description: 'Optimal asymptotic breakdowns by coaches.',
        durationMinutes: 30
      }
    ],
    requirements: {
      prerequisites: 'Data Structures and Algorithms course completion.',
      thingsToBring: 'Personal laptop or lab ID.',
      softwareTools: 'C++17/20, Java 17+, or PyPy.'
    },
    status: 'PUBLISHED',
    academicCredits: 1.0,
    syllabusMapping: 'CSBS-IOT-3102: Data Structures & Algorithms',
    createdAt: '2026-09-04T08:00:00Z',
    updatedAt: '2026-09-05T12:00:00Z',
    submittedAt: '2026-09-04T16:00:00Z',
    publishedAt: '2026-09-05T12:00:00Z',
    hodReviewerName: 'Head of Department (CSBS & IoT)',
    hodReviewComment: 'Approved. Excellent preparation for ICPC regionals.',
    digitalSignatureHash: '0x431ea0b91d2ff008129',
    version: 1
  },
  {
    id: 'EVT-QUANT-8836',
    title: 'Advanced Deep Learning & Transformer Quantization Seminar',
    shortDescription: 'Research seminar on 4-bit and 8-bit post-training quantization and speculative decoding for edge GPUs.',
    description: 'Detailed analysis of GPTQ, AWQ, and speculative decoding techniques to compress multi-billion parameter models into constrained edge devices.',
    objectives: [
      'Compare weight-only vs activation quantization trade-offs.',
      'Benchmark perplexity loss across llama-3.1-8b variants.'
    ],
    category: 'Seminar',
    eventType: 'Research Seminar',
    departmentId: 'dept-cse',
    departmentName: 'Department of CSBS & IoT',
    organizerId: 'user-faculty-01',
    organizerName: 'Faculty Coordinator (CSBS & IoT)',
    organizerContact: 'faculty.csbsiot@vignan.ac.in',
    organizerDesignation: 'Assoc. Professor',
    posterUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1200',
    date: '2026-10-02',
    startTime: '14:00',
    endTime: '16:00',
    venue: 'Ramanujan Seminar Hall',
    locationDetails: 'Block B, 2nd Floor (Cap: 120)',
    capacity: 120,
    registeredCount: 0,
    registrationDeadline: '2026-10-01',
    registrationRequired: true,
    targetAudience: 'Postgraduates & Final Year Researchers',
    eligibility: 'Prior deep learning coursework.',
    participationInstructions: 'Pre-reading papers provided upon approval.',
    speaker: {
      name: 'Faculty Coordinator (CSBS & IoT)',
      designation: 'Assoc. Professor',
      organization: 'AI & Robotics Lab',
      bio: 'Expert in embedded neural network compression.',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'
    },
    agenda: [
      {
        id: 'ag-601',
        time: '02:00 PM - 03:00 PM',
        sessionTitle: 'Quantization Mathematics (AWQ vs GPTQ)',
        description: 'Mathematical derivation of Hessian matrices.',
        durationMinutes: 60
      }
    ],
    requirements: {
      prerequisites: 'Linear algebra, PyTorch foundations.',
      thingsToBring: 'Personal laptop.',
      softwareTools: 'Python, PyTorch, Hugging Face transformers.'
    },
    status: 'CHANGES_REQUESTED',
    academicCredits: 1.5,
    syllabusMapping: 'CSBS-IOT-8402: Advanced Neural Architectures',
    createdAt: '2026-09-07T11:00:00Z',
    updatedAt: '2026-09-07T16:15:00Z',
    submittedAt: '2026-09-07T14:00:00Z',
    hodReviewerName: 'Head of Department (CSBS & IoT)',
    hodReviewComment: 'Please recheck the lab compute budget requirements for GPU instances. Provide allocation code under IEEE grant pool before statutory sign-off.',
    version: 2
  },
  {
    id: 'EVT-DRAFT-8835',
    title: 'Reinforcement Learning from Human Feedback (RLHF) Intensive',
    shortDescription: 'Step-by-step training of reward models and proximal policy optimization (PPO) for conversational alignment.',
    description: 'Draft proposal exploring reward modeling, Bradley-Terry preference scoring, and PPO loss formulation.',
    objectives: [
      'Implement pairwise ranking loss in PyTorch.',
      'Run PPO fine-tuning loop with KL divergence penalty.'
    ],
    category: 'Workshop',
    eventType: 'Hands-on Workshop',
    departmentId: 'dept-cse',
    departmentName: 'Department of CSBS & IoT',
    organizerId: 'user-faculty-01',
    organizerName: 'Faculty Coordinator (CSBS & IoT)',
    organizerContact: 'faculty.csbsiot@vignan.ac.in',
    organizerDesignation: 'Assoc. Professor',
    posterUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200',
    date: '2026-10-15',
    startTime: '10:00',
    endTime: '13:00',
    venue: 'Turing Hall Floor 2 Lab',
    locationDetails: 'Pending HOD venue allocation',
    capacity: 60,
    registeredCount: 0,
    registrationDeadline: '2026-10-14',
    registrationRequired: true,
    targetAudience: '3rd/4th Year CSBS & IoT Students',
    eligibility: 'Deep learning course credit.',
    participationInstructions: 'Draft stage.',
    speaker: {
      name: 'Faculty Coordinator (CSBS & IoT)',
      designation: 'Assoc. Professor',
      organization: 'AI & Robotics Lab',
      bio: 'Research lead in alignment and safety.',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'
    },
    agenda: [
      {
        id: 'ag-701',
        time: '10:00 AM - 11:30 AM',
        sessionTitle: 'Reward Model Training from Pairs',
        description: 'Dataset annotation schema and loss computation.',
        durationMinutes: 90
      }
    ],
    requirements: {
      prerequisites: 'Python, PyTorch.',
      thingsToBring: 'Laptop.',
      softwareTools: 'CUDA capable GPU or Google Colab.'
    },
    status: 'DRAFT',
    academicCredits: 2.0,
    syllabusMapping: 'CSBS-IOT-8402: Module 5 (Alignment & RLHF)',
    createdAt: '2026-09-08T07:15:00Z',
    updatedAt: '2026-09-08T07:15:00Z',
    version: 1
  },
  {
    id: 'EVT-COMPLETED-8834',
    title: 'Computer Vision & Edge Inference Symposium',
    shortDescription: 'Conducted symposium on lightweight convolution, MobileNet-v4, and INT8 TensorRT acceleration on NVIDIA Jetson modules.',
    description: 'Archived symposium showcasing edge computer vision deployments across automated campus mobility and agricultural robotic sensing.',
    objectives: [
      'Examine edge inference latency constraints.',
      'Deploy ONNX models onto TensorRT acceleration engines.'
    ],
    category: 'Seminar',
    eventType: 'Department Symposium',
    departmentId: 'dept-cse',
    departmentName: 'Department of CSBS & IoT',
    organizerId: 'user-faculty-01',
    organizerName: 'Faculty Coordinator (CSBS & IoT)',
    organizerContact: 'faculty.csbsiot@vignan.ac.in',
    organizerDesignation: 'Assoc. Professor',
    posterUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=1200',
    date: '2026-08-14',
    startTime: '09:00',
    endTime: '17:00',
    venue: 'Turing Main Auditorium',
    locationDetails: 'Turing Hall, Main Ground Floor',
    capacity: 180,
    registeredCount: 180,
    registrationDeadline: '2026-08-12',
    registrationRequired: true,
    targetAudience: 'Enrolled Engineering Undergraduates & Faculty',
    eligibility: 'All students.',
    participationInstructions: 'Event completed. Attendance records stamped on NAAC ledger.',
    speaker: {
      name: 'Faculty Panel & Technical Experts',
      designation: 'Chair of Symposium',
      organization: 'AI & Robotics Lab',
      bio: 'Leading edge AI consortium.',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'
    },
    agenda: [
      {
        id: 'ag-801',
        time: '09:00 AM - 12:00 PM',
        sessionTitle: 'Edge Vision Architectures',
        description: 'TensorRT deployment pipelines.',
        durationMinutes: 180
      }
    ],
    requirements: {
      prerequisites: 'Basic Python.',
      thingsToBring: 'None.',
      softwareTools: 'None.'
    },
    status: 'COMPLETED',
    academicCredits: 2.0,
    syllabusMapping: 'CSBS-IOT-6202: Real-time Embedded Vision',
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-08-15T18:00:00Z',
    submittedAt: '2026-08-02T10:00:00Z',
    publishedAt: '2026-08-03T11:00:00Z',
    hodReviewerName: 'Head of Department (CSBS & IoT)',
    hodReviewComment: 'Archived and certified under NAAC Criterion 3.3.2.',
    digitalSignatureHash: '0x9923bb00a112ec4917',
    version: 4
  }
];

export const INITIAL_APPROVAL_HISTORY: ApprovalTimelineRecord[] = [
  {
    id: 'app-01',
    eventId: 'EVT-GENAI-8841',
    actorId: 'user-faculty-01',
    actorName: 'Faculty Coordinator (CSBS & IoT)',
    actorRole: 'FACULTY',
    action: 'CREATED',
    comment: 'Initial charter draft drafted in CSBS & IoT Academic Portal.',
    timestamp: '2026-09-08T08:15:00Z'
  },
  {
    id: 'app-02',
    eventId: 'EVT-GENAI-8841',
    actorId: 'user-faculty-01',
    actorName: 'Faculty Coordinator (CSBS & IoT)',
    actorRole: 'FACULTY',
    action: 'SUBMITTED',
    comment: 'Submitted for HOD Statutory Sign-off and Venue Lock (Turing Auditorium).',
    timestamp: '2026-09-08T08:45:00Z',
    signatureHash: '0x7f8a9e22b4012'
  }
];

export const INITIAL_REGISTRATIONS: RegistrationRecord[] = [
  {
    id: 'reg-01',
    eventId: 'EVT-GENAI-8841',
    eventTitle: 'Generative AI Workshop: From Prompting to Prototyping',
    eventDate: '2026-09-18',
    eventVenue: 'Turing Auditorium (Gate 1 & 2 Main)',
    studentId: 'user-student-01',
    studentName: 'Varun Maddu',
    studentRoll: '221FA04001',
    studentEmail: 'student.varun@vignan.ac.in',
    studentDepartment: 'Department of CSBS & IoT',
    registrationId: 'PASS-2026-8841-ALX',
    registeredAt: '2026-09-08T09:12:00Z',
    status: 'CONFIRMED',
    checkedIn: false,
    seatZone: 'Zone A • Row 04 • Seat 18',
    qrToken: 'CF-PASS-8841-ALX-SECURE-HASH-2026'
  },
  {
    id: 'reg-02',
    eventId: 'EVT-MICRO-8840',
    eventTitle: 'Cloud Native Microservices Bootcamp',
    eventDate: '2026-09-20',
    eventVenue: 'Networking Lab 4',
    studentId: 'user-student-01',
    studentName: 'Varun Maddu',
    studentRoll: '221FA04001',
    studentEmail: 'student.varun@vignan.ac.in',
    studentDepartment: 'Department of CSBS & IoT',
    registrationId: 'PASS-2026-8840-ALX',
    registeredAt: '2026-09-07T14:20:00Z',
    status: 'CONFIRMED',
    checkedIn: false,
    seatZone: 'Seat Lab-402-B',
    qrToken: 'CF-PASS-8840-ALX-SECURE-HASH-2026'
  },
  {
    id: 'reg-03',
    eventId: 'EVT-HACK-8839',
    eventTitle: 'ACM 24-Hour Hackathon: Campus Hack 2026',
    eventDate: '2026-09-23',
    eventVenue: 'Open Atrium & Lab Complex',
    studentId: 'user-student-01',
    studentName: 'Varun Maddu',
    studentRoll: '221FA04001',
    studentEmail: 'student.varun@vignan.ac.in',
    studentDepartment: 'Department of CSBS & IoT',
    registrationId: 'PASS-2026-8839-ALX',
    registeredAt: '2026-09-05T16:00:00Z',
    status: 'CONFIRMED',
    checkedIn: false,
    seatZone: 'Team Desk #42 (NeuralShift)',
    qrToken: 'CF-PASS-8839-ALX-SECURE-HASH-2026'
  },
  {
    id: 'reg-04',
    eventId: 'EVT-COMPLETED-8834',
    eventTitle: 'Computer Vision & Edge Inference Symposium',
    eventDate: '2026-08-14',
    eventVenue: 'Turing Main Auditorium',
    studentId: 'user-student-01',
    studentName: 'Varun Maddu',
    studentRoll: '221FA04001',
    studentEmail: 'student.varun@vignan.ac.in',
    studentDepartment: 'Department of CSBS & IoT',
    registrationId: 'PASS-2026-8834-ALX',
    registeredAt: '2026-08-10T11:00:00Z',
    status: 'CONFIRMED',
    checkedIn: true,
    checkedInAt: '2026-08-14T08:52:00Z',
    seatZone: 'Row G Seat 12',
    qrToken: 'CF-PASS-8834-ALX-SECURE-HASH-2026'
  },
  // Additional student participants for realistic participant roster
  {
    id: 'reg-05',
    eventId: 'EVT-GENAI-8841',
    eventTitle: 'Generative AI Workshop: From Prompting to Prototyping',
    eventDate: '2026-09-18',
    eventVenue: 'Turing Auditorium',
    studentId: 'user-student-02',
    studentName: 'Priya Sharma',
    studentRoll: 'CS-22-108',
    studentEmail: 'priya.s@student.campus.edu',
    studentDepartment: 'Department of CSBS & IoT',
    registrationId: 'PASS-2026-8841-PRS',
    registeredAt: '2026-09-08T09:15:00Z',
    status: 'CONFIRMED',
    checkedIn: true,
    checkedInAt: '2026-09-18T09:11:42Z',
    seatZone: 'Zone B • Row 02 • Seat 04',
    qrToken: 'CF-PASS-8841-PRS-SECURE-HASH-2026'
  },
  {
    id: 'reg-06',
    eventId: 'EVT-GENAI-8841',
    eventTitle: 'Generative AI Workshop: From Prompting to Prototyping',
    eventDate: '2026-09-18',
    eventVenue: 'Turing Auditorium',
    studentId: 'user-student-03',
    studentName: 'Rahul Verma',
    studentRoll: 'CS-22-045',
    studentEmail: 'rahul.v@student.campus.edu',
    studentDepartment: 'Department of CSBS & IoT',
    registrationId: 'PASS-2026-8841-RHV',
    registeredAt: '2026-09-08T09:18:00Z',
    status: 'CONFIRMED',
    checkedIn: true,
    checkedInAt: '2026-09-18T09:10:55Z',
    seatZone: 'Zone A • Row 01 • Seat 12',
    qrToken: 'CF-PASS-8841-RHV-SECURE-HASH-2026'
  },
  {
    id: 'reg-07',
    eventId: 'EVT-GENAI-8841',
    eventTitle: 'Generative AI Workshop: From Prompting to Prototyping',
    eventDate: '2026-09-18',
    eventVenue: 'Turing Auditorium',
    studentId: 'user-student-04',
    studentName: 'Kevin Zhang',
    studentRoll: 'IT-22-019',
    studentEmail: 'kevin.z@student.campus.edu',
    studentDepartment: 'Information Technology',
    registrationId: 'PASS-2026-8841-KVZ',
    registeredAt: '2026-09-08T09:25:00Z',
    status: 'CONFIRMED',
    checkedIn: true,
    checkedInAt: '2026-09-18T09:09:30Z',
    seatZone: 'Zone C • Row 06 • Seat 22',
    qrToken: 'CF-PASS-8841-KVZ-SECURE-HASH-2026'
  },
  {
    id: 'reg-08',
    eventId: 'EVT-GENAI-8841',
    eventTitle: 'Generative AI Workshop: From Prompting to Prototyping',
    eventDate: '2026-09-18',
    eventVenue: 'Turing Auditorium',
    studentId: 'user-student-05',
    studentName: 'Ananya Sharma',
    studentRoll: 'CS-22-140',
    studentEmail: 'elena.j@student.campus.edu',
    studentDepartment: 'Department of CSBS & IoT',
    registrationId: 'PASS-2026-8841-ELR',
    registeredAt: '2026-09-08T09:30:00Z',
    status: 'CONFIRMED',
    checkedIn: false,
    seatZone: 'Zone B • Row 05 • Seat 11',
    qrToken: 'CF-PASS-8841-ELR-SECURE-HASH-2026'
  },
  {
    id: 'reg-09',
    eventId: 'EVT-GENAI-8841',
    eventTitle: 'Generative AI Workshop: From Prompting to Prototyping',
    eventDate: '2026-09-18',
    eventVenue: 'Turing Auditorium',
    studentId: 'user-student-06',
    studentName: 'Marcus Vance',
    studentRoll: 'CS-22-088',
    studentEmail: 'm.vance@student.campus.edu',
    studentDepartment: 'Department of CSBS & IoT',
    registrationId: 'PASS-2026-8841-MCV',
    registeredAt: '2026-09-08T09:35:00Z',
    status: 'CONFIRMED',
    checkedIn: true,
    checkedInAt: '2026-09-18T09:07:02Z',
    seatZone: 'Zone A • Row 03 • Seat 09',
    qrToken: 'CF-PASS-8841-MCV-SECURE-HASH-2026'
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    userId: 'user-hod-01',
    role: 'HOD',
    title: 'Statutory Approval Required',
    message: 'Faculty Coordinator (CSBS & IoT) submitted "Generative AI Workshop: From Prompting to Prototyping" for HOD review.',
    type: 'action_required',
    read: false,
    createdAt: '2026-09-08T08:45:00Z',
    eventId: 'EVT-GENAI-8841'
  },
  {
    id: 'notif-2',
    userId: 'user-faculty-01',
    role: 'FACULTY',
    title: 'Event Submitted for HOD Review',
    message: 'Your charter has been placed in Head of Department (CSBS & IoT)\'s review queue. Current status: PENDING_REVIEW.',
    type: 'info',
    read: true,
    createdAt: '2026-09-08T08:45:00Z',
    eventId: 'EVT-GENAI-8841'
  },
  {
    id: 'notif-3',
    userId: 'user-faculty-01',
    role: 'FACULTY',
    title: 'Changes Requested on Seminar',
    message: 'HOD Head of Department (CSBS & IoT) requested revisions on "Advanced Deep Learning & Transformer Quantization Seminar".',
    type: 'warning',
    read: false,
    createdAt: '2026-09-07T16:15:00Z',
    eventId: 'EVT-QUANT-8836'
  },
  {
    id: 'notif-4',
    userId: 'user-student-01',
    role: 'STUDENT',
    title: 'Registration Confirmed',
    message: 'Your spot for "Generative AI Workshop" is verified. Pass ID: PASS-2026-8841-ALX.',
    type: 'success',
    read: false,
    createdAt: '2026-09-08T09:12:00Z',
    eventId: 'EVT-GENAI-8841'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-01',
    eventId: 'EVT-GENAI-8841',
    action: 'EVENT_CREATED',
    actorName: 'Faculty Coordinator (CSBS & IoT)',
    actorRole: 'FACULTY',
    details: 'Drafted activity charter in Department of CSBS & IoT department.',
    timestamp: '2026-09-08T08:15:00Z'
  },
  {
    id: 'aud-02',
    eventId: 'EVT-GENAI-8841',
    action: 'SUBMITTED_FOR_REVIEW',
    actorName: 'Faculty Coordinator (CSBS & IoT)',
    actorRole: 'FACULTY',
    details: 'Dispatched to HOD Head of Department (CSBS & IoT). Locked for editing during review.',
    timestamp: '2026-09-08T08:45:00Z'
  },
  {
    id: 'aud-03',
    eventId: 'EVT-MICRO-8840',
    action: 'APPROVED_AND_PUBLISHED',
    actorName: 'Head of Department (CSBS & IoT)',
    actorRole: 'HOD',
    details: 'Statutory clearance issued. Event published to university student portal.',
    timestamp: '2026-09-06T11:00:00Z'
  }
];

export const INITIAL_FEEDBACKS: FeedbackRecord[] = [
  {
    id: 'fb-01',
    eventId: 'EVT-COMPLETED-8834',
    eventTitle: 'Computer Vision & Edge Inference Symposium',
    studentId: 'user-student-01',
    studentName: 'Varun Maddu',
    studentRoll: '221FA04001',
    studentDepartment: 'Department of CSBS & IoT',
    rating: 5,
    contentQuality: 5,
    organization: 5,
    speakerRating: 5,
    comment: 'Exceptional hands-on workshop! The TensorRT optimization benchmarks on real NVIDIA Jetson modules were eye-opening.',
    takeaways: 'Learned INT8 quantization, TensorRT acceleration pipelines, and real-time inference latency constraints.',
    wouldRecommend: true,
    createdAt: '2026-08-15T10:30:00Z'
  },
  {
    id: 'fb-02',
    eventId: 'EVT-GENAI-8841',
    eventTitle: 'Generative AI Workshop: From Prompting to Prototyping',
    studentId: 'user-student-02',
    studentName: 'Priya Sharma',
    studentRoll: 'CS-22-108',
    studentDepartment: 'Department of CSBS & IoT',
    rating: 5,
    contentQuality: 5,
    organization: 4,
    speakerRating: 5,
    comment: 'Outstanding curriculum alignment and practical lab sandbox exercises using LangGraph and pgvector.',
    takeaways: 'Mastered production RAG architectures and multi-agent coordination frameworks.',
    wouldRecommend: true,
    createdAt: '2026-09-18T14:15:00Z'
  },
  {
    id: 'fb-03',
    eventId: 'EVT-MICRO-8840',
    eventTitle: 'Cloud Native Microservices Bootcamp',
    studentId: 'user-student-03',
    studentName: 'Rahul Verma',
    studentRoll: 'CS-22-045',
    studentDepartment: 'Department of CSBS & IoT',
    rating: 4,
    contentQuality: 4,
    organization: 5,
    speakerRating: 4,
    comment: 'Great hands-on Kubernetes canary deployment exercises on the university k3s cluster.',
    takeaways: 'Container multi-stage builds and OpenTelemetry tracing.',
    wouldRecommend: true,
    createdAt: '2026-09-20T18:00:00Z'
  }
];

