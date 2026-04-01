import React, { useState, useRef, useEffect } from 'react'
import {
  Send, Paperclip, Pencil,
  ChevronLeft, ChevronRight,
  Copy, ThumbsUp, ThumbsDown, MoreHorizontal, GitBranch,
  Upload, ArrowRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { REPORT_CATEGORIES } from '../data/mockData'
import type { ReportPhase } from '../App'

// ─── Exported types ───────────────────────────────────────────────────────────

export interface ExchangeVersion {
  userContent: string
  assistantResponse: string
}

export interface ExchangeNode {
  id: string
  versions: ExchangeVersion[]
  activeVersion: number
  children: { [versionIdx: number]: ExchangeNode[] }
}

export type ConvTree = ExchangeNode[]

// ─── Tree helpers ─────────────────────────────────────────────────────────────

function appendNode(nodes: ConvTree, newNode: ExchangeNode): ConvTree {
  if (nodes.length === 0) return [newNode]
  const last = nodes[nodes.length - 1]
  const av = last.activeVersion
  return [
    ...nodes.slice(0, -1),
    { ...last, children: { ...last.children, [av]: appendNode(last.children[av] ?? [], newNode) } }
  ]
}

function editNode(nodes: ConvTree, nodeId: string, newContent: string): ConvTree {
  return nodes.map(node => {
    if (node.id === nodeId) {
      const newIdx = node.versions.length
      return {
        ...node,
        versions: [...node.versions, { userContent: newContent, assistantResponse: '' }],
        activeVersion: newIdx,
        children: { ...node.children, [newIdx]: [] }
      }
    }
    const av = node.activeVersion
    return { ...node, children: { ...node.children, [av]: editNode(node.children[av] ?? [], nodeId, newContent) } }
  })
}

function setResponse(nodes: ConvTree, nodeId: string, versionIdx: number, response: string): ConvTree {
  return nodes.map(node => {
    if (node.id === nodeId) {
      const versions = node.versions.map((v, i) => i === versionIdx ? { ...v, assistantResponse: response } : v)
      return { ...node, versions }
    }
    const av = node.activeVersion
    return { ...node, children: { ...node.children, [av]: setResponse(node.children[av] ?? [], nodeId, versionIdx, response) } }
  })
}

function changeVersion(nodes: ConvTree, nodeId: string, newVersion: number): ConvTree {
  return nodes.map(node => {
    if (node.id === nodeId) return { ...node, activeVersion: newVersion }
    const av = node.activeVersion
    return { ...node, children: { ...node.children, [av]: changeVersion(node.children[av] ?? [], nodeId, newVersion) } }
  })
}

function findVersionCount(nodes: ConvTree, nodeId: string): number {
  for (const node of nodes) {
    if (node.id === nodeId) return node.versions.length
    for (const children of Object.values(node.children)) {
      const found = findVersionCount(children, nodeId)
      if (found !== -1) return found
    }
  }
  return -1
}

export function snapshotUpTo(nodes: ConvTree, nodeId: string): ConvTree | null {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (node.id === nodeId) {
      return [...nodes.slice(0, i), { ...node, children: { [node.activeVersion]: [] } }]
    }
    const av = node.activeVersion
    const result = snapshotUpTo(node.children[av] ?? [], nodeId)
    if (result !== null) {
      return [
        ...nodes.slice(0, i),
        { ...node, children: { ...node.children, [av]: result } }
      ]
    }
  }
  return null
}

// ─── Flatten to renderable list ───────────────────────────────────────────────

interface FlatItem {
  key: string
  role: 'user' | 'assistant'
  content: string
  nodeId: string
  versionCount?: number
  activeVersion?: number
}

