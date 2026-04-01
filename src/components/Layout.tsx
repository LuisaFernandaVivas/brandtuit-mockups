import React, { useState, useRef, useEffect } from 'react'
import {
  ChevronDown,
  LogOut,
  User,
  Zap,
  MessageSquare,
  Search,
  Plus,
  ChevronRight,
  Trash2,
  Pencil,
  Settings2,
  Menu,
  X
} from 'lucide-react'

import { Artifact, Report } from '../data/mockData'
import BrandtuitLogo from './BrandtuitLogo'
import CompanySettingsDrawer from './CompanySettingsDrawer'

interface LayoutProps {
  children: React.ReactNode
  reports: Report[]
  onSelectReport: (id: string) => void
  selectedReport: string | null
  onNewReport: () => string
  onRenameReport: (id: string, title: string) => void
  onDeleteReport: (id: string) => void
  onLogout: () => void
  artifacts: Artifact[]
  onDeleteArtifact?: (id: string) => void
  companySettingsCompleted: boolean
  onCompanySettingsComplete: () => void
  openCompanySettings?: boolean
  onCompanySettingsOpenHandled?: () => void
}

const Layout: React.FC<LayoutProps> = ({ children, reports, onSelectReport, selectedReport, onNewReport, onRenameReport, onDeleteReport, onLogout, artifacts, onDeleteArtifact, companySettingsCompleted, onCompanySettingsComplete, openCompanySettings, onCompanySettingsOpenHandled }) => {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [companySettingsOpen, setCompanySettingsOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  // Auto-open drawer when triggered from the tour
  useEffect(() => {
    if (openCompanySettings) {
      setCompanySettingsOpen(true)
      onCompanySettingsOpenHandled?.()
    }
  }, [openCompanySettings]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNewReport = () => {
    const id = onNewReport()
    setEditingTitle('New Consultation')
    setEditingId(id)
  }

  const commitEdit = () => {
    if (editingId) {
      onRenameReport(editingId, editingTitle)
      setEditingId(null)
    }
  }

  return (
    <>
    <div className="layout-container">
      {/* Mobile sidebar backdrop */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BrandtuitLogo size="sm" />
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="workspace-container">
          <div className="workspace-selector">
            <span className="workspace-name">Wellbeam/TruSkin</span>
            <div className="selector-arrows">
              <ChevronDown size={14} />
            </div>
          </div>
          <button
            className={`company-settings-btn ${!companySettingsCompleted ? 'company-settings-btn--highlight' : ''}`}
            onClick={() => setCompanySettingsOpen(true)}
          >
            <Settings2 size={14} />
            <span>Company Settings</span>
            {!companySettingsCompleted && (
              <span style={{
                marginLeft: 'auto', background: 'var(--primary)', color: 'white',
                fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
                letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>Required</span>
            )}
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">

            {/* ── Setup gate callout ── */}
            {!companySettingsCompleted && (
              <div className="setup-callout" onClick={() => setCompanySettingsOpen(true)}>
                <p className="setup-callout-text">Complete Company Settings to unlock reports and start your first consultation.</p>
                <span className="setup-callout-cta">Set up now →</span>
              </div>
            )}

            <div className="section-header">
              <span className="section-title">RECENT REPORTS</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="new-report-btn"
                  onClick={companySettingsCompleted ? handleNewReport : undefined}
                  title={companySettingsCompleted ? 'New report' : 'Complete Company Settings first'}
                  style={{ opacity: companySettingsCompleted ? undefined : 0.25, cursor: companySettingsCompleted ? 'pointer' : 'not-allowed' }}
                >
                  <Plus size={14} />
                </button>
                {companySettingsCompleted && <button className="view-all">View all</button>}
              </div>
            </div>

            {companySettingsCompleted && (
            <div className="reports-list">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={`report-item ${selectedReport === report.id ? 'active' : ''}`}
                  onClick={() => { if (editingId !== report.id) { onSelectReport(report.id); setSidebarOpen(false) } }}
                  style={{ cursor: editingId === report.id ? 'default' : 'pointer' }}
                >
                  <div className="report-icon">
                    <MessageSquare size={16} />
                  </div>
                  <div className="report-info">
                    {editingId === report.id ? (
                      <input
                        ref={editInputRef}
                        className="report-title-input"
                        value={editingTitle}
                        onChange={e => setEditingTitle(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={e => {
                          if (e.key === 'Enter') commitEdit()
                          if (e.key === 'Escape') { setEditingTitle(report.title); setEditingId(null) }
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span className="report-title">{report.title}</span>
                    )}
                    {editingId !== report.id && (
                      <div className="report-meta">
                        <span className="report-date">{report.date}</span>
                        <div className="progress-dots">
                          {[...Array(6)].map((_, i) => (
                            <div
                              key={i}
                              className={`dot ${i < report.progress ? 'filled' : ''} ${report.status === 'Draft' && i === report.progress - 1 ? 'active' : ''}`}
                            />
                          ))}
                        </div>
                        <span className={`status-badge ${report.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {report.status}
                        </span>
                      </div>
                    )}
                  </div>
                  {editingId !== report.id && (
                    <div className="report-actions" onClick={e => e.stopPropagation()}>
                      <button
                        className="report-action-btn"
                        title="Rename"
                        onClick={() => { setEditingTitle(report.title); setEditingId(report.id) }}
                      >
                        <Pencil size={13} />
                      </button>
                      {report.status !== 'Completed' && (
                        <button
                          className="report-action-btn delete"
                          title="Delete"
                          onClick={() => onDeleteReport(report.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="unified-mini-card">
            <div className="user-row">
              <div className="mini-avatar">
                <User size={14} />
              </div>
              <div className="user-meta">
                <span className="user-name">Lisa</span>
                <span className="user-job">Consultant</span>
              </div>
              <button className="mini-logout" onClick={onLogout}>
                <LogOut size={14} />
              </button>
            </div>

            <div className="plan-row">
              <div className="mini-plan">
                <Zap size={10} fill="currentColor" />
                <span>Enterprise</span>
              </div>
              <span className="mini-status">Active</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-stage">
        <header className="stage-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="breadcrumb">
              <span className="bc-root">Strategy Archive</span>
              <ChevronRight size={14} />
              <span className="bc-current">
                {selectedReport ? reports.find(r => r.id === selectedReport)?.title : "New Consultation"}
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-icon"><Search size={20} /></button>
          </div>
        </header>

        <div className="stage-content">
          <div className="stage-inner">
            <div className="middle-viewport">
              {children}
            </div>
            <aside className="artifacts-rail">
              <div className="rail-header">
                <span className="section-title">ARTIFACTS</span>
              </div>
              <div className="artifacts-list">
                {artifacts.map((art: Artifact) => (
                  <div key={art.id} className="artifact-card">
                    <div className="artifact-details">
                      <span className="artifact-name">{art.name}</span>
                      <span className="artifact-meta">{art.date} • {art.type}</span>
                    </div>
                    {onDeleteArtifact && (
                      <button className="delete-art" onClick={() => onDeleteArtifact(art.id)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </main>

    </div>

    <CompanySettingsDrawer
      isOpen={companySettingsOpen}
      onClose={() => setCompanySettingsOpen(false)}
      onComplete={() => { onCompanySettingsComplete(); setCompanySettingsOpen(false) }}
    />
    </>
  )
}

export default Layout
