import React from 'react'

interface BrandtuitLogoProps {
    size?: 'sm' | 'md' | 'lg'
    showZena?: boolean
}

const BrandtuitLogo: React.FC<BrandtuitLogoProps> = ({ size = 'md', showZena = true }) => {
    const iconSize = size === 'sm' ? 20 : size === 'lg' ? 40 : 28
    const textSize = size === 'sm' ? '20px' : size === 'lg' ? '36px' : '28px'
    const zenaSize = size === 'sm' ? '10px' : size === 'lg' ? '16px' : '12px'

    return (
        <div className={`brandtuit-logo-container ${size}`}>
            <div className="logo-main">
                <svg
                    width={iconSize}
                    height={iconSize}
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="logo-icon"
                >
                    {/* Document outline */}
                    <path
                        d="M38 42V14.5L30.5 7H10C8.89543 7 8 7.89543 8 9V42C8 43.1046 8.89543 44 10 44H38C39.1046 44 40 43.1046 40 42Z"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinejoin="round"
                    />
                    {/* Folded corner */}
                    <path
                        d="M30 7V15H38.5"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinejoin="round"
                    />
                    {/* Search Square */}
                    <rect
                        x="18"
                        y="24"
                        width="10"
                        height="8"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {/* Search Line */}
                    <path
                        d="M18 32L12 38"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                </svg>
                <span className="brand-name" style={{ fontSize: textSize }}>
                    Brandtuit<span className="tm">TM</span>
                </span>
            </div>
            {showZena && (
                <div className="zena-subtext" style={{ fontSize: zenaSize }}>
                    ZENA
                </div>
            )}

            <style>{`
        .brandtuit-logo-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          color: var(--primary);
          line-height: 1;
        }
        .logo-main {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .brand-name {
          font-family: var(--font-display);
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #03116d; /* Explicitly use the Brandtuit Navy */
        }
        .tm {
          font-size: 0.45em;
          vertical-align: super;
          margin-left: 1px;
          font-weight: 700;
        }
        .zena-subtext {
          font-family: var(--font-label);
          font-weight: 800;
          letter-spacing: 0.4em;
          opacity: 0.4;
          margin-top: 2px;
          margin-left: 32px; /* Offset to align under 'Brandtuit' text */
        }
        
        .brandtuit-logo-container.sm .zena-subtext { margin-left: 32px; letter-spacing: 0.35em; }
        .brandtuit-logo-container.md .zena-subtext { margin-left: 40px; }
        .brandtuit-logo-container.lg .zena-subtext { margin-left: 52px; }
      `}</style>
        </div>
    )
}

export default BrandtuitLogo
