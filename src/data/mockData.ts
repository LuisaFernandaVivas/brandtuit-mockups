export interface Report {
    id: string;
    title: string;
    date: string;
    status: 'Draft' | 'Completed' | 'Restatement Ready';
    progress: number;
}

export const recentReports: Report[] = [
    { id: 'rep-1', title: 'TruSkin Brand Audit Draft', date: '2026-01-30', status: 'Draft', progress: 1 },
    { id: 'rep-2', title: 'TruSkin New Concept Generator', date: '2026-01-14', status: 'Completed', progress: 6 },
    { id: 'rep-3', title: 'TruSkin New Positioning Brainstormer v8', date: '2026-01-11', status: 'Completed', progress: 6 },
    { id: 'rep-4', title: 'Wellbeam Q4 Competitive Landscape', date: '2026-01-10', status: 'Completed', progress: 6 },
    { id: 'rep-5', title: 'Wellbeam Messaging Restatement', date: '2025-12-17', status: 'Restatement Ready', progress: 2 },
]

export const mockDocuments = [
    { id: '1', name: 'Brand Strategy Q1.pdf', date: 'Mar 15, 2026' },
    { id: '2', name: 'Competitor Analysis - Ultima.docx', date: 'Mar 20, 2026' },
    { id: '3', name: 'Market Trends 2026.pdf', date: 'Mar 22, 2026' },
]

export interface Artifact {
    id: string;
    name: string;
    type: 'upload' | 'generation';
    date: string;
}

export const initialArtifacts: Artifact[] = [
    { id: 'art-1', name: 'Original Request.pdf', type: 'upload', date: 'Mar 26, 19:30' },
    { id: 'art-2', name: 'Strategic Pillars v1.docx', type: 'generation', date: 'Mar 26, 19:35' },
]

export const initialMessages = [
    { role: 'assistant', content: 'Hello! I am Zena. I have analyzed your 20+ documents and recent decision briefs. How can I help you refine your strategy today?' }
]

export interface ReportType {
    id: string
    name: string
    description: string
    estimated: string
}

export interface ReportCategory {
    category: string
    types: ReportType[]
}

export const REPORT_CATEGORIES: ReportCategory[] = [
    {
        category: 'Analysis',
        types: [
            { id: 'competitive-deep-dive', name: 'Competitive Deep Dive & Market Gap Spotter', description: 'Comprehensive analysis of competitive landscape, market gaps, and strategic positioning opportunities', estimated: '4-6 days' },
            { id: 'category-growth-scanner', name: 'Category Growth Scanner', description: 'Analysis of category growth trends, opportunities, and market dynamics', estimated: '3-5 days' },
            { id: 'category-deep-dive', name: 'Category Deep Dive', description: 'In-depth analysis of category dynamics, players, and strategic opportunities', estimated: '4-6 days' },
            { id: 'new-competitor-analyzer', name: 'New Competitor Analyzer', description: 'Comprehensive analysis of new and emerging competitors in the market', estimated: '3-5 days' },
            { id: 'pricing-analyzer', name: 'Pricing Analyzer', description: 'Deep dive into pricing strategies, competitive positioning, and market pricing analysis', estimated: '3-5 days' },
        ]
    },
    {
        category: 'Strategy',
        types: [
            { id: '60-day-plan', name: '60-Day Social & Digital Domination Plan', description: 'Strategic 60-day plan for dominating social media and digital marketing channels', estimated: '5-7 days' },
            { id: 'new-positioning-brainstormer', name: 'New Positioning/Product Brain Stormer', description: 'Innovative brainstorming and ideation system for new product concepts, positioning strategies, and market opportunities', estimated: '5-7 days' },
            { id: 'new-claims-brainstormer', name: 'New Claims/Positioning "Brain Stormer"', description: 'Creative brainstorming system for developing new brand claims and positioning strategies', estimated: '4-6 days' },
            { id: 'message-breakthrough', name: 'Message Breakthrough (Generic)', description: 'Intake system to translate an existing brand positioning into a sharper, more ownable, more memorable messaging platform with clear ambition, constraints, and competitive POV.', estimated: '4-6 days' },
        ]
    }
]
