import { useState } from 'react'
import Layout from './components/Layout'
import Login from './components/Login'
import ChatArea, { ConvTree } from './components/ChatArea'
import { initialArtifacts, recentReports, Artifact, Report } from './data/mockData'

export type ReportPhase = 'type-selection' | 'upload' | 'active'

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    // Company settings gate
    const [companySettingsCompleted, setCompanySettingsCompleted] = useState(false)

    // Reports start empty — loaded after company settings
    const [reports, setReports] = useState<Report[]>([])
    const [selectedReport, setSelectedReport] = useState<string | null>(null)
    const [artifacts, setArtifacts] = useState<Artifact[]>([])
    const [conversations, setConversations] = useState<Record<string, ConvTree>>({})

    // Per-report onboarding phase
    const [reportPhases, setReportPhases] = useState<Record<string, ReportPhase>>({})
    const [reportTypeNames, setReportTypeNames] = useState<Record<string, string>>({})

    // Called when the user saves Company Settings
    const handleCompanySettingsComplete = () => {
        setCompanySettingsCompleted(true)
        setReports(recentReports)
        setArtifacts(initialArtifacts)
    }

    const handleNewReport = (): string => {
        const newReport: Report = {
            id: `rep-${Date.now()}`,
            title: 'New Consultation',
            date: new Date().toISOString().split('T')[0],
            status: 'Draft',
            progress: 0,
        }
        setReports(prev => [newReport, ...prev])
        setSelectedReport(newReport.id)
        setReportPhases(prev => ({ ...prev, [newReport.id]: 'type-selection' }))
        return newReport.id
    }

    const handleRenameReport = (id: string, title: string) => {
        setReports(prev => prev.map(r => r.id === id ? { ...r, title: title.trim() || 'New Consultation' } : r))
    }

    const handleDeleteReport = (id: string) => {
        setReports(prev => prev.filter(r => r.id !== id))
        if (selectedReport === id) setSelectedReport(null)
    }

    // User picks a report type in the onboarding flow
    const handleSelectReportType = (typeId: string, typeName: string) => {
        if (!selectedReport) return
        setReportTypeNames(prev => ({ ...prev, [selectedReport]: typeName }))
        setReportPhases(prev => ({ ...prev, [selectedReport]: 'upload' }))
    }

    // User skips or finishes document upload
    const handleDocumentsReady = () => {
        if (!selectedReport) return
        setReportPhases(prev => ({ ...prev, [selectedReport]: 'active' }))
    }

    const handleTreeChange = (tree: ConvTree) => {
        if (selectedReport) {
            setConversations(prev => ({ ...prev, [selectedReport]: tree }))
        }
    }

    const handleFork = (snapshot: ConvTree) => {
        const newId = handleNewReport()
        // Override — forked reports already have context, so go straight to active
        setReportPhases(prev => ({ ...prev, [newId]: 'active' }))
        setConversations(prev => ({ ...prev, [newId]: snapshot }))
    }

    const handleUpload = (file: File) => {
        const newArtifact: Artifact = {
            id: `art-${Date.now()}`,
            name: file.name,
            type: 'upload',
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        setArtifacts(prev => [newArtifact, ...prev])
        // Uploading a file during the upload phase advances the report to active
        if (selectedReport && reportPhases[selectedReport] === 'upload') {
            setReportPhases(prev => ({ ...prev, [selectedReport!]: 'active' }))
        }
    }

    const handleDeleteArtifact = (id: string) => {
        setArtifacts(prev => prev.filter(art => art.id !== id))
    }

    if (!isLoggedIn) {
        return <Login onLogin={() => setIsLoggedIn(true)} />
    }

    const selectedReportTitle = reports.find(r => r.id === selectedReport)?.title
    // For existing/example reports that have no phase, default to 'active'
    const currentPhase: ReportPhase | null = selectedReport
        ? (reportPhases[selectedReport] ?? 'active')
        : null
    const currentTypeName = selectedReport ? (reportTypeNames[selectedReport] ?? null) : null

    return (
        <Layout
            reports={reports}
            onSelectReport={setSelectedReport}
            selectedReport={selectedReport}
            onNewReport={handleNewReport}
            onRenameReport={handleRenameReport}
            onDeleteReport={handleDeleteReport}
            onLogout={() => setIsLoggedIn(false)}
            artifacts={artifacts}
            onDeleteArtifact={handleDeleteArtifact}
            companySettingsCompleted={companySettingsCompleted}
            onCompanySettingsComplete={handleCompanySettingsComplete}
        >
            <ChatArea
                selectedReport={selectedReport}
                reportTitle={selectedReportTitle}
                initialTree={selectedReport ? (conversations[selectedReport] ?? []) : []}
                onTreeChange={handleTreeChange}
                onFork={handleFork}
                onUpload={handleUpload}
                isSetupMode={!companySettingsCompleted}
                reportPhase={currentPhase}
                selectedTypeName={currentTypeName}
                onSelectReportType={handleSelectReportType}
                onDocumentsReady={handleDocumentsReady}
            />
        </Layout>
    )
}

export default App