function flattenTree(nodes: ConvTree): FlatItem[] {
  return nodes.flatMap(node => {
    const v = node.versions[node.activeVersion]
    const items: FlatItem[] = [{
      key: `${node.id}-u`,
      role: 'user',
      content: v.userContent,
      nodeId: node.id,
      versionCount: node.versions.length,
      activeVersion: node.activeVersion,
    }]
    if (v.assistantResponse) {
      items.push({ key: `${node.id}-a`, role: 'assistant', content: v.assistantResponse, nodeId: node.id })
    }
    return [...items, ...flattenTree(node.children[node.activeVersion] ?? [])]
  })
}

// ─── Help-mode responses ──────────────────────────────────────────────────────

const HELP_RESPONSES = [
  "To get started with Zena, complete your Company Settings in the left sidebar. Fill in your Client Profile (name, role, contact) and Company Profile details, then save. Once done, your reports section will unlock.",
  "Zena is your strategic AI companion. After completing Company Settings, you can create reports by clicking the + button next to 'Recent Reports'. Each report starts with choosing an analysis type.",
  "Once set up, Zena supports two report categories — Analysis (competitive, category, pricing) and Strategy (positioning, brand claims, digital plans). Select the type that matches your current initiative.",
  "Your Company Settings inform Zena's context — brand, regions, visual identity. The more detail you provide, the more tailored and precise your strategic outputs will be.",
  "Zena can help you with competitive analysis, brand positioning, market research, and 60-day strategic plans. Complete your Company Settings to begin your first consultation.",
]

// ─── Greetings per mode ───────────────────────────────────────────────────────

const SETUP_GREETING = `Welcome to Zena — your strategic intelligence companion.\n\nBefore we begin, please complete your Company Settings in the left sidebar. This helps me understand your brand context so I can deliver precise, relevant strategic outputs.\n\nFeel free to ask me anything about the platform in the meantime.`

const NO_REPORT_GREETING = `Welcome back. Select a report from the sidebar to continue a consultation, or click the + button to start a new one.`

const ACTIVE_GREETING = `Hello! I am Zena. I have analyzed your documents and recent decision briefs. How can I help you refine your strategy today?`

// ─── Internal sub-components ──────────────────────────────────────────────────

