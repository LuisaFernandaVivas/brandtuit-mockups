import { useState } from 'react'
import Layout from './components/Layout'
import Login from './components/Login'
import ChatArea, { ConvTree } from './components/ChatArea'
import { initialArtifacts, recentReports, Artifact, Report } from './data/mockData'

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [reports, setReports] = useState<Report[]>(recentReports)
    const [selectedReport, setSelectedReport] = useState<string | null>(null)
    const [artifacts, setArtifacts] = useState<Artifact[]>(initialArtifacts)
    const [conversations, setConversations] = useState<{ [reportId: string]: ConvTree }>({})

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
        return newReport.id
    }

    const handleRenameReport = (id: string, title: string) => {
        setReports(prev => prev.map(r => r.id === id ? { ...r, title: title.trim() || 'New Consultation' } : r))
    }

    const handleDeleteReport = (id: string) => {
        setReports(prev => prev.filter(r => r.id !== id))
        if (selectedReport === id) setSelectedReport(null)
    }

    const handleTreeChange = (tree: ConvTree) => {
        if (selectedReport) {
            setConversations(prev => ({ ...prev, [selectedReport]: tree }))
        }
    }

    const handleFork = (snapshot: ConvTree) => {
        const newId = handleNewReport()
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
    }

    const handleDeleteArtifact = (id: string) => {
        setArtifacts(prev => prev.filter(art => art.id !== id))
    }

    if (!isLoggedIn) {
        return <Login onLogin={() => setIsLoggedIn(true)} />
    }

    const selectedReportTitle = reports.find(r => r.id === selectedReport)?.title

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
        >
            <ChatArea
                selectedReport={selectedReport}
                reportTitle={selectedReportTitle}
                initialTree={selectedReport ? (conversations[selectedReport] ?? []) : []}
                onTreeChange={handleTreeChange}
                onFork={handleFork}
                onUpload={handleUpload}
            />
        </Layout>
    )
}

export default App
