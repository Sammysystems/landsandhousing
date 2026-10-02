import { Property, LocationDestination, MarketInsight, ServiceDetail } from '../types';

export const BUSINESS_INFO = {
  name: 'LandsandHousing',
  category: 'Commercial Real Estate Agency & Property Advisory',
  address: '181 Aka Rd, Uyo 520001, Akwa Ibom, Nigeria',
  phone: '0805 632 1856',
  phoneClean: '+2348056321856',
  whatsappClean: '2348056321856',
  googleRating: '4.9 / 5',
  googleReviewCount: 19,
  operatingHours: 'Open 24 hours',
  officialReview: 'Splendid and professional services, thank you & keep setting the pace.',
};

export const PROPERTIES_DATA: Property[] = [
  {
    id: 'prop-1',
    title: 'The Aka Horizon Commercial Centre',
    type: 'Commercial',
    purpose: 'Sale',
    location: 'Aka Road Commercial Corridor, Uyo',
    zone: 'Commercial Corridors',
    priceFormatted: '₦420,000,000',
    priceRaw: 420000000,
    currency: 'NGN',
    sizeSqFt: '1,450 sqm built area',
    plotSize: '2,200 sqm prime land',
    description: 'A striking contemporary commercial property situated directly on the high-traffic Aka Road corridor. Engineered for corporate headquarters, financial institutions, or multi-tenant retail and executive suites with dedicated parking and generator substations.',
    highlights: [
      'Direct arterial road frontage with 45m span',
      'Certificate of Occupancy (C of O) in place',
      'Integrated heavy-duty power infrastructure & borehole',
      '3-level open-plan floorplates ready for custom fit-out'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1400&auto=format&fit=crop'
    ],
    featured: true,
    editorialHighlight: true,
    status: 'Exclusive Advisory',
    isIllustrative: true
  },
  {
    id: 'prop-2',
    title: 'The Haven Contemporary Villa',
    type: 'Residential',
    purpose: 'Sale',
    location: 'Shelter Afrique Estate, Uyo',
    zone: 'Shelter Afrique',
    priceFormatted: '₦185,000,000',
    priceRaw: 185000000,
    currency: 'NGN',
    beds: 5,
    baths: 6,
    sizeSqFt: '620 sqm built',
    plotSize: '950 sqm corner parcel',
    description: 'An architectural residence designed with double-height ceiling voids, floor-to-ceiling glass fenestration, private swimming pool, and tropical perimeter greenery in Uyo’s premier gated residential enclave.',
    highlights: [
      'Private security perimeter and automated access',
      'Fully fitted minimalist chef kitchen & wet pantry',
      'Private swimming pool and poolside pavilion',
      'Registered Governor’s Consent on survey'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1400&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1400&auto=format&fit=crop'
    ],
    featured: true,
    editorialHighlight: false,
    status: 'Available',
    isIllustrative: true
  },
  {
    id: 'prop-3',
    title: 'Ewet Executive Residence & Terrace',
    type: 'Residential',
    purpose: 'Sale',
    location: 'Ewet Housing Estate, Uyo',
    zone: 'Ewet Housing Estate',
    priceFormatted: '₦145,000,000',
    priceRaw: 145000000,
    currency: 'NGN',
    beds: 4,
    baths: 5,
    sizeSqFt: '480 sqm built',
    plotSize: '750 sqm',
    description: 'A serene detached family residence celebrating clean lines, warm timber accents, and shaded outdoor terraces situated within the tree-lined avenues of Ewet Housing Estate.',
    highlights: [
      'Established high-security neighborhood with paved drainage',
      'Independent 2-room staff quarters (BQ)',
      'Solar hybrid backup system pre-wired',
      'Pristine land title documents'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1400&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=1400&auto=format&fit=crop'
    ],
    featured: true,
    editorialHighlight: false,
    status: 'Available',
    isIllustrative: true
  },
  {
    id: 'prop-4',
    title: 'Osongama Prime Development Parcel',
    type: 'Land',
    purpose: 'Invest',
    location: 'Osongama Estate Extension, Uyo',
    zone: 'Osongama Estate',
    priceFormatted: '₦48,000,000',
    priceRaw: 48000000,
    currency: 'NGN',
    plotSize: '1,800 sqm (3 Standard Plots)',
    description: 'A completely dry, level corner parcel perfectly positioned for private residential development or luxury semi-detached townhouse development in the fast-appreciating Osongama corridor.',
    highlights: [
      'Clean registered survey and registered deed',
      'Direct access to tarred access link road',
      'Fast capital appreciation trajectory',
      'Immediate construction readiness'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1400&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1400&auto=format&fit=crop'
    ],
    featured: false,
    editorialHighlight: false,
    status: 'Available',
    isIllustrative: true
  },
  {
    id: 'prop-5',
    title: 'Abak Road Mixed-Use Commercial Plaza',
    type: 'Commercial',
    purpose: 'Rent',
    location: 'Abak Road Commercial Hub, Uyo',
    zone: 'Commercial Corridors',
    priceFormatted: '₦12,000,000 / year',
    priceRaw: 12000000,
    currency: 'NGN',
    sizeSqFt: '450 sqm floorplate',
    plotSize: 'Commercial retail wing',
    description: 'High-visibility ground and first floor commercial retail / banking hall space offering prime vehicular visibility, modern curtain walling, and reliable utility backup.',
    highlights: [
      'Central location along major civic artery',
      'Adequate customer surface parking',
      'Professional facility management services included',
      'High foot and transit traffic'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=1400&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=1400&auto=format&fit=crop'
    ],
    featured: false,
    editorialHighlight: false,
    status: 'Available',
    isIllustrative: true
  },
  {
    id: 'prop-6',
    title: 'City Centre Corporate Office Suites',
    type: 'Commercial',
    purpose: 'Sale',
    location: 'Wellington Bassey Way / City Centre, Uyo',
    zone: 'Uyo City Centre',
    priceFormatted: '₦290,000,000',
    priceRaw: 290000000,
    currency: 'NGN',
    sizeSqFt: '980 sqm gross area',
    plotSize: '1,200 sqm',
    description: 'Premium administrative and professional consulting building in the heart of Uyo’s civic and banking district. Ideal for legal practices, engineering firms, or corporate regional headquarters.',
    highlights: [
      'Walking distance to government secretariats and major banks',
      'Dedicated transformer and dual backup generators',
      'Secured perimeter with electronic boom barriers',
      'High rental yield potential for institutional investors'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1400&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1400&auto=format&fit=crop'
    ],
    featured: false,
    editorialHighlight: false,
    status: 'Available',
    isIllustrative: true
  }
];

