export interface Article {
  id: string;
  title: string;
  summary: string;
  biasPercentage: number;
  content: string;
  publishedAt: string;
  source: string;
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
    biasPercentage: 15,
    content: "In a landmark decision, representatives from over 150 countries have agreed to implement stricter carbon emission standards. The agreement includes provisions for renewable energy investment and sustainable development goals.",
    publishedAt: "2025-10-03",
    source: "Global News Network"
  },
  {
    id: "2",
    title: "Tech Company Announces Revolutionary AI Breakthrough",
    summary: "New artificial intelligence system demonstrates unprecedented capabilities in medical diagnosis.",
    biasPercentage: 32,
    content: "A leading technology company has unveiled an AI system that can accurately diagnose rare diseases with 95% accuracy. The breakthrough could transform healthcare delivery in underserved regions.",
    publishedAt: "2025-10-03",
    source: "Tech Today"
  },
  {
    id: "3",
    title: "Economic Growth Surpasses Expectations in Q3",
    summary: "Latest economic data shows robust growth across major sectors, unemployment at record lows.",
    biasPercentage: 45,
    content: "The economy grew by 3.5% in the third quarter, exceeding analyst predictions. Job creation remained strong, with unemployment falling to its lowest level in decades.",
    publishedAt: "2025-10-02",
    source: "Business Insider"
  },
  {
    id: "4",
    title: "New Study Reveals Benefits of Mediterranean Diet",
    summary: "Long-term research confirms significant health improvements from traditional Mediterranean eating patterns.",
    biasPercentage: 8,
    content: "A 10-year study involving 50,000 participants has confirmed that the Mediterranean diet reduces the risk of heart disease by 30% and improves overall longevity.",
    publishedAt: "2025-10-02",
    source: "Health Journal"
  },
  {
    id: "5",
    title: "Space Agency Plans Mission to Jupiter's Moon",
    summary: "Ambitious new mission aims to explore Europa for signs of extraterrestrial life.",
    biasPercentage: 12,
    content: "Scientists are preparing a groundbreaking mission to Europa, one of Jupiter's moons, which is believed to harbor a vast ocean beneath its icy surface. The mission could launch within the next five years.",
    publishedAt: "2025-10-01",
    source: "Space News Daily"
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