const ReportTypeGrid: React.FC<{ onSelect: (id: string, name: string) => void }> = ({ onSelect }) => {
  const [hovered, setHovered] = useState<string | null>(null)
  return (
    <div style={{ padding: '4px 0 8px' }}>
      {REPORT_CATEGORIES.map(cat => (
        <div key={cat.category} style={{ marginBottom: 24 }}>
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: 17, fontStyle: 'italic',
            fontWeight: 400, color: 'var(--on-surface)', marginBottom: 10,
          }}>
            {cat.category}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
            {cat.types.map(type => (
              <button
                key={type.id}
                onClick={() => onSelect(type.id, type.name)}
                onMouseEnter={() => setHovered(type.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  textAlign: 'left', padding: '14px 16px',
                  borderRadius: 6,
                  border: `1px solid ${hovered === type.id ? 'rgba(89,96,97,0.45)' : 'var(--outline-variant)'}`,
                  background: hovered === type.id ? 'var(--surface-container-low)' : 'var(--surface-container-lowest)',
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-label)', fontWeight: 600, fontSize: 13,
                  color: 'var(--on-surface)', lineHeight: 1.4,
                }}>
                  {type.name}
                </span>
                <span style={{
                  fontFamily: 'var(--font-label)', fontSize: 11.5,
                  color: 'var(--on-surface-variant)', lineHeight: 1.55, flex: 1,
                }}>
                  {type.description}
                </span>
                <span style={{
                  fontFamily: 'var(--font-label)', fontSize: 10.5,
                  color: 'var(--on-surface-variant)', opacity: 0.55, marginTop: 2,
                }}>
                  Estimated: {type.estimated}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const UploadStep: React.FC<{
  typeName: string | null
  onSkip: () => void
  onFileUpload: (file: File) => void
}> = ({ typeName, onSkip, onFileUpload }) => {
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    Array.from(files).forEach(f => onFileUpload(f))
  }

  return (
    <div style={{ padding: '8px 0 4px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `1.5px dashed ${dragOver ? 'var(--primary)' : 'var(--outline-variant)'}`,
          borderRadius: 6, padding: '32px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          background: dragOver ? 'var(--surface-container-low)' : 'var(--surface-container-lowest)',
          cursor: 'pointer', transition: 'all 0.2s',
        }}
      >
        <Upload size={22} style={{ color: 'var(--on-surface-variant)', opacity: 0.45 }} />
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-label)', fontSize: 13, fontWeight: 500, color: 'var(--on-surface)', marginBottom: 4 }}>
            Drop files here or click to browse
          </p>
          <p style={{ fontFamily: 'var(--font-label)', fontSize: 11.5, color: 'var(--on-surface-variant)', opacity: 0.65 }}>
            PDF, Word, Excel, PowerPoint accepted
          </p>
        </div>
        <input
          ref={fileRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={onSkip}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--font-label)', fontSize: 12, fontWeight: 500,
            color: 'var(--on-surface-variant)', padding: '6px 12px',
            borderRadius: 4, border: '1px solid var(--outline-variant)',
            background: 'transparent', cursor: 'pointer',
          }}
        >
          Continue without documents <ArrowRight size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

interface ChatAreaProps {
  selectedReport: string | null
  reportTitle?: string
  initialTree?: ConvTree
  onTreeChange?: (tree: ConvTree) => void
  onFork?: (snapshot: ConvTree) => void
  onUpload?: (file: File) => void
  // Onboarding props
  isSetupMode: boolean
  reportPhase: ReportPhase | null
  selectedTypeName: string | null
  onSelectReportType?: (typeId: string, typeName: string) => void
  onDocumentsReady?: () => void
}

const ChatArea: React.FC<ChatAreaProps> = ({
  selectedReport, reportTitle, initialTree, onTreeChange, onFork, onUpload,
  isSetupMode, reportPhase, selectedTypeName, onSelectReportType, onDocumentsReady
}) => {
  const [tree, setTree] = useState<ConvTree>(initialTree ?? [])
  const [isTyping, setIsTyping] = useState(false)
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [openPopover, setOpenPopover] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTree(initialTree ?? [])
    setInput('')
    setIsTyping(false)
    setEditingNodeId(null)
    setOpenPopover(null)
  }, [selectedReport]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [tree, isTyping])

  useEffect(() => {
    if (!openPopover) return
    const handler = () => setOpenPopover(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [openPopover])

  const updateTree = (updater: (prev: ConvTree) => ConvTree) => {
    setTree(prev => {
      const next = updater(prev)
      onTreeChange?.(next)
      return next
    })
  }

  const getMockResponse = (content: string): string => {
    if (isSetupMode) {
      const lc = content.toLowerCase()
      if (lc.includes('report') || lc.includes('create') || lc.includes('start'))
        return HELP_RESPONSES[1]
      if (lc.includes('type') || lc.includes('analysis') || lc.includes('strateg'))
        return HELP_RESPONSES[2]
      if (lc.includes('setting') || lc.includes('company') || lc.includes('profile'))
        return HELP_RESPONSES[3]
      return HELP_RESPONSES[Math.floor(Math.random() * HELP_RESPONSES.length)]
    }
    return `I've refined the strategy based on your input. Looking at the ${reportTitle ? `"${reportTitle}"` : 'overall project'}, we could optimize the core value proposition by focusing on the insights regarding "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}".`
  }

  const simulateTyping = (nodeId: string, versionIdx: number, content: string) => {
    setIsTyping(true)
    setTimeout(() => {
      updateTree(prev => setResponse(prev, nodeId, versionIdx, getMockResponse(content)))
      setIsTyping(false)
    }, 1500)
  }

  const handleSend = () => {
    if (!input.trim() || isTyping) return
    const content = input.trim()
    setInput('')
    const nodeId = `node-${Date.now()}`
    const newNode: ExchangeNode = {
      id: nodeId,
      versions: [{ userContent: content, assistantResponse: '' }],
      activeVersion: 0,
      children: { 0: [] }
    }
    updateTree(prev => appendNode(prev, newNode))
    simulateTyping(nodeId, 0, content)
  }

  const handleEditSubmit = (nodeId: string) => {
    const content = editingContent.trim()
    if (!content || isTyping) return
    setEditingNodeId(null)
    const newVersionIdx = findVersionCount(tree, nodeId)
    if (newVersionIdx === -1) return
    updateTree(prev => editNode(prev, nodeId, content))
    simulateTyping(nodeId, newVersionIdx, content)
  }

  const handleForkAt = (nodeId: string) => {
    setOpenPopover(null)
    const snapshot = snapshotUpTo(tree, nodeId)
    if (snapshot) onFork?.(snapshot)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    onUpload?.(file)
    if (reportPhase !== 'upload') {
      // In active mode, add an upload message to the tree
      const content = `Uploaded: ${file.name}`
      const nodeId = `node-${Date.now()}`
      const newNode: ExchangeNode = {
        id: nodeId,
        versions: [{ userContent: content, assistantResponse: '' }],
        activeVersion: 0,
        children: { 0: [] }
      }
      updateTree(prev => appendNode(prev, newNode))
      simulateTyping(nodeId, 0, content)
    }
  }

  const flatItems = flattenTree(tree)

  // Determine which sections to render
  const isTypeSelection = !isSetupMode && reportPhase === 'type-selection'
  const isUpload = !isSetupMode && reportPhase === 'upload'
  const isActive = !isSetupMode && (reportPhase === 'active' || (!reportPhase && selectedReport !== null))
  const isNoReport = !isSetupMode && !selectedReport
  const inputDisabled = isTypeSelection || isUpload

  const getInputPlaceholder = () => {
    if (isTypeSelection) return 'Select a report type above to continue...'
    if (isUpload) return 'Upload documents using the area above to continue...'
    if (isSetupMode) return 'Ask how to use Zena...'
    if (isNoReport) return 'Select a report to start chatting...'
    return reportTitle ? `Inquire about ${reportTitle}...` : 'Consult with Zena...'
  }

  const getGreeting = () => {
    if (isSetupMode) return SETUP_GREETING
    if (isNoReport) return NO_REPORT_GREETING
    return ACTIVE_GREETING
  }

  return (
    <div className="chat-container">
      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

      <div className="messages-list" ref={scrollRef}>
        <div className="messages-inner">

          {/* ── Greeting (shown in all modes except type-selection and upload) ── */}
          {!isTypeSelection && !isUpload && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="message-row assistant">
              <div className="message-bubble">
                <div className="message-content" style={{ whiteSpace: 'pre-line' }}>{getGreeting()}</div>
              </div>
            </motion.div>
          )}

          {/* ── TYPE SELECTION PHASE ── */}
          {isTypeSelection && (
            <>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="message-row assistant">
                <div className="message-bubble">
                  <div className="message-content">
                    Welcome! Let's set up your new report. Please select the type of analysis you'd like to work on:
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <ReportTypeGrid onSelect={(id, name) => onSelectReportType?.(id, name)} />
              </motion.div>
            </>
          )}

          {/* ── UPLOAD PHASE ── */}
          {isUpload && (
            <>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="message-row assistant">
                <div className="message-bubble">
                  <div className="message-content">
                    Excellent choice —{' '}
                    <strong style={{ fontWeight: 600, fontStyle: 'normal' }}>{selectedTypeName}</strong>{' '}
                    selected. Please upload the relevant documents to begin your analysis. PDF, Word, Excel, and PowerPoint files are supported.
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <UploadStep
                  typeName={selectedTypeName}
                  onSkip={() => onDocumentsReady?.()}
                  onFileUpload={file => onUpload?.(file)}
                />
              </motion.div>
            </>
          )}

          {/* ── NORMAL CONVERSATION MESSAGES (active mode or setup help mode) ── */}
          {(isActive || isSetupMode) && (
            <AnimatePresence>
              {flatItems.map(item => {
                if (item.role === 'assistant') {
                  return (
                    <motion.div key={item.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="message-row assistant">
                      <div className="message-bubble">
                        <div className="message-content">{item.content}</div>
                      </div>
                      <div className="assistant-actions">
                        <button className="msg-action-btn" title="Copy" onClick={() => navigator.clipboard.writeText(item.content)}>
                          <Copy size={14} />
                        </button>
                        <button className="msg-action-btn" title="Good response"><ThumbsUp size={14} /></button>
                        <button className="msg-action-btn" title="Bad response"><ThumbsDown size={14} /></button>
                        <div className="popover-anchor">
                          <button
                            className={`msg-action-btn ${openPopover === item.nodeId ? 'active' : ''}`}
                            title="More"
                            onClick={e => { e.stopPropagation(); setOpenPopover(openPopover === item.nodeId ? null : item.nodeId) }}
                          >
                            <MoreHorizontal size={14} />
                          </button>
                          {openPopover === item.nodeId && (
                            <div className="fork-popover" onClick={e => e.stopPropagation()}>
                              <button className="fork-option" onClick={() => handleForkAt(item.nodeId)}>
                                <GitBranch size={14} />
                                <span>Branch in new chat</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                }

                const isEditing = editingNodeId === item.nodeId
                return (
                  <motion.div key={item.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="message-row user">
                    <div className={`message-bubble user-bubble${isEditing ? ' editing' : ''}`}>
                      {isEditing ? (
                        <div className="edit-mode">
                          <textarea
                            value={editingContent}
                            onChange={e => setEditingContent(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditSubmit(item.nodeId) }
                              if (e.key === 'Escape') setEditingNodeId(null)
                            }}
                            autoFocus
                          />
                          <div className="edit-actions">
                            <button className="edit-cancel" onClick={() => setEditingNodeId(null)}>Cancel</button>
                            <button className="edit-save" onClick={() => handleEditSubmit(item.nodeId)}>Send</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="message-content">{item.content}</div>
                          <div className="message-footer">
                            {(item.versionCount ?? 0) > 1 && (
                              <div className="version-nav">
                                <button
                                  onClick={() => updateTree(prev => changeVersion(prev, item.nodeId, (item.activeVersion ?? 0) - 1))}
                                  disabled={(item.activeVersion ?? 0) === 0}
                                >
                                  <ChevronLeft size={11} />
                                </button>
                                <span>{(item.activeVersion ?? 0) + 1} / {item.versionCount}</span>
                                <button
                                  onClick={() => updateTree(prev => changeVersion(prev, item.nodeId, (item.activeVersion ?? 0) + 1))}
                                  disabled={(item.activeVersion ?? 0) === (item.versionCount ?? 1) - 1}
                                >
                                  <ChevronRight size={11} />
                                </button>
                              </div>
                            )}
                            <button
                              className="edit-btn"
                              title="Edit message"
                              onClick={() => { setEditingNodeId(item.nodeId); setEditingContent(item.content) }}
                            >
                              <Pencil size={12} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}

          {isTyping && <div className="typing-indicator">Zena is curating a response...</div>}
        </div>
      </div>

      <div className="input-outer">
        <div className={`input-pill ${inputDisabled ? 'input-pill--disabled' : ''}`}>
          {!inputDisabled && (
            <button className="tool-btn" onClick={() => fileInputRef.current?.click()}>
              <Paperclip size={20} />
            </button>
          )}
          <textarea
            placeholder={getInputPlaceholder()}
            value={input}
            disabled={inputDisabled}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => !inputDisabled && e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            rows={1}
          />
          <button
            className={`send-btn ${input.trim() && !inputDisabled ? 'active' : ''}`}
            onClick={!inputDisabled ? handleSend : undefined}
            disabled={inputDisabled}
          >
            <Send size={18} />
          </button>
        </div>
        <p className="input-disclaimer">Strategic insights may require verification. Zena AI serves as a companion to human expertise.</p>
      </div>

      <style>{`
        .chat-container {
          height: 100%;
          display: flex;
          flex-direction: column;
          width: 100%;
          position: relative;
          background: var(--surface-container-lowest);
        }
        .messages-list {
          flex: 1;
          overflow-y: auto;
          padding: var(--spacing-10) var(--spacing-24);
          display: flex;
          flex-direction: column;
        }
        .messages-inner {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-10);
        }
        .message-row {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .message-row.user {
          align-items: flex-end;
        }
        .message-row.assistant {
          align-items: flex-start;
        }
        .message-bubble {
          padding: 1.25rem 1.75rem;
          font-family: var(--font-body);
          font-size: 17px;
          line-height: 1.85;
          border-radius: 20px;
        }
        .user .message-bubble {
          max-width: 52%;
          background: var(--surface-container-high);
          color: var(--on-surface);
          border: none;
          font-family: var(--font-label);
          font-size: 15px;
          font-weight: 400;
          line-height: 1.65;
        }
        .assistant .message-bubble {
          max-width: 78%;
          background: var(--surface-container-lowest);
          color: var(--on-surface);
          border: none;
          font-style: italic;
          font-weight: 400;
        }

        /* ── Assistant action bar ── */
        .assistant-actions {
          display: flex;
          align-items: center;
          gap: 2px;
          margin-top: 8px;
          opacity: 0;
          transition: opacity 0.15s ease;
        }
        .message-row.assistant:hover .assistant-actions {
          opacity: 1;
        }
        .msg-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          color: var(--on-surface-variant);
          opacity: 0.45;
          transition: opacity 0.15s, background 0.15s;
        }
        .msg-action-btn:hover,
        .msg-action-btn.active {
          background: var(--surface-container-high);
          opacity: 1;
        }
        .popover-anchor {
          position: relative;
        }
        .fork-popover {
          position: absolute;
          bottom: calc(100% + 6px);
          left: 0;
          background: var(--on-surface);
          border-radius: 4px;
          padding: 4px;
          min-width: 190px;
          box-shadow: 0 4px 20px rgba(45,52,53,0.18);
          z-index: 50;
        }
        .fork-option {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 12px;
          border-radius: 3px;
          color: white;
          font-family: var(--font-label);
          font-size: 12px;
          font-weight: 400;
          transition: background 0.15s;
        }
        .fork-option:hover {
          background: rgba(255,255,255,0.08);
        }

        /* ── User message footer ── */
        .message-footer {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          justify-content: flex-end;
          min-height: 20px;
        }
        .edit-btn {
          opacity: 0;
          color: var(--on-surface-variant);
          padding: 4px 6px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          transition: opacity 0.15s, background 0.15s;
        }
        .user-bubble:hover .edit-btn {
          opacity: 0.45;
        }
        .edit-btn:hover {
          opacity: 1 !important;
          background: rgba(172,179,180,0.15);
        }
        .version-nav {
          display: flex;
          align-items: center;
          gap: 3px;
          font-family: var(--font-label);
          font-size: 11px;
          font-weight: 600;
          color: var(--on-surface-variant);
          opacity: 0.55;
        }
        .version-nav button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 3px;
          transition: background 0.15s, opacity 0.15s;
        }
        .version-nav button:hover:not(:disabled) {
          background: rgba(172,179,180,0.15);
          opacity: 1;
        }
        .version-nav button:disabled {
          opacity: 0.25;
          cursor: default;
        }

        /* ── Edit mode ── */
        .message-bubble.editing {
          background: var(--surface-container-high);
          width: 52%;
          max-width: 52%;
        }
        .edit-mode {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }
        .edit-mode textarea {
          width: 100%;
          background: transparent;
          border: none;
          resize: none;
          font-family: var(--font-body);
          font-size: 15px;
          line-height: 1.7;
          color: var(--on-surface);
          min-height: 56px;
        }
        .edit-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        .edit-cancel {
          font-family: var(--font-label);
          font-size: 12px;
          font-weight: 500;
          padding: 6px 14px;
          border-radius: 4px;
          color: var(--on-surface-variant);
          background: transparent;
          transition: background 0.2s;
        }
        .edit-cancel:hover { background: rgba(172,179,180,0.15); }
        .edit-save {
          font-family: var(--font-label);
          font-size: 12px;
          font-weight: 500;
          padding: 6px 16px;
          border-radius: 4px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dim));
          color: white;
          box-shadow: 0 2px 8px rgba(61, 74, 143, 0.25);
        }

        /* ── Typing indicator ── */
        .typing-indicator {
          font-family: var(--font-body);
          font-size: 15px;
          font-style: italic;
          font-weight: 400;
          color: var(--on-surface-variant);
          opacity: 0.6;
          margin-top: 8px;
        }

        /* ── Input area ── */
        .input-outer {
          padding: var(--spacing-6) var(--spacing-24) var(--spacing-10);
        }
        .input-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: var(--surface-container-highest);
          border-radius: 100px;
          border: none;
          transition: all 0.2s ease;
        }
        .input-pill:focus-within {
          box-shadow: 0 0 0 2px rgba(61, 74, 143, 0.18);
        }
        .input-pill--disabled {
          background: var(--surface-container-high);
          opacity: 0.65;
        }
        .input-pill textarea {
          flex: 1;
          border: none;
          background: transparent;
          resize: none;
          padding: 6px 0;
          font-family: var(--font-label);
          font-size: 14px;
          color: var(--on-surface);
        }
        .input-pill textarea:disabled {
          cursor: not-allowed;
          color: var(--on-surface-variant);
        }
        .tool-btn {
          color: var(--on-surface-variant);
          opacity: 0.45;
          padding: 6px;
          border-radius: 4px;
          transition: opacity 0.2s, background 0.2s;
        }
        .tool-btn:hover { opacity: 1; background: var(--surface-container-high); }
        .send-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--surface-container-high);
          color: var(--on-surface-variant);
          opacity: 0.3;
          transition: all 0.25s ease;
          flex-shrink: 0;
        }
        .send-btn.active {
          background: linear-gradient(135deg, var(--primary), var(--primary-dim));
          color: white;
          opacity: 1;
          box-shadow: 0 2px 10px rgba(61, 74, 143, 0.3);
        }
        .input-disclaimer {
          text-align: center;
          font-family: var(--font-label);
          font-size: 10px;
          color: var(--on-surface-variant);
          opacity: 0.35;
          margin-top: 12px;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
          letter-spacing: 0.01em;
        }

        /* ── Responsive ── */
        @media (max-width: 1280px) {
          .messages-list {
            padding: var(--spacing-10) var(--spacing-10);
          }
          .input-outer {
            padding: var(--spacing-4) var(--spacing-10) var(--spacing-8);
          }
        }

        @media (max-width: 768px) {
          .messages-list {
            padding: 20px 16px;
          }
          .messages-inner {
            gap: 20px;
          }
          .message-bubble {
            padding: 1rem 1.25rem;
            font-size: 16px;
          }
          .user .message-bubble {
            max-width: 82%;
          }
          .assistant .message-bubble {
            max-width: 92%;
          }
          .message-bubble.editing {
            width: 82%;
            max-width: 82%;
          }
          .input-outer {
            padding: 12px 12px 20px;
          }
          .input-pill {
            padding: 10px 14px;
            border-radius: 100px;
          }
          .input-disclaimer {
            font-size: 10px;
            margin-top: 10px;
          }
          .fork-popover {
            left: auto;
            right: 0;
          }
        }

        @media (max-width: 480px) {
          .user .message-bubble {
            max-width: 90%;
            font-size: 15px;
          }
          .assistant .message-bubble {
            max-width: 96%;
            font-size: 15px;
          }
          .message-bubble.editing {
            width: 90%;
            max-width: 90%;
          }
          .assistant-actions {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default ChatArea