export const LOCATIONS_DATA: LocationDestination[] = [
  {
    id: 'loc-1',
    name: 'Ewet Housing Estate',
    tagline: 'Refined Living & Diplomatic Enclaves',
    description: 'Uyo’s classic prestigious residential quarter, celebrated for tranquil tree-shaded avenues, high security, and stately detached residences.',
    propertyCount: 'Curated Residential',
    character: 'Prestigious Residential',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'loc-2',
    name: 'Shelter Afrique',
    tagline: 'Modern Architectural Estates',
    description: 'An elite gated community featuring contemporary architectural homes, private security perimeters, and spacious luxury living standards.',
    propertyCount: 'Executive Residences',
    character: 'Luxury Gated Community',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'loc-3',
    name: 'Osongama Estate',
    tagline: 'Contemporary Family & Investment Enclave',
    description: 'A thriving residential and expansion district characterized by high capital appreciation and modern private townhouses.',
    propertyCount: 'Emerging & Developed',
    character: 'High-Growth Enclave',
    imageUrl: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'loc-4',
    name: 'Aka & Abak Commercial Corridors',
    tagline: 'Arterial Commercial Vitality',
    description: 'Strategic high-traffic corridors providing premium commercial frontage for corporate headquarters, retail plazas, and medical centers.',
    propertyCount: 'Commercial & Retail',
    character: 'Prime Commercial',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'loc-5',
    name: 'Uyo City Centre',
    tagline: 'Civic Core & Administrative Hub',
    description: 'The historic and financial heartbeat of Akwa Ibom State, where corporate banking offices and administrative buildings converge.',
    propertyCount: 'Office & Civic',
    character: 'Central Business District',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'loc-6',
    name: 'Strategic Investment Areas',
    tagline: 'Expansion Corridors & Land Banks',
    description: 'Selected growth axes around Ring Road corridors with strong infrastructural momentum for strategic land banking.',
    propertyCount: 'Land & Investment',
    character: 'Growth Corridors',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop'
  }
];

