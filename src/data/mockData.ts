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
