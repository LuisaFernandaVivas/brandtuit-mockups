import React, { useState, useRef } from 'react'
import { X, Plus, Upload } from 'lucide-react'

interface CompanySettingsDrawerProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: () => void
}

interface ColorEntry {
  id: string
  hex: string
}

const CompanySettingsDrawer: React.FC<CompanySettingsDrawerProps> = ({ isOpen, onClose, onComplete }) => {
  // Client Profile
  const [clientName, setClientName] = useState('')
  const [yourRole, setYourRole] = useState('')
  const [contactInfo, setContactInfo] = useState('')

  // Company Profile
  const [companyBrands, setCompanyBrands] = useState('')
  const [geographicRegions, setGeographicRegions] = useState('')
  const [colors, setColors] = useState<ColorEntry[]>([{ id: '1', hex: '#000000' }])
  const [brandVisualStyle, setBrandVisualStyle] = useState('')
  const [brandVisualMood, setBrandVisualMood] = useState('')
  const [brandVisualIdentity, setBrandVisualIdentity] = useState('')

  // Gallery
  const [images, setImages] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const addColor = () => {
    if (colors.length < 10) {
      setColors([...colors, { id: Date.now().toString(), hex: '#000000' }])
    }
  }

  const removeColor = (id: string) => {
    setColors(colors.filter(c => c.id !== id))
  }

  const updateColor = (id: string, hex: string) => {
    setColors(colors.map(c => c.id === id ? { ...c, hex } : c))
  }

  const handleGalleryFiles = (files: FileList | null) => {
    if (!files) return
    const remaining = 10 - images.length
    const newFiles = Array.from(files).slice(0, remaining)
    newFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImages(prev => [...prev, e.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="cs-backdrop"
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.25)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: 'min(560px, 100vw)',
          background: 'var(--surface-container-lowest)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: 'clamp(16px, 4vw, 28px) clamp(16px, 5vw, 32px) 20px',
          borderBottom: '1px solid var(--outline-variant)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500, marginBottom: 4 }}>
              Company Settings
            </h2>
            <p style={{ fontFamily: 'var(--font-label)', fontSize: 13, color: 'var(--on-surface-variant)', opacity: 0.7 }}>
              Manage your company and client information
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 8, borderRadius: 10, color: 'var(--on-surface-variant)',
              opacity: 0.5, marginTop: 2,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(16px, 4vw, 24px) clamp(16px, 5vw, 32px) 40px' }}>

          {/* ── Client Profile ── */}
          <Section title="Client Profile">
            <Field label="Client Name" hint="The name of your organization or company">
              <input
                style={inputStyle}
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder=""
              />
            </Field>
            <Field label="Your Role" hint="Your job title or position within the organization">
              <input
                style={inputStyle}
                value={yourRole}
                onChange={e => setYourRole(e.target.value)}
                placeholder=""
              />
            </Field>
            <Field label="Contact Information" hint="Primary email address or phone number for contact">
              <input
                style={inputStyle}
                value={contactInfo}
                onChange={e => setContactInfo(e.target.value)}
                placeholder=""
              />
            </Field>
            <button
              style={saveBtnStyle}
              onClick={() => {
                if (clientName.trim()) onComplete?.()
              }}
            >
              Save
            </button>
          </Section>

          {/* ── Company Profile ── */}
          <Section title="Company Profile">
            <Field label="Company Brands" hint="List your company's brands or product lines (comma-separated)">
              <input
                style={inputStyle}
                value={companyBrands}
                onChange={e => setCompanyBrands(e.target.value)}
                placeholder=""
              />
            </Field>
            <Field label="Geographic Regions" hint="Primary geographic markets or regions where your company operates">
              <input
                style={inputStyle}
                value={geographicRegions}
                onChange={e => setGeographicRegions(e.target.value)}
                placeholder=""
              />
            </Field>

            <Field label="Brand Color Palette" hint="Add up to 10 hex colors to represent your visual identity">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {colors.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="color"
                      value={c.hex}
                      onChange={e => updateColor(c.id, e.target.value)}
                      style={{
                        width: 40, height: 34, padding: 2, borderRadius: 4,
                        border: '1px solid var(--outline-variant)', cursor: 'pointer',
                        background: 'none', flexShrink: 0,
                      }}
                    />
                    <input
                      style={{ ...inputStyle, flex: 1 }}
                      value={c.hex}
                      onChange={e => updateColor(c.id, e.target.value)}
                      placeholder="#000000"
                    />
                    <button
                      onClick={() => removeColor(c.id)}
                      style={{
                        fontFamily: 'var(--font-label)', fontSize: 12, fontWeight: 400,
                        padding: '7px 12px', borderRadius: 4, flexShrink: 0,
                        border: '1px solid var(--outline-variant)',
                        color: 'var(--on-surface-variant)', background: 'none',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {colors.length < 10 && (
                  <button
                    onClick={addColor}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontFamily: 'var(--font-label)', fontSize: 12, fontWeight: 400,
                      padding: '7px 14px', borderRadius: 4, alignSelf: 'flex-start',
                      border: '1px solid var(--outline-variant)',
                      color: 'var(--on-surface-variant)', background: 'none',
                    }}
                  >
                    <Plus size={14} /> Add Color
                  </button>
                )}
              </div>
            </Field>

            <Field label="Brand Visual Style" hint="Describe the style direction (e.g., minimal, bold, editorial)">
              <input
                style={inputStyle}
                value={brandVisualStyle}
                onChange={e => setBrandVisualStyle(e.target.value)}
                placeholder=""
              />
            </Field>
            <Field label="Brand Visual Mood" hint="Capture the emotional tone you want the brand to communicate">
              <input
                style={inputStyle}
                value={brandVisualMood}
                onChange={e => setBrandVisualMood(e.target.value)}
                placeholder=""
              />
            </Field>
            <Field label="Brand Visual Identity Description" hint="Add extra context about how your brand should look and feel">
              <textarea
                style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                value={brandVisualIdentity}
                onChange={e => setBrandVisualIdentity(e.target.value)}
              />
            </Field>
            <button style={saveBtnStyle}>Save</button>
          </Section>

          {/* ── Company Reference Gallery ── */}
          <div style={{
            background: 'var(--surface-container-lowest)', borderRadius: 6,
            border: '1px solid var(--outline-variant)',
            padding: '20px', marginBottom: 20,
          }}>
            <p style={sectionTitleStyle}>Company Reference Gallery</p>
            <p style={hintStyle}>Upload up to 10 brand reference images</p>
            <p style={{ fontFamily: 'var(--font-label)', fontSize: 12, color: 'var(--on-surface-variant)', opacity: 0.6, marginBottom: 16 }}>
              {images.length} / 10 images
            </p>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleGalleryFiles(e.dataTransfer.files) }}
              style={{
                border: `1.5px dashed ${dragOver ? 'var(--primary)' : 'var(--outline-variant)'}`,
                borderRadius: 4, padding: '32px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 12, marginBottom: 12,
                background: dragOver ? 'var(--primary-container)' : 'transparent',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onClick={() => galleryInputRef.current?.click()}
            >
              <button
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dim))', color: 'white',
                  fontFamily: 'var(--font-label)', fontSize: 13, fontWeight: 500,
                  padding: '9px 16px', borderRadius: 4,
                  boxShadow: '0 2px 8px rgba(61, 74, 143, 0.25)',
                }}
                onClick={e => { e.stopPropagation(); galleryInputRef.current?.click() }}
              >
                Add a file
              </button>
              <span style={{ fontFamily: 'var(--font-label)', fontSize: 14, color: 'var(--on-surface-variant)' }}>
                or drag here
              </span>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={e => handleGalleryFiles(e.target.files)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button
                style={{
                  fontFamily: 'var(--font-label)', fontSize: 13, fontWeight: 500,
                  padding: '9px 18px', borderRadius: 4,
                  background: images.length > 0 ? 'linear-gradient(135deg, var(--primary), var(--primary-dim))' : 'var(--surface-container-highest)',
                  color: images.length > 0 ? 'white' : 'var(--on-surface-variant)',
                  opacity: images.length > 0 ? 1 : 0.6,
                  cursor: images.length > 0 ? 'pointer' : 'default',
                }}
              >
                Upload Image
              </button>
            </div>

            {images.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-label)', fontSize: 13, color: 'var(--on-surface-variant)', opacity: 0.5 }}>
                No images uploaded yet.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {images.map((src, i) => (
                  <div key={i} style={{ position: 'relative', borderRadius: 4, overflow: 'hidden', aspectRatio: '1' }}>
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      style={{
                        position: 'absolute', top: 4, right: 4,
                        background: 'rgba(0,0,0,0.5)', color: 'white',
                        borderRadius: 3, padding: 4, display: 'flex',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 4,
  border: '1px solid var(--outline-variant)',
  fontFamily: 'var(--font-label)',
  fontSize: 14,
  color: 'var(--on-surface)',
  background: 'var(--surface-container-lowest)',
  outline: 'none',
  transition: 'border-color 0.15s',
}

const saveBtnStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, var(--primary), var(--primary-dim))',
  color: 'white',
  fontFamily: 'var(--font-label)',
  fontSize: 13,
  fontWeight: 500,
  padding: '9px 18px',
  borderRadius: 4,
  marginTop: 4,
  boxShadow: '0 2px 8px rgba(61, 74, 143, 0.25)',
}

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 18,
  fontWeight: 500,
  fontStyle: 'italic',
  color: 'var(--on-surface)',
  marginBottom: 4,
}

const hintStyle: React.CSSProperties = {
  fontFamily: 'var(--font-label)',
  fontSize: 12,
  color: 'var(--on-surface-variant)',
  opacity: 0.65,
  marginBottom: 12,
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{
    background: 'var(--surface-container-lowest)', borderRadius: 6,
    border: '1px solid var(--outline-variant)',
    padding: '20px', marginBottom: 20,
    display: 'flex', flexDirection: 'column', gap: 16,
  }}>
    <p style={sectionTitleStyle}>{title}</p>
    {children}
  </div>
)

const Field: React.FC<{ label: string; hint: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <p style={{ fontFamily: 'var(--font-label)', fontSize: 13, fontWeight: 500, color: 'var(--on-surface)' }}>
      {label}
    </p>
    <p style={hintStyle}>{hint}</p>
    {children}
  </div>
)

export default CompanySettingsDrawer