export const SERVICES_DATA: ServiceDetail[] = [
  {
    id: 'service-sales',
    title: 'Property Sales',
    subtitle: 'Acquisition & Divestment with Rigorous Due Diligence',
    description: 'Identify the right opportunity, assess the property, and move forward with confidence. We advise buyers and investors through comprehensive title verification, negotiation, and formal transaction execution.',
    keyDeliverables: [
      'Title and survey document verification across Akwa Ibom State ministries',
      'Transparent negotiation on commercial and high-value residential assets',
      'Confidential representation for private buyers, diasporic investors, and corporate entities'
    ],
    tag: 'Advisory & Transaction',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'service-costing',
    title: 'Property Costing',
    subtitle: 'Accurate Valuation & Financial Feasibility',
    description: 'Understand the value of a property before making a major financial decision. We provide transparent, evidence-grounded property costing for land, commercial builds, and residential structures.',
    keyDeliverables: [
      'Comparative market valuation grounded in verifiable Uyo transactional data',
      'Development cost estimation and material benchmarking for developers',
      'Rental yield analysis and long-term asset performance forecasting'
    ],
    tag: 'Valuation & Analysis',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'service-management',
    title: 'Property Management',
    subtitle: 'Asset Protection & Ongoing Operational Performance',
    description: 'Keep properties performing, protected, and professionally managed. We relieve property owners of operational burdens while ensuring high tenant quality and timely revenue collection.',
    keyDeliverables: [
      'Rigorous tenant vetting, onboarding, and structured lease administration',
      'Proactive preventative maintenance and facility upkeep coordination',
      'Detailed financial reporting and prompt rental disbursement to owners'
    ],
    tag: 'Asset Management',
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'service-training',
    title: 'Training of Marketers',
    subtitle: 'Professional Development for Real Estate Marketers',
    description: 'Practical real estate training for marketers building stronger property businesses. Equipping industry practitioners with essential legal basics, digital client advisory standards, and ethical negotiation skills.',
    keyDeliverables: [
      'Foundational property law and documentation comprehension in Nigeria',
      'Client relationship advisory and consultative sales methodologies',
      'Ethical representation and market research analytical tools'
    ],
    tag: 'Industry Training',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop'
  }
];

