export interface Paper {
  id: string;
  title: string;
  authors: string[];
  institution: string;
  publicationDate: string;
  publicationYear: number;
  topic: string;
  abstract: string;
  downloads: number;
  citations: number;
  status: 'pending' | 'approved' | 'rejected' | 'revision';
  keywords: string[];
}

export interface Review {
  id: string;
  reviewerName: string;
  date: string;
  comment: string;
  recommendation: 'approve' | 'reject' | 'revision';
}

export interface Author {
  name: string;
  institution: string;
  researchAreas: string[];
  totalPublications: number;
  bio: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  icon: string;
}
