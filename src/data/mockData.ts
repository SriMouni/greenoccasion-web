import { Paper, Topic, Author, Review } from '../types';

export const TOPICS: Topic[] = [
  {
    id: 'carbon-capture',
    name: 'Carbon Capture',
    description: 'Technologies that capture carbon dioxide from industrial emissions or directly from the atmosphere.',
    icon: 'Magnet',
  },
  {
    id: 'renewable-energy',
    name: 'Renewable Energy',
    description: 'Research on solar, wind, hydro, and other sustainable energy sources to replace fossil fuels.',
    icon: 'Sun',
  },
  {
    id: 'industrial-emissions',
    name: 'Industrial Emissions',
    description: 'Strategies for reducing the carbon footprint of manufacturing, construction, and heavy industry.',
    icon: 'Factory',
  },
  {
    id: 'transportation-emissions',
    name: 'Transportation Emissions',
    description: 'Innovations in electric vehicles, public transit, and sustainable aviation fuels.',
    icon: 'Truck',
  },
  {
    id: 'climate-policy',
    name: 'Climate Policy',
    description: 'Analysis of international agreements, carbon taxes, and regulatory frameworks for emission reduction.',
    icon: 'Gavel',
  },
  {
    id: 'carbon-accounting',
    name: 'Carbon Accounting',
    description: 'Methods for measuring, reporting, and verifying greenhouse gas emissions across various sectors.',
    icon: 'Calculator',
  },
];

export const PAPERS: Paper[] = [
  {
    id: '1',
    title: 'Direct Air Capture: Efficiency Analysis of Solid Sorbent Systems',
    authors: ['Dr. Sarah Chen', 'James Wilson'],
    institution: 'Global Climate Institute',
    publicationDate: '2024-01-15',
    publicationYear: 2024,
    topic: 'Carbon Capture',
    abstract: 'This research evaluates the energy efficiency of various solid sorbent materials used in direct air capture (DAC) systems. We present a comparative study of adsorption kinetics and regeneration energy requirements, providing a roadmap for scaling DAC technologies to gigaton levels.',
    downloads: 1240,
    citations: 45,
    status: 'approved',
    keywords: ['DAC', 'Sorbents', 'Energy Efficiency', 'Carbon Removal'],
  },
  {
    id: '2',
    title: 'Decarbonizing the Steel Industry: Hydrogen-Based Reduction Pathways',
    authors: ['Dr. Michael Schmidt'],
    institution: 'European Industrial Research Center',
    publicationDate: '2023-11-20',
    publicationYear: 2023,
    topic: 'Industrial Emissions',
    abstract: 'The steel industry is responsible for approximately 7% of global CO2 emissions. This paper explores the transition from traditional blast furnaces to hydrogen-based direct reduced iron (DRI) processes, analyzing the economic and technical feasibility of green steel production.',
    downloads: 890,
    citations: 28,
    status: 'approved',
    keywords: ['Green Steel', 'Hydrogen', 'Industrial Decarbonization'],
  },
  {
    id: '3',
    title: 'Impact of Urban Green Spaces on Local Carbon Sequestration',
    authors: ['Elena Rodriguez', 'David Park'],
    institution: 'University of Environmental Sciences',
    publicationDate: '2024-02-10',
    publicationYear: 2024,
    topic: 'Climate Policy',
    abstract: 'Urban areas are significant sources of carbon emissions. This study quantifies the carbon sequestration potential of various urban park designs in metropolitan areas, suggesting that strategic landscaping can offset up to 5% of local transportation emissions.',
    downloads: 560,
    citations: 12,
    status: 'approved',
    keywords: ['Urban Forestry', 'Sequestration', 'Climate Adaptation'],
  },
  {
    id: '4',
    title: 'Next-Generation Perovskite Solar Cells: Stability and Scalability',
    authors: ['Dr. Sarah Chen'],
    institution: 'Global Climate Institute',
    publicationDate: '2023-09-05',
    publicationYear: 2023,
    topic: 'Renewable Energy',
    abstract: 'Perovskite solar cells have shown remarkable efficiency gains but face challenges in long-term stability. This paper details a novel encapsulation technique that extends device lifetime to over 10,000 hours under continuous operation.',
    downloads: 2100,
    citations: 88,
    status: 'approved',
    keywords: ['Solar Energy', 'Perovskite', 'Photovoltaics'],
  },
];

export const REVIEWS: Record<string, Review[]> = {
  '1': [
    {
      id: 'r1',
      reviewerName: 'Prof. Robert Miller',
      date: '2023-12-20',
      comment: 'A very thorough analysis of sorbent performance. The methodology is sound and the results are significant for the field of carbon removal.',
      recommendation: 'approve',
    },
    {
      id: 'r2',
      reviewerName: 'Dr. Linda Wu',
      date: '2023-12-28',
      comment: 'Excellent work. I suggest adding more detail on the regeneration cycles in the supplementary material.',
      recommendation: 'approve',
    },
  ],
};

export const AUTHORS: Record<string, Author> = {
  'Dr. Sarah Chen': {
    name: 'Dr. Sarah Chen',
    institution: 'Global Climate Institute',
    researchAreas: ['Carbon Capture', 'Renewable Energy', 'Materials Science'],
    totalPublications: 24,
    bio: 'Dr. Sarah Chen is a leading researcher in the field of carbon mitigation technologies. Her work focuses on developing high-efficiency materials for carbon capture and next-generation solar energy systems.',
  },
};
