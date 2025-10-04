export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishedAt: string;
  source: string;
  engagementScore?: number;
  perspectives?: {
    for: string;
    against: string;
    neutral: string;
  };
}

export interface Comment {
  id: string;
  articleId: string;
  author: string;
  content: string;
  createdAt: string;
}

export const mockArticles: Article[] = [
  {
    id: "1",
    title: "Global Climate Summit Reaches Historic Agreement",
    summary: "World leaders agree on ambitious carbon reduction targets at international summit.",
    content: "In a landmark decision, representatives from over 150 countries have agreed to implement stricter carbon emission standards. The agreement includes provisions for renewable energy investment and sustainable development goals.",
    publishedAt: "2025-10-03",
    source: "Global News Network",
    engagementScore: 245,
    perspectives: {
      for: "This agreement represents the most significant global climate action in decades, with binding commitments that could limit warming to 1.5°C.",
      against: "The targets are unrealistic and will damage economic growth, while developing nations may struggle to meet ambitious timelines.",
      neutral: "The agreement sets important benchmarks but implementation remains the key challenge, with mixed historical success on climate commitments."
    }
  },
  {
    id: "2",
    title: "Tech Company Announces Revolutionary AI Breakthrough",
    summary: "New artificial intelligence system demonstrates unprecedented capabilities in medical diagnosis.",
    biasPercentage: 32,
    content: "A leading technology company has unveiled an AI system that can accurately diagnose rare diseases with 95% accuracy. The breakthrough could transform healthcare delivery in underserved regions.",
    publishedAt: "2025-10-03",
    source: "Tech Today",
    engagementScore: 189,
    perspectives: {
      for: "This AI breakthrough could save millions of lives by enabling early diagnosis of rare diseases that human doctors often miss.",
      against: "Over-reliance on AI diagnosis could reduce doctor skills and create dangerous false positives in critical medical decisions.",
      neutral: "The technology shows promise but requires extensive testing and regulatory approval before widespread medical deployment."
    }
  },
  {
    id: "3",
    title: "Economic Growth Surpasses Expectations in Q3",
    summary: "Latest economic data shows robust growth across major sectors, unemployment at record lows.",
    biasPercentage: 45,
    content: "The economy grew by 3.5% in the third quarter, exceeding analyst predictions. Job creation remained strong, with unemployment falling to its lowest level in decades.",
    publishedAt: "2025-10-02",
    source: "Business Insider",
    engagementScore: 167,
    perspectives: {
      for: "Strong economic indicators demonstrate successful policy decisions and suggest continued prosperity for American families.",
      against: "Growth numbers mask underlying issues like inflation, housing costs, and wage stagnation affecting middle-class families.",
      neutral: "Economic data shows mixed signals with strong job growth offset by persistent inflation and regional disparities."
    }
  },
  {
    id: "4",
    title: "New Study Reveals Benefits of Mediterranean Diet",
    summary: "Long-term research confirms significant health improvements from traditional Mediterranean eating patterns.",
    biasPercentage: 8,
    content: "A 10-year study involving 50,000 participants has confirmed that the Mediterranean diet reduces the risk of heart disease by 30% and improves overall longevity.",
    publishedAt: "2025-10-02",
    source: "Health Journal",
    engagementScore: 134,
    perspectives: {
      for: "Comprehensive long-term data provides conclusive evidence that Mediterranean diet significantly improves cardiovascular health and longevity.",
      against: "The diet is expensive and culturally inappropriate for many populations, making it an elitist approach to nutrition.",
      neutral: "While benefits are documented, individual results vary and the diet requires careful adaptation to different cultural contexts."
    }
  },
  {
    id: "5",
    title: "Space Agency Plans Mission to Jupiter's Moon",
    summary: "Ambitious new mission aims to explore Europa for signs of extraterrestrial life.",
    biasPercentage: 12,
    content: "Scientists are preparing a groundbreaking mission to Europa, one of Jupiter's moons, which is believed to harbor a vast ocean beneath its icy surface. The mission could launch within the next five years.",
    publishedAt: "2025-10-01",
    source: "Space News Daily",
    engagementScore: 203,
    perspectives: {
      for: "Europa mission represents humanity's best chance to discover extraterrestrial life and advance our understanding of the universe.",
      against: "Billions spent on space exploration could be better used addressing urgent problems like poverty, climate change, and healthcare.",
      neutral: "Space exploration provides valuable scientific knowledge, though budget priorities and timeline feasibility remain valid concerns."
    }
  },
  {
    id: "6",
    title: "New Cryptocurrency Regulation Framework Announced",
    summary: "Federal regulators unveil comprehensive rules for digital asset trading and taxation.",
    biasPercentage: 38,
    content: "The new framework establishes clear guidelines for cryptocurrency exchanges, stablecoin reserves, and tax reporting requirements.",
    publishedAt: "2025-10-03",
    source: "Finance Daily",
    engagementScore: 156,
    perspectives: {
      for: "Clear regulations will legitimize cryptocurrency markets and protect consumers from fraud and market manipulation.",
      against: "Heavy-handed regulations stifle innovation and could drive cryptocurrency businesses to more friendly jurisdictions.",
      neutral: "Balanced regulation is needed, but the framework's complexity may create compliance burdens for smaller market participants."
    }
  },
  {
    id: "7",
    title: "Teachers Union Strikes in Major Metropolitan Areas",
    summary: "Educators demand higher wages and improved classroom conditions across multiple cities.",
    biasPercentage: 42,
    content: "Over 50,000 teachers in three major cities have gone on strike, affecting nearly 400,000 students.",
    publishedAt: "2025-10-03",
    source: "Education Weekly",
    engagementScore: 298,
    perspectives: {
      for: "Teachers deserve fair compensation and adequate resources to provide quality education for our children.",
      against: "Strikes harm students' education and burden working parents who depend on schools for childcare.",
      neutral: "Both sides have valid concerns, but strikes should be a last resort with focus on collaborative solutions."
    }
  },
  {
    id: "8",
    title: "Social Media Platform Implements Strict Content Moderation",
    summary: "New AI-powered systems will automatically flag and remove potentially harmful content.",
    biasPercentage: 35,
    content: "The platform's enhanced moderation tools aim to reduce misinformation and harassment while preserving free expression.",
    publishedAt: "2025-10-02",
    source: "Tech Review",
    engagementScore: 221,
    perspectives: {
      for: "Stronger content moderation protects users from harmful misinformation and creates safer online communities.",
      against: "Automated censorship threatens free speech and could suppress legitimate political discourse and debate.",
      neutral: "Content moderation is necessary but requires transparency and human oversight to avoid overreach."
    }
  },
  {
    id: "9",
    title: "Renewable Energy Surpasses Coal for First Time",
    summary: "Wind and solar power generation exceeds coal-fired electricity production nationally.",
    biasPercentage: 18,
    content: "This milestone represents a significant shift in the nation's energy mix toward cleaner sources.",
    publishedAt: "2025-10-02",
    source: "Energy Report",
    engagementScore: 178,
    perspectives: {
      for: "This transition demonstrates renewable energy's viability and marks crucial progress in reducing carbon emissions.",
      against: "Rapid energy transition threatens grid reliability and eliminates thousands of coal industry jobs.",
      neutral: "The shift reflects market forces and policy changes, requiring careful management of economic and reliability impacts."
    }
  },
  {
    id: "10",
    title: "Housing Market Shows Signs of Cooling",
    summary: "Home prices level off as mortgage rates remain elevated across major markets.",
    biasPercentage: 25,
    content: "After years of rapid growth, housing market indicators suggest a more balanced environment for buyers and sellers.",
    publishedAt: "2025-10-01",
    source: "Real Estate Today",
    engagementScore: 145,
    perspectives: {
      for: "Market cooling provides relief for first-time buyers who have been priced out during the pandemic boom.",
      against: "Falling home values hurt homeowner wealth and could signal broader economic weakness ahead.",
      neutral: "Market normalization was expected after unprecedented growth, with regional variations still significant."
    }
  },
  {
    id: "11",
    title: "Universal Basic Income Pilot Program Launches",
    summary: "Three cities begin testing monthly cash payments to residents regardless of employment status.",
    biasPercentage: 44,
    content: "The pilot program will provide $1,000 monthly payments to 10,000 residents over two years.",
    publishedAt: "2025-10-01",
    source: "Policy Watch",
    engagementScore: 267,
    perspectives: {
      for: "UBI could reduce poverty and provide economic security in an era of job automation and gig economy uncertainty.",
      against: "Free money programs discourage work and create unsustainable government spending that taxpayers must fund.",
      neutral: "Pilot programs provide valuable data, though scaling UBI nationally would require significant tax and policy changes."
    }
  },
  {
    id: "12",
    title: "Gene Therapy Cures Rare Childhood Disease",
    summary: "Revolutionary treatment shows complete remission in clinical trials for previously incurable condition.",
    biasPercentage: 9,
    content: "The one-time gene therapy treatment targets the genetic root cause of the disease affecting 1 in 100,000 children.",
    publishedAt: "2025-09-30",
    source: "Medical Journal",
    engagementScore: 189,
    perspectives: {
      for: "Gene therapy represents the future of precision medicine, offering cures rather than just symptom management.",
      against: "Extremely high costs limit access to wealthy patients and strain healthcare budgets for rare disease treatments.",
      neutral: "Medical breakthrough is promising but requires long-term safety data and sustainable pricing models."
    }
  },
  {
    id: "13",
    title: "Electric Vehicle Sales Plateau Amid Infrastructure Concerns",
    summary: "EV adoption slows as buyers cite charging network gaps and battery range anxiety.",
    biasPercentage: 33,
    content: "Despite government incentives, electric vehicle market growth has stagnated in suburban and rural areas.",
    publishedAt: "2025-09-30",
    source: "Auto News",
    engagementScore: 156,
    perspectives: {
      for: "EV technology continues improving rapidly, and infrastructure investments will resolve current adoption barriers.",
      against: "EVs remain impractical for many Americans due to cost, charging limitations, and inadequate grid capacity.",
      neutral: "EV adoption faces legitimate infrastructure challenges that require coordinated public and private investment."
    }
  },
  {
    id: "14",
    title: "Minimum Wage Increase Passes in Seven States",
    summary: "Voters approve ballot measures raising minimum wages to $15-18 per hour by 2026.",
    biasPercentage: 41,
    content: "The wage increases affect nearly 3 million workers across affected states, with phased implementation schedules.",
    publishedAt: "2025-09-29",
    source: "Labor Report",
    engagementScore: 234,
    perspectives: {
      for: "Higher minimum wages help workers afford basic necessities and stimulate economic growth through increased consumer spending.",
      against: "Wage mandates force small businesses to cut jobs and hours, ultimately hurting the workers they aim to help.",
      neutral: "Wage policy involves tradeoffs between worker benefits and business costs, with effects varying by industry and region."
    }
  },
  {
    id: "15",
    title: "AI Chatbot Passes Bar Exam with Top Scores",
    summary: "Latest language model achieves 95th percentile performance on legal licensing examination.",
    biasPercentage: 28,
    content: "The AI system demonstrated comprehensive understanding of legal reasoning and case law analysis.",
    publishedAt: "2025-09-29",
    source: "Legal Tech",
    engagementScore: 198,
    perspectives: {
      for: "AI legal assistance could democratize access to legal knowledge and reduce costs for basic legal services.",
      against: "Automated legal advice lacks human judgment and could provide dangerous guidance in complex situations.",
      neutral: "AI tools can supplement legal research but human expertise remains essential for nuanced legal decision-making."
    }
  },
  {
    id: "16",
    title: "Mental Health Crisis Deepens Among Teenagers",
    summary: "Latest CDC data shows record levels of anxiety and depression in adolescent populations.",
    biasPercentage: 19,
    content: "Mental health professionals cite social media, academic pressure, and pandemic isolation as contributing factors.",
    publishedAt: "2025-09-28",
    source: "Health Today",
    engagementScore: 287,
    perspectives: {
      for: "Increased mental health awareness and destigmatization encourage teens to seek help for previously hidden struggles.",
      against: "Over-diagnosis and medicalization of normal adolescent challenges create unnecessary anxiety about mental health.",
      neutral: "Teen mental health concerns are real but require comprehensive approaches addressing multiple contributing factors."
    }
  },
  {
    id: "17",
    title: "Trade Agreement Negotiations Resume with Key Partner",
    summary: "Diplomatic talks restart after two-year pause, focusing on technology and agricultural exports.",
    biasPercentage: 36,
    content: "Negotiators hope to resolve disputes over intellectual property protection and market access barriers.",
    publishedAt: "2025-09-28",
    source: "Trade Weekly",
    engagementScore: 123,
    perspectives: {
      for: "International trade agreements boost economic growth and provide consumers with more choices at lower prices.",
      against: "Trade deals often benefit corporations while exposing American workers to unfair foreign competition.",
      neutral: "Trade policy requires balancing economic benefits with protection of domestic industries and worker interests."
    }
  },
  {
    id: "18",
    title: "Water Shortage Emergency Declared in Southwest",
    summary: "Unprecedented drought conditions force mandatory water restrictions across multiple states.",
    biasPercentage: 21,
    content: "Reservoir levels have dropped to critical lows, prompting emergency conservation measures and agricultural limits.",
    publishedAt: "2025-09-27",
    source: "Environmental Post",
    engagementScore: 209,
    perspectives: {
      for: "Urgent conservation measures are necessary to preserve remaining water resources for essential human needs.",
      against: "Restrictions harm agricultural communities and economic growth while ignoring mismanaged urban water policies.",
      neutral: "Water scarcity requires both immediate conservation and long-term infrastructure investment in affected regions."
    }
  },
  {
    id: "19",
    title: "Quantum Computing Achieves Major Breakthrough",
    summary: "Research team demonstrates quantum advantage in solving complex optimization problems.",
    biasPercentage: 14,
    content: "The quantum system solved problems that would take classical computers thousands of years to complete.",
    publishedAt: "2025-09-27",
    source: "Science Daily",
    engagementScore: 167,
    perspectives: {
      for: "Quantum computing will revolutionize fields from drug discovery to financial modeling, solving previously impossible problems.",
      against: "Quantum technology remains decades from practical application and requires massive investment with uncertain returns.",
      neutral: "Quantum advances are significant but practical applications face substantial technical and cost barriers."
    }
  },
  {
    id: "20",
    title: "Food Delivery Workers Seek Employee Classification",
    summary: "Gig economy drivers file lawsuit demanding benefits and wage protections as company employees.",
    biasPercentage: 39,
    content: "The case could reshape the entire gig economy if workers are reclassified as employees rather than contractors.",
    publishedAt: "2025-09-26",
    source: "Gig Economy News",
    engagementScore: 178,
    perspectives: {
      for: "Gig workers deserve employee protections including healthcare, unemployment benefits, and minimum wage guarantees.",
      against: "Employee classification would eliminate flexible work opportunities and increase costs for consumers.",
      neutral: "Worker classification involves balancing flexibility benefits with protection needs in the modern economy."
    }
  },
  {
    id: "21",
    title: "Rural Broadband Expansion Faces Funding Delays",
    summary: "Infrastructure program struggles with supply chain issues and contractor shortages.",
    biasPercentage: 27,
    content: "The federal initiative aims to bring high-speed internet to underserved rural communities nationwide.",
    publishedAt: "2025-09-26",
    source: "Infrastructure Report",
    engagementScore: 134,
    perspectives: {
      for: "Broadband access is essential infrastructure that enables rural economic development and educational opportunities.",
      against: "Government broadband programs waste taxpayer money on inefficient solutions that private markets could provide.",
      neutral: "Rural connectivity is important but requires realistic timelines and coordination between public and private efforts."
    }
  },
  {
    id: "22",
    title: "Prescription Drug Pricing Reform Advances",
    summary: "Congressional committee approves legislation allowing Medicare to negotiate pharmaceutical prices.",
    biasPercentage: 43,
    content: "The bill would cap annual out-of-pocket prescription costs for seniors and allow generic competition.",
    publishedAt: "2025-09-25",
    source: "Healthcare Policy",
    engagementScore: 256,
    perspectives: {
      for: "Price controls on prescription drugs will make life-saving medications affordable for seniors and reduce healthcare costs.",
      against: "Government price setting will reduce pharmaceutical innovation and limit access to breakthrough medical treatments.",
      neutral: "Drug pricing reform addresses real affordability issues but must balance cost control with innovation incentives."
    }
  },
  {
    id: "23",
    title: "Remote Work Policies Stabilize After Pandemic Shifts",
    summary: "Companies settle into hybrid arrangements as return-to-office mandates level off.",
    biasPercentage: 24,
    content: "Most major employers now offer flexible work arrangements, though requirements vary significantly by industry.",
    publishedAt: "2025-09-25",
    source: "Workplace Trends",
    engagementScore: 145,
    perspectives: {
      for: "Flexible work arrangements improve employee satisfaction, reduce commuting, and can increase productivity.",
      against: "Remote work reduces collaboration, company culture, and career development opportunities for employees.",
      neutral: "Hybrid work models attempt to balance flexibility benefits with in-person collaboration needs."
    }
  },
  {
    id: "24",
    title: "Space Tourism Industry Sees First Fatality",
    summary: "Tragic accident during commercial spaceflight raises safety questions about civilian space travel.",
    biasPercentage: 31,
    content: "The incident occurred during re-entry, prompting calls for stricter safety regulations in the emerging industry.",
    publishedAt: "2025-09-24",
    source: "Aerospace News",
    engagementScore: 234,
    perspectives: {
      for: "Space exploration always carries risks, and civilian spaceflight represents the next frontier of human achievement.",
      against: "Commercial space tourism is a dangerous luxury that puts lives at risk for wealthy passengers' entertainment.",
      neutral: "Space tourism safety requires rigorous regulation and testing before widespread commercial operations."
    }
  },
  {
    id: "25",
    title: "Digital Privacy Laws Expand Across Multiple States",
    summary: "New regulations give consumers greater control over personal data collection and usage.",
    biasPercentage: 22,
    content: "The laws require companies to disclose data practices and allow users to delete personal information.",
    publishedAt: "2025-09-24",
    source: "Privacy Watch",
    engagementScore: 189,
    perspectives: {
      for: "Strong privacy protections are essential to prevent corporate abuse of personal data and protect consumer rights.",
      against: "Excessive privacy regulations burden businesses with compliance costs and limit beneficial data-driven services.",
      neutral: "Privacy legislation balances important consumer protections with business needs in the digital economy."
    }
  }
];

