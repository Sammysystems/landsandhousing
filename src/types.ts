export interface Property {
  id: string;
  title: string;
  type: 'Commercial' | 'Residential' | 'Land' | 'Mixed-Use';
  purpose: 'Sale' | 'Rent' | 'Invest';
  location: string;
  zone: string;
  priceFormatted: string;
  priceRaw: number;
  currency: string;
  beds?: number;
  baths?: number;
  sizeSqFt?: string;
  plotSize?: string;
  description: string;
  highlights: string[];
  imageUrl: string;
  galleryImages: string[];
  featured?: boolean;
  editorialHighlight?: boolean;
  status: 'Available' | 'Under Offer' | 'Exclusive Advisory';
  isIllustrative: boolean;
}

export interface LocationDestination {
  id: string;
  name: string;
  tagline: string;
  description: string;
  propertyCount: string;
  character: string;
  imageUrl: string;
}

export interface MarketInsight {
  id: string;
  category: 'Buying' | 'Selling' | 'Property Management';
  readTime: string;
  title: string;
  summary: string;
  fullContent: string[];
  publishDate: string;
}

export interface ServiceDetail {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  keyDeliverables: string[];
  tag: string;
  imageUrl: string;
}

export interface ClientReview {
  id: string;
  author: string;
  role: string;
  location: string;
  rating: number;
  date: string;
  serviceUsed: string;
  review: string;
}