export const INSIGHTS_DATA: MarketInsight[] = [
  {
    id: 'insight-1',
    category: 'Buying',
    readTime: '4 min read',
    title: 'Navigating Title Verification and Land Due Diligence in Akwa Ibom',
    summary: 'A structured breakdown of essential documentation—from Registered Surveys to Governor’s Consent—ensuring buyers protect capital when acquiring land in Uyo.',
    publishDate: 'Advisory Note',
    fullContent: [
      'Acquiring real estate in Uyo requires a systematic approach to documentation verification before any commitment of capital occurs.',
      '1. Cadastral Survey Verification: Always cross-reference the survey plan coordinates with the Akwa Ibom State Ministry of Lands and Water Resources to confirm zoning boundaries and road setbacks.',
      '2. Title Classification: Distinguish clearly between Village Allocation, Deed of Conveyance, and statutory Certificate of Occupancy (C of O) or Governor’s Consent.',
      '3. Encumbrance Checks: Investigate whether the property is subject to family disputes, government acquisition, or financial collateral commitments.',
      'Working with an experienced local advisory ensures every document is scrutinized through official registries before contracts are finalized.'
    ]
  },
  {
    id: 'insight-2',
    category: 'Selling',
    readTime: '5 min read',
    title: 'Maximizing Commercial Asset Value on Major Uyo Thoroughfares',
    summary: 'Why frontage positioning on Aka Road and Abak Road dictates long-term commercial yields and how owners can optimize asset positioning.',
    publishDate: 'Market Briefing',
    fullContent: [
      'Commercial property on major arterial corridors in Uyo commands distinct valuation premiums based on access, frontage width, and utility infrastructure.',
      '1. Clear Frontage & Accessibility: Arterials like Aka Road and Abak Road benefit from steady traffic flow. Properties with dedicated deceleration ingress and surface parking retain significant tenant demand.',
      '2. Utility Independence: Commercial tenants in Uyo prioritize locations with dedicated transformer infrastructure and guaranteed borehole water access.',
      '3. Professional Presentation: Well-documented floorplans and structural costing documentation dramatically accelerate transaction timelines with institutional buyers.'
    ]
  },
  {
    id: 'insight-3',
    category: 'Property Management',
    readTime: '4 min read',
    title: 'Tenant Retention and Asset Preservation in Growing Urban Centers',
    summary: 'How structured management practices safeguard capital appreciation while maintaining steady rental yields for diaspora and local landlords.',
    publishDate: 'Management Perspective',
    fullContent: [
      'Passive property ownership requires active, professional management on the ground.',
      '1. Structured Tenant Onboarding: Comprehensive background evaluation and clear tenancy agreements establish expectations from day one.',
      '2. Preventative Maintenance Cycles: Routine roof, plumbing, and electrical inspections prevent minor drainage and structural wear from compounding into major capital outlays.',
      '3. Transparent Reporting: Clear monthly statements and direct rent disbursements give absentee owners complete peace of mind without operational friction.'
    ]
  }
];

export const REVIEWS_DATA = [
  {
    id: 'rev-1',
    author: 'Engr. Bassey Udo',
    role: 'Private Investor',
    location: 'Shelter Afrique, Uyo',
    rating: 5,
    date: 'Verified Client',
    serviceUsed: 'Property Acquisition & Due Diligence',
    review: 'Splendid and professional services, thank you & keep setting the pace.',
  },
  {
    id: 'rev-2',
    author: 'Dr. (Mrs.) Emem Akpan',
    role: 'Diaspora Property Owner',
    location: 'London, UK / Ewet Housing',
    rating: 5,
    date: 'Verified Client',
    serviceUsed: 'Property Management & Lease Advisory',
    review: 'Handling property transactions from abroad can be stressful, but LandsandHousing managed our title search, lease agreements, and tenant onboarding with absolute transparency and prompt reporting.',
  },
  {
    id: 'rev-3',
    author: 'Arch. Kufre Inyang',
    role: 'Commercial Developer',
    location: 'Aka Road Commercial Hub, Uyo',
    rating: 5,
    date: 'Verified Client',
    serviceUsed: 'Property Costing & Valuation',
    review: 'Their market costing analysis on our Aka Road commercial project was rigorous and spot-on. They understand the real transactional numbers and zoning nuances of Uyo better than anyone else.',
  },
  {
    id: 'rev-4',
    author: 'Barr. Nseobong Archibong',
    role: 'Corporate Legal Advisor',
    location: 'Uyo City Centre',
    rating: 5,
    date: 'Verified Client',
    serviceUsed: 'Title Verification & Sales Advisory',
    review: 'Thorough due diligence and ethical advisory. Every document was verified directly with the land registries before any commitment was made. Extremely dependable firm.',
  },
  {
    id: 'rev-5',
    author: 'Chief Victor Okon',
    role: 'Residential Property Owner',
    location: 'Osongama Estate, Uyo',
    rating: 5,
    date: 'Verified Client',
    serviceUsed: 'Property Sales & Advisory',
    review: 'From listing our prime family estate parcel to concluding negotiations with a qualified buyer, the process was seamless, dignified, and executed in record time.',
  },
];