export const mockComments: { [articleId: string]: Comment[] } = {
  "1": [
    {
      id: "c1",
      articleId: "1",
      author: "Sarah Chen",
      content: "This is a huge step forward for climate action. Finally seeing real commitment from major economies.",
      createdAt: "2025-10-03T10:30:00Z"
    },
    {
      id: "c2",
      articleId: "1",
      author: "Mike Johnson",
      content: "I'm skeptical about whether countries will actually follow through on these commitments.",
      createdAt: "2025-10-03T11:15:00Z"
    },
    {
      id: "c3",
      articleId: "1",
      author: "Emma Rodriguez",
      content: "Great news! We need more international cooperation like this.",
      createdAt: "2025-10-03T12:00:00Z"
    }
  ],
  "2": [
    {
      id: "c4",
      articleId: "2",
      author: "Dr. James Wilson",
      content: "As a physician, I'm excited about the potential for AI to improve diagnostic accuracy.",
      createdAt: "2025-10-03T09:00:00Z"
    },
    {
      id: "c5",
      articleId: "2",
      author: "Lisa Zhang",
      content: "This could be a game-changer for rural healthcare access.",
      createdAt: "2025-10-03T09:45:00Z"
    }
  ],
  "3": [
    {
      id: "c6",
      articleId: "3",
      author: "Robert Brown",
      content: "The economic numbers look strong, but inflation is still a concern for many families.",
      createdAt: "2025-10-02T14:30:00Z"
    }
  ]
};

export const mockCommentsSummary: { [articleId: string]: string } = {
  "1": "Mixed reactions to the climate agreement. While many commenters are optimistic about international cooperation, some express skepticism about implementation and follow-through on commitments.",
  "2": "Overall positive sentiment from commenters, particularly from healthcare professionals. Discussion focuses on potential benefits for underserved communities and rural healthcare access.",
  "3": "Commenters acknowledge strong economic indicators but raise concerns about inflation's impact on everyday expenses despite positive growth numbers."
};
