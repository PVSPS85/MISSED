import { ReactNode, useEffect, useRef, useState } from "react"
import ExtensionSuite from "./Extension"

type IconName = "arrow" | "check" | "chevron" | "clock" | "file" | "filter" | "lock" | "message" | "plus" | "search" | "send" | "spark" | "trash" | "upload"

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m14 7 5 5-5 5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    file: (
      <>
        <path d="M7 3h7l4 4v14H7z" />
        <path d="M14 3v5h5M10 13h5M10 17h5" />
      </>
    ),
    filter: <path d="M4 6h16M7 12h10M10 18h4" />,
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="1" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    message: <path d="M4 5h16v12H9l-5 4z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    send: <path d="m3 11 18-8-7 18-3-7zM11 14 21 3" />,
    spark: (
      <>
        <path d="m12 3 1.3 4.2L17 9l-3.7 1.8L12 15l-1.3-4.2L7 9l3.7-1.8z" />
        <path d="m18.5 15 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z" />
      </>
    ),
    trash: (
      <>
        <path d="M5 7h14M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" />
      </>
    ),
    upload: (
      <>
        <path d="M12 16V4m0 0L7 9m5-5 5 5" />
        <path d="M4 15v5h16v-5" />
      </>
    ),
  }

  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name]}
    </svg>
  )
}

function Button({
  children,
  className = "",
  icon,
  onClick,
  type = "button",
}: {
  children: ReactNode
  className?: string
  icon?: IconName
  onClick?: () => void
  type?: "button" | "submit"
}) {
  return (
    <button className={`button ${className}`} onClick={onClick} type={type}>
      <span>{children}</span>
      {icon && <Icon name={icon} />}
    </button>
  )
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""}`}>
      <span className="brand-mark">
        <span />
      </span>
      <span>MISSED.</span>
    </div>
  )
}

function PrivacyPill({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className={`privacy-pill ${inverse ? "privacy-pill--inverse" : ""}`}>
      <Icon name="lock" size={16} />
      <span>PRIVATE BY DESIGN · API-POWERED ANALYSIS</span>
    </div>
  )
}

function Header({
  contextTitle,
  current,
  setCurrent,
}: {
  contextTitle?: string
  current: string
  setCurrent: (value: "landing" | "workspace" | "extension") => void
}) {
  if (current === "workspace") {
    return (
      <header className="workspace-header">
        <button
          className="brand-button"
          onClick={() => setCurrent("landing")}
          type="button"
        >
          <Brand compact />
        </button>
        <div className="workspace-header__title">
          <span className="micro-label">CURRENT CONVERSATION</span>
          <strong>{contextTitle || "No conversation imported"}</strong>
        </div>
        <div className="workspace-header__status">
          <span className="micro-label">ANALYSIS STATUS</span>
          <strong>ENGINE UNAVAILABLE</strong>
        </div>
        <PrivacyPill />
        <button
          className="return-action"
          onClick={() => setCurrent("landing")}
          type="button"
        >
          ← RETURN TO IMPORT
        </button>
      </header>
    )
  }

  return (
    <header className="site-header">
      <button
        className="brand-button"
        onClick={() => setCurrent("landing")}
        type="button"
      >
        <Brand />
      </button>
      <nav aria-label="Product views" className="top-nav">
        {[
          ["landing", "Import"],
          ["extension", "Extension"],
        ].map(([value, label]) => (
          <button
            className={
              current === value ? "nav-link nav-link--active" : "nav-link"
            }
            key={value}
            onClick={() =>
              setCurrent(value as "landing" | "workspace" | "extension")
            }
            type="button"
          >
            {label}
          </button>
        ))}
      </nav>
      <PrivacyPill />
    </header>
  )
}

function Landing({
  fileName,
  hasInput,
  importMessage,
  importStatus,
  onAnalyze,
  onFile,
  paste,
  previewMode,
  setPreviewMode,
  setPaste,
}: {
  fileName: string
  hasInput: boolean
  importMessage: string
  importStatus: "idle" | "reading" | "invalid" | "error" | "processing"
  onAnalyze: () => void
  onFile: (file: File) => void
  paste: string
  previewMode: boolean
  setPreviewMode: (value: boolean) => void
  setPaste: (value: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <main>
      <section className="hero">
        <div className="hero-kicker">
          <span>01 / IMPORT</span>
          <span>THE UNREAD PROBLEM</span>
        </div>
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">
              <span /> CONVERSATION INTELLIGENCE
            </div>
            <h1>
              TOO MANY
              <br />
              MESSAGES.
              <em>
                KNOW WHAT
                <br />
                MATTERS.
              </em>
            </h1>
          </div>
          <div className="hero-aside">
            <p className="lede">
              Turn overwhelming group chats into a clear brief of actions,
              decisions, deadlines, and questions that still need you.
            </p>
            <div className="signal-stack" aria-label="Analysis categories">
              <span>
                <b>01</b> ACT NOW
              </span>
              <span>
                <b>02</b> RESPONSE NEEDED
              </span>
              <span>
                <b>03</b> KEEP IN MIND
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="import-section">
        <div className="section-heading">
          <span className="section-number">01</span>
          <div>
            <p className="overline">START HERE</p>
            <h2>
              BRING THE CHAT.
              <br />
              WE’LL FIND THE SIGNAL.
            </h2>
          </div>
          <p className="section-note">
            Export any WhatsApp conversation as a text file, or paste the
            messages directly.
          </p>
        </div>

        <div className="import-grid">
          <div
            className={`drop-zone ${fileName ? "drop-zone--ready" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              const file = event.dataTransfer.files[0]
              if (file) onFile(file)
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ")
                inputRef.current?.click()
            }}
            role="button"
            tabIndex={0}
          >
            <input
              accept=".txt,text/plain"
              className="visually-hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) onFile(file)
              }}
              ref={inputRef}
              type="file"
            />
            <div className="upload-icon">
              <Icon name={fileName ? "check" : "upload"} size={28} />
            </div>
            <div>
              <p className="drop-title">
                {fileName || "DROP YOUR EXPORTED CHAT HERE"}
              </p>
              <p className="drop-sub">
                {importStatus === "reading"
                  ? "Reading file…"
                  : fileName
                    ? "File ready for analysis"
                    : ".TXT files · Sent to the configured AI provider for analysis"}
              </p>
            </div>
            <span className="browse-label">
              {fileName ? "CHANGE FILE" : "BROWSE FILE"}
            </span>
          </div>

          <div className="or-divider">
            <span>OR</span>
          </div>

          <label className="paste-box">
            <span className="paste-label">
              <Icon name="message" size={17} /> PASTE CONVERSATION
            </span>
            <textarea
              onChange={(event) => setPaste(event.target.value)}
              placeholder="Paste exported messages here…"
              value={paste}
            />
            <span className="paste-meta">
              {paste.length
                ? `${paste.length.toLocaleString()} characters entered`
                : "Nothing pasted yet"}
            </span>
          </label>
        </div>

        {importStatus !== "idle" && (
          <div
            aria-live="polite"
            className={`import-feedback import-feedback--${importStatus}`}
            role={
              importStatus === "invalid" || importStatus === "error"
                ? "alert"
                : "status"
            }
          >
            <span className="feedback-symbol">
              {importStatus === "reading" || importStatus === "processing"
                ? "···"
                : importStatus === "invalid" || importStatus === "error"
                  ? "!"
                  : "✓"}
            </span>
            <div>
              <strong>
                {importStatus === "reading"
                  ? "READING FILE"
                  : importStatus === "processing"
                    ? "PREPARING ANALYSIS"
                    : importStatus === "invalid"
                      ? "THAT FILE CAN’T BE USED"
                      : "IMPORT ERROR"}
              </strong>
              <span>{importMessage}</span>
            </div>
          </div>
        )}

        <div className="action-row">
          <div className="privacy-callout">
            <Icon name="lock" size={22} />
            <div>
              <strong>PRIVATE BY DESIGN</strong>
              <span>
                Conversation content is sent to the configured AI provider for
                analysis.
              </span>
            </div>
          </div>
          <div className="import-actions">
            <label className="preview-toggle">
              <input
                checked={previewMode}
                onChange={(event) => setPreviewMode(event.target.checked)}
                type="checkbox"
              />
              <span>DESIGN PREVIEW — SAMPLE DATA</span>
            </label>
            <Button
              className={
                hasInput && importStatus !== "processing"
                  ? "button--primary"
                  : "button--disabled"
              }
              icon="arrow"
              onClick={
                hasInput && importStatus !== "processing"
                  ? onAnalyze
                  : undefined
              }
            >
              {importStatus === "processing"
                ? "PREPARING WORKSPACE…"
                : "ANALYZE CONVERSATION"}
            </Button>
          </div>
        </div>
      </section>

      <section className="benefits">
        <div className="benefits-intro">
          <p className="overline">LESS SCROLLING. MORE KNOWING.</p>
          <h2>
            YOUR CHAT,
            <br />
            WITH A POINT OF VIEW.
          </h2>
        </div>
        <div className="benefit-list">
          {[
            [
              "01",
              "CUT THROUGH NOISE",
              "See urgent tasks and unanswered questions before everything else.",
            ],
            [
              "02",
              "TRACE EVERY CLAIM",
              "Open the exact source message behind any extracted finding.",
            ],
            [
              "03",
              "KEEP UNCERTAINTY VISIBLE",
              "Facts and interpretations are clearly labeled—never blurred.",
            ],
          ].map(([number, title, body]) => (
            <article className="benefit" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function EmptyBlock({
  icon,
  label,
  title,
}: {
  icon: IconName
  label: string
  title: string
}) {
  return (
    <div className="empty-block">
      <Icon name={icon} size={24} />
      <div>
        <span>{label}</span>
        <p>{title}</p>
      </div>
    </div>
  )
}

type EvidenceFinding = {
  finding: string
  reason: string
  sourceText: string
  sender?: string
  timestamp?: string
  type: "fact" | "interpretation"
}

function EvidenceDetail({ finding }: { finding: EvidenceFinding | null }) {
  if (!finding) {
    return (
      <div className="drawer-empty">
        <Icon name="message" size={34} />
        <h3>NO SOURCE SELECTED</h3>
        <p>
          Choose a finding to see its exact supporting message and nearby
          conversation context.
        </p>
      </div>
    )
  }

  return (
    <div className="evidence-detail">
      <span className={`evidence-type evidence-type--${finding.type}`}>
        {finding.type === "fact" ? "EXPLICIT FACT" : "UNCERTAIN INTERPRETATION"}
      </span>
      <section>
        <p className="overline">EXTRACTED FINDING</p>
        <h3>{finding.finding}</h3>
        <p>{finding.reason}</p>
      </section>
      <section className="source-quote">
        <p className="overline">ORIGINAL SUPPORTING MESSAGE</p>
        <blockquote>{finding.sourceText}</blockquote>
        {(finding.sender || finding.timestamp) && (
          <footer>
            <strong>{finding.sender || "Sender unavailable"}</strong>
            <span>{finding.timestamp || "Timestamp unavailable"}</span>
          </footer>
        )}
      </section>
      {finding.type === "interpretation" && (
        <div className="uncertainty-note">
          <strong>WHY THIS IS MARKED UNCERTAIN</strong>
          <p>
            This is a possible interpretation of the source, not an explicit
            statement. Verify it against the original conversation.
          </p>
        </div>
      )}
    </div>
  )
}

type DashboardFinding = EvidenceFinding & {
  category: "Actions" | "Decisions" | "Questions" | "Mentions" | "Deadlines"
  priority: "Act now" | "Response needed" | "Keep in mind"
}

const previewFindings: DashboardFinding[] = [
  {
    finding: "Confirm the venue before Friday.",
    reason: "Illustrative preview: a time-sensitive request with source text.",
    sourceText:
      "SAMPLE SOURCE MESSAGE — Could someone confirm the venue by Friday so we can send the invite?",
    sender: "Sample sender",
    timestamp: "Sample timestamp",
    type: "fact",
    category: "Deadlines",
    priority: "Act now",
  },
  {
    finding: "Share a response to the budget question.",
    reason: "Illustrative preview: a question that may need a reply.",
    sourceText:
      "SAMPLE SOURCE MESSAGE — Can you let us know whether the revised budget works?",
    sender: "Sample sender",
    timestamp: "Sample timestamp",
    type: "interpretation",
    category: "Questions",
    priority: "Response needed",
  },
  {
    finding: "The launch date was moved to the following week.",
    reason: "Illustrative preview: a confirmed decision with source text.",
    sourceText:
      "SAMPLE SOURCE MESSAGE — We agreed to move the launch to the following week.",
    sender: "Sample sender",
    timestamp: "Sample timestamp",
    type: "fact",
    category: "Decisions",
    priority: "Keep in mind",
  },
]

function PreviewResults() {
  return (
    <section
      className="preview-results"
      aria-label="Illustrative preview results"
    >
      <div className="preview-results__notice">
        DESIGN PREVIEW — SAMPLE DATA, NOT GENERATED FROM YOUR CONVERSATION
      </div>
    </section>
  )
}

function Workspace({
  fileName,
  hasInput,
  onDelete,
  onExitPreview,
  onInspectProgress,
  onImport,
  previewResults,
}: {
  fileName: string
  hasInput: boolean
  onDelete: () => void
  onExitPreview: () => void
  onInspectProgress: () => void
  onImport: () => void
  previewResults: boolean
}) {
  const [activeFilter, setActiveFilter] = useState("All findings")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [deleteConfirming, setDeleteConfirming] = useState(false)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("Newest source")
  const [selectedFinding, setSelectedFinding] =
    useState<EvidenceFinding | null>(null)
  const sourceName =
    fileName || (hasInput ? "Pasted conversation" : "No conversation imported")
  const availableFindings = previewResults ? previewFindings : []
  const filteredFindings = availableFindings.filter((finding) => {
    const matchesCategory =
      activeFilter === "All findings" || finding.category === activeFilter
    const needle = search.trim().toLowerCase()
    const matchesSearch =
      !needle ||
      `${finding.finding} ${finding.reason} ${finding.sourceText}`
        .toLowerCase()
        .includes(needle)
    return matchesCategory && matchesSearch
  })

  const confirmDelete = () => {
    onDelete()
    setDeleteConfirming(false)
  }

  return (
    <main className="workspace">
      <div className="workspace-top">
        <div>
          <p className="overline">02 / ANALYSIS WORKSPACE</p>
          <h1>{hasInput ? "YOUR CATCH-UP." : "NOTHING MISSED YET."}</h1>
        </div>
        <div className="workspace-actions">
          <Button className="button--quiet" icon="arrow" onClick={onImport}>
            IMPORT CHAT
          </Button>
          <Button
            className="button--danger"
            icon="trash"
            onClick={() => setDeleteConfirming(true)}
          >
            DELETE IMPORTED DATA
          </Button>
        </div>
      </div>

      <div className="source-strip">
        <div className="source-main">
          <div className="file-tile">
            <Icon name="file" />
          </div>
          <div>
            <span className="micro-label">IMPORTED SOURCE</span>
            <strong>{sourceName}</strong>
          </div>
        </div>
        <div className="source-status">
          <span>
            {previewResults
              ? "DESIGN PREVIEW — SAMPLE DATA"
              : "ANALYSIS UNAVAILABLE"}
          </span>
          <small>
            {previewResults
              ? "Illustrative results only"
              : "No findings generated"}
          </small>
        </div>
        <div className="fact-key">
          <span>
            <i className="fact-dot" /> EXPLICIT FACT
          </span>
          <span>
            <i className="interpret-dot" /> INTERPRETATION
          </span>
        </div>
      </div>

      {previewResults && <PreviewResults />}

      <div className="workspace-tools">
        <label className="search-field">
          <Icon name="search" size={18} />
          <input
            aria-label="Search findings"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search findings or sources"
            value={search}
          />
        </label>
        <div className="filter-tabs">
          {[
            "All findings",
            "Actions",
            "Decisions",
            "Questions",
            "Mentions",
            "Deadlines",
          ].map((filter) => (
            <button
              className={activeFilter === filter ? "filter-active" : ""}
              key={filter}
              onClick={() => setActiveFilter(filter)}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
        <Button className="button--filter" icon="filter">
          URGENCY: ALL
        </Button>
        <label className="sort-field">
          <span>SORT</span>
          <select
            aria-label="Sort findings"
            onChange={(event) => setSort(event.target.value)}
            value={sort}
          >
            <option>Newest source</option>
            <option>Highest urgency</option>
            <option>Category</option>
          </select>
        </label>
        {(search || activeFilter !== "All findings") && (
          <Button
            className="button--quiet"
            onClick={() => {
              setSearch("")
              setActiveFilter("All findings")
            }}
          >
            CLEAR VIEW
          </Button>
        )}
      </div>

      <div className="analysis-grid">
        <section className="summary-panel">
          <div className="panel-title">
            <div>
              <span className="panel-index">01</span>
              <p className="overline">CONVERSATION SUMMARY</p>
            </div>
            <span className="status-badge">
              {previewResults
                ? "SAMPLE DATA"
                : hasInput
                  ? "AWAITING ANALYSIS"
                  : "AWAITING CHAT"}
            </span>
          </div>
          <div className="summary-empty">
            <div className="summary-symbol">
              <Icon name={hasInput ? "spark" : "message"} size={30} />
            </div>
            <h2>
              {hasInput
                ? previewResults
                  ? "AN ILLUSTRATIVE CATCH-UP."
                  : "ANALYSIS IS NOT CONNECTED."
                : "IMPORT A CONVERSATION TO BEGIN."}
            </h2>
            <p>
              {hasInput
                ? previewResults
                  ? "Sample content demonstrates the summary hierarchy. It was not generated from your imported conversation."
                  : "This source is ready, but no analysis API is configured. A verified summary, themes, and important context will appear only after genuine processing."
                : "Summary, themes, and key context will appear here only after a real chat is supplied."}
            </p>
          </div>
        </section>

        <section className="radar-panel">
          <div className="panel-title">
            <div>
              <span className="panel-index">02</span>
              <p className="overline">ATTENTION RADAR</p>
            </div>
          </div>
          <div className="radar-list">
            {[
              ["ACT NOW", "Act now", "radar-now"],
              ["RESPONSE NEEDED", "Response needed", "radar-response"],
              ["KEEP IN MIND", "Keep in mind", "radar-mind"],
            ].map(([title, priority, className]) => {
              const radarFindings = availableFindings.filter(
                (finding) => finding.priority === priority,
              )
              return (
                <details className={`radar-row ${className}`} key={title}>
                  <summary>
                    <span className="radar-arrow">↗</span>
                    <div>
                      <strong>{title}</strong>
                      <p>
                        {previewResults
                          ? "Illustrative sample findings"
                          : "Findings appear after genuine analysis."}
                      </p>
                    </div>
                    <span className="radar-count">
                      {previewResults ? radarFindings.length : "NO DATA"}
                    </span>
                  </summary>
                  {previewResults && (
                    <div className="radar-disclosure">
                      {radarFindings.map((finding) => (
                        <button
                          key={finding.finding}
                          onClick={() => {
                            setSelectedFinding(finding)
                            setDrawerOpen(true)
                          }}
                          type="button"
                        >
                          SAMPLE · {finding.finding}
                        </button>
                      ))}
                    </div>
                  )}
                </details>
              )
            })}
          </div>
        </section>

        <section className="findings-panel">
          <div className="panel-title">
            <div>
              <span className="panel-index">03</span>
              <p className="overline">EXTRACTED FINDINGS</p>
            </div>
          </div>
          {previewResults ? (
            <div className="findings-list">
              {filteredFindings.length ? (
                filteredFindings.map((finding) => (
                  <article className="finding-row" key={finding.finding}>
                    <div>
                      <span className="finding-tag">
                        SAMPLE · {finding.category} · {finding.priority}
                      </span>
                      <h3>{finding.finding}</h3>
                      <p>{finding.reason}</p>
                    </div>
                    <div className="finding-row__meta">
                      <span
                        className={`evidence-type evidence-type--${finding.type}`}
                      >
                        {finding.type === "fact"
                          ? "EXPLICIT FACT"
                          : "INTERPRETATION"}
                      </span>
                      <Button
                        className="button--outline"
                        onClick={() => {
                          setSelectedFinding(finding)
                          setDrawerOpen(true)
                        }}
                      >
                        VIEW EVIDENCE
                      </Button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="finding-no-results">
                  <strong>NO SAMPLE FINDINGS MATCH THIS VIEW</strong>
                  <Button
                    className="button--quiet"
                    onClick={() => {
                      setSearch("")
                      setActiveFilter("All findings")
                    }}
                  >
                    CLEAR FILTERS
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="finding-columns">
              <div>
                <h3>
                  <Icon name="check" size={18} /> ACTIONS & DEADLINES
                </h3>
                <EmptyBlock
                  icon="clock"
                  label="NO GENUINE FINDINGS YET"
                  title="Tasks and explicit dates will live here."
                />
              </div>
              <div>
                <h3>
                  <Icon name="spark" size={18} /> DECISIONS & AGREEMENTS
                </h3>
                <EmptyBlock
                  icon="message"
                  label="NO GENUINE FINDINGS YET"
                  title="Confirmed outcomes will live here."
                />
              </div>
              <div>
                <h3>
                  <span className="question-mark">?</span> UNANSWERED QUESTIONS
                </h3>
                <EmptyBlock
                  icon="message"
                  label="NO GENUINE FINDINGS YET"
                  title="Potential open loops will live here."
                />
              </div>
            </div>
          )}
        </section>

        <section className="decision-panel">
          <div className="panel-title">
            <div>
              <span className="panel-index">04</span>
              <p className="overline">DECISION TIMELINE</p>
            </div>
            <span className="status-badge">AWAITING EVIDENCE</span>
          </div>
          {previewResults ? (
            <div className="compact-result">
              <span>SAMPLE · CONFIRMED DECISION</span>
              <strong>{previewFindings[2].finding}</strong>
              <Button
                className="button--outline"
                onClick={() => {
                  setSelectedFinding(previewFindings[2])
                  setDrawerOpen(true)
                }}
              >
                VIEW EVIDENCE
              </Button>
            </div>
          ) : (
            <div className="decision-empty">
              <Icon name="clock" size={25} />
              <div>
                <strong>NO VERIFIED DECISIONS</strong>
                <p>
                  Explicit decisions will appear here only with a traceable
                  source message.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="actions-panel">
          <div className="panel-title">
            <div>
              <span className="panel-index">05</span>
              <p className="overline">ACTION ITEMS</p>
            </div>
            <span className="status-badge">NO ACTIONS YET</span>
          </div>
          {previewResults ? (
            <div className="compact-result">
              <span>SAMPLE · DEADLINE NOT VERIFIED FOR THIS IMPORT</span>
              <strong>{previewFindings[0].finding}</strong>
              <p>No owner or completion status is assumed in this sample.</p>
              <Button
                className="button--outline"
                onClick={() => {
                  setSelectedFinding(previewFindings[0])
                  setDrawerOpen(true)
                }}
              >
                VIEW EVIDENCE
              </Button>
            </div>
          ) : (
            <div className="action-empty">
              <Icon name="check" size={25} />
              <p>
                Owners, deadlines, and completion status are shown only when the
                conversation explicitly supports them.
              </p>
            </div>
          )}
        </section>

        <section className="questions-panel">
          <div className="panel-title">
            <div>
              <span className="panel-index">06</span>
              <p className="overline">POTENTIALLY UNANSWERED QUESTIONS</p>
            </div>
          </div>
          {previewResults ? (
            <div className="compact-result">
              <span>SAMPLE · RESOLUTION UNKNOWN</span>
              <strong>{previewFindings[1].finding}</strong>
              <p>
                This is illustrative; a real analysis must verify later replies.
              </p>
              <Button
                className="button--outline"
                onClick={() => {
                  setSelectedFinding(previewFindings[1])
                  setDrawerOpen(true)
                }}
              >
                VIEW EVIDENCE
              </Button>
            </div>
          ) : (
            <div className="action-empty">
              <Icon name="message" size={25} />
              <p>
                Questions appear here only when the source and subsequent
                replies support an unresolved state.
              </p>
            </div>
          )}
        </section>

        <section className="evidence-panel">
          <div className="panel-title">
            <div>
              <span className="panel-index">07</span>
              <p className="overline">EVIDENCE EXPLORER</p>
            </div>
            <button
              className="text-action"
              onClick={() => setDrawerOpen(true)}
              type="button"
            >
              OPEN SOURCE PANEL <Icon name="arrow" size={17} />
            </button>
          </div>
          <div className="evidence-empty">
            <div className="quote-mark">“</div>
            <p>
              Select any finding to inspect the original message, surrounding
              context, and confidence label.
            </p>
          </div>
        </section>
      </div>

      {search.trim() && (
        <section className="dashboard-notice" role="status">
          <Icon name="search" size={20} />
          <div>
            <strong>NO RESULTS MATCH “{search}”</strong>
            <p>
              No findings are available to search. Clear the search or connect
              an analysis engine to generate evidence-backed results.
            </p>
          </div>
          <Button className="button--quiet" onClick={() => setSearch("")}>
            CLEAR SEARCH
          </Button>
        </section>
      )}

      {drawerOpen && (
        <>
          <button
            aria-label="Close drawer"
            className="drawer-backdrop"
            onClick={() => setDrawerOpen(false)}
            type="button"
          />
          <aside className="source-drawer">
            <div className="drawer-head">
              <div>
                <p className="overline">SOURCE MESSAGE</p>
                <h2>EVIDENCE DETAIL</h2>
              </div>
              <button onClick={() => setDrawerOpen(false)} type="button">
                CLOSE ×
              </button>
            </div>
            <EvidenceDetail finding={selectedFinding} />
            <div className="drawer-footer">
              <PrivacyPill />
            </div>
          </aside>
        </>
      )}

      {previewResults && (
        <div className="preview-dashboard-controls">
          <Button className="button--outline" onClick={onInspectProgress}>
            VIEW PREVIEW PROGRESS
          </Button>
          <Button className="button--quiet" onClick={onExitPreview}>
            EXIT DESIGN PREVIEW
          </Button>
        </div>
      )}

      {deleteConfirming && (
        <div className="confirm-layer" role="presentation">
          <button
            aria-label="Close delete confirmation"
            className="drawer-backdrop"
            onClick={() => setDeleteConfirming(false)}
            type="button"
          />
          <section
            aria-labelledby="delete-title"
            aria-modal="true"
            className="confirm-dialog"
            role="dialog"
          >
            <Icon name="trash" size={28} />
            <p className="overline">REMOVE IMPORTED CONTENT</p>
            <h2 id="delete-title">DELETE THIS IMPORT?</h2>
            <p>
              This removes the current file or pasted text from this session.
              Analysis results are not available to remove because none have
              been generated.
            </p>
            <div className="outcome-actions">
              <Button className="button--danger" onClick={confirmDelete}>
                DELETE IMPORT
              </Button>
              <Button
                className="button--quiet"
                onClick={() => setDeleteConfirming(false)}
              >
                KEEP IT
              </Button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

type StageStatus = "pending" | "active" | "completed" | "failed" | "unavailable"
type AnalysisPhase = "processing" | "invalid" | "unavailable" | "failed" | "cancelled" | "empty" | "complete"

// Future API events should update these fields; never advance stages on a timer.
export type AnalysisProgressState = {
  phase: AnalysisPhase
  stages: StageStatus[]
  activity: string
}

const analysisStages = [
  [
    "PREPARING CONVERSATION",
    "Validate the submitted content and prepare the text for processing.",
  ],
  [
    "READING THE CONVERSATION",
    "Parse available messages and establish message boundaries.",
  ],
  [
    "FINDING THE SIGNAL",
    "Identify potential actions, decisions, questions, mentions, and deadlines.",
  ],
  [
    "BUILDING YOUR CATCH-UP",
    "Organize evidence-backed findings into your summary and Attention Radar.",
  ],
  [
    "VERIFYING THE EVIDENCE",
    "Check extracted source references against the original conversation and prepare the results.",
  ],
]

const unavailableAnalysis: AnalysisProgressState = {
  phase: "unavailable",
  stages: [
    "unavailable",
    "unavailable",
    "unavailable",
    "unavailable",
    "unavailable",
  ],
  activity:
    "Waiting for a configured analysis API. No messages have been analyzed.",
}

function ProcessingStatus({ status }: { status: StageStatus }) {
  const labels = {
    pending: "Pending",
    active: "In progress",
    completed: "Completed",
    failed: "Failed",
    unavailable: "Unavailable",
  }
  return (
    <span className={`processing-status processing-status--${status}`}>
      {status === "completed" ? (
        <Icon name="check" size={14} />
      ) : (
        <span aria-hidden="true">
          {status === "failed"
            ? "!"
            : status === "active"
              ? "→"
              : status === "unavailable"
                ? "×"
                : "—"}
        </span>
      )}
      {labels[status]}
    </span>
  )
}

function ProgressTimeline({ stages }: { stages: StageStatus[] }) {
  return (
    <ol className="progress-timeline" aria-label="Analysis stages">
      {analysisStages.map(([title, description], index) => {
        const status = stages[index] || "pending"
        return (
          <li
            className={`progress-stage progress-stage--${status}`}
            key={title}
            aria-current={status === "active" ? "step" : undefined}
          >
            <span className="progress-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="progress-stage__copy">
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
            <ProcessingStatus status={status} />
          </li>
        )
      })}
    </ol>
  )
}

function WorkspacePipeline({
  onReturn,
  onRetry,
  preview,
  setPreview,
  state,
}: {
  onReturn: () => void
  onRetry: () => void
  preview: boolean
  setPreview: (value: boolean) => void
  state: AnalysisProgressState
}) {
  const activeIndex = state.stages.findIndex((status) => status === "active")
  const currentTitle =
    activeIndex >= 0 ? analysisStages[activeIndex][0] : "ANALYSIS ENGINE"
  const isRunning = state.phase === "processing"

  return (
    <section className="workspace-pipeline" aria-labelledby="pipeline-title">
      <div className="workspace-pipeline__main">
        <div className="pipeline-heading">
          <div>
            <p className="overline">LIVE ANALYSIS</p>
            <h2 id="pipeline-title">FINDING THE SIGNAL.</h2>
          </div>
          <span
            className={`pipeline-live pipeline-live--${state.phase}`}
            role="status"
          >
            <i aria-hidden="true" />
            {preview
              ? "DESIGN PREVIEW"
              : isRunning
                ? "ANALYSIS RUNNING"
                : "ENGINE UNAVAILABLE"}
          </span>
        </div>
        <ProgressTimeline stages={state.stages} />
      </div>
      <aside className="pipeline-sidebar">
        <section
          aria-atomic="true"
          aria-live="polite"
          className="pipeline-activity"
        >
          <span className={`activity-spinner ${isRunning ? "is-running" : ""}`}>
            <Icon name={isRunning ? "spark" : "clock"} size={20} />
          </span>
          <p className="overline">CURRENT ACTIVITY</p>
          <h3>{currentTitle}</h3>
          <p>{state.activity}</p>
          <span className="activity-note">
            {isRunning
              ? "Progress is indeterminate until the engine reports an event."
              : "No configured API has received this conversation."}
          </span>
        </section>
        <section className="looking-for-panel">
          <p className="overline">WHAT WE’RE LOOKING FOR</p>
          <ul>
            <li>Urgent actions, decisions, and deadlines</li>
            <li>Unanswered questions and pending replies</li>
            <li>Direct mentions that need attention</li>
          </ul>
        </section>
        <section className="api-privacy-panel">
          <Icon name="lock" size={19} />
          <div>
            <strong>ANALYSIS API PRIVACY</strong>
            <p>
              When configured, the selected AI API receives this conversation
              for analysis. No API is configured in this version.
            </p>
          </div>
        </section>
        <div className="pipeline-controls">
          {isRunning && (
            <Button className="button--quiet" onClick={onReturn}>
              CANCEL & RETURN
            </Button>
          )}
          {!isRunning && (
            <Button className="button--quiet" onClick={onReturn}>
              RETURN TO IMPORT
            </Button>
          )}
          <Button className="button--outline" onClick={onRetry}>
            {state.phase === "failed" ? "RETRY ANALYSIS" : "CHECK CONNECTION"}
          </Button>
        </div>
        <details className="workspace-preview">
          <summary>DESIGN PREVIEW MODE</summary>
          <p>
            Preview a running state only. This never sends or analyzes data.
          </p>
          <button
            aria-pressed={preview}
            onClick={() => setPreview(!preview)}
            type="button"
          >
            {preview ? "RETURN TO LIVE STATUS" : "PREVIEW RUNNING STATE"}
          </button>
        </details>
      </aside>
    </section>
  )
}

function PrivacyStatusPanel() {
  return (
    <section className="privacy-status-panel">
      <span className="privacy-square">
        <Icon name="lock" size={24} />
      </span>
      <h2>
        YOUR CONVERSATION
        <br />
        DESERVES PRIVACY.
      </h2>
      <p>
        Conversation content is sent to the configured AI provider for analysis.
        No provider is configured in this version, so no analysis request has
        been made.
      </p>
      <div className="privacy-panel-foot">
        API PROCESSING BEGINS ONLY AFTER CONFIGURATION
      </div>
    </section>
  )
}

function AnalysisErrorState({
  phase,
  onRetry,
  onReturn,
  onComplete,
}: {
  phase: AnalysisPhase
  onRetry: () => void
  onReturn: () => void
  onComplete?: () => void
}) {
  if (phase === "processing") return null
  const messages = {
    unavailable: [
      "ANALYSIS API UNAVAILABLE",
      "No analysis API is configured in this version. Analysis has not started, and no findings have been generated.",
    ],
    invalid: [
      "CONVERSATION COULD NOT BE READ",
      "This input could not be parsed as a conversation. Return to import to review the text or choose another plain-text export.",
    ],
    failed: [
      "PROCESSING INTERRUPTED",
      "Analysis failed or stopped responding. No unverified results will be shown. Your input is preserved so you can try again.",
    ],
    cancelled: [
      "ANALYSIS CANCELLED",
      "Processing was cancelled before results were prepared. No findings are shown, and your submitted input is still available to edit.",
    ],
    empty: [
      "NO MEANINGFUL INFORMATION FOUND",
      "Processing finished without supported findings. There are no actions, decisions, or questions to show. Review the input or try another conversation.",
    ],
    complete: [
      "ANALYSIS COMPLETE",
      "Source verification is complete. Your briefing is ready, with the Attention Radar first and source messages behind each finding.",
    ],
  }
  const [title, body] = messages[phase]
  return (
    <section
      className={`analysis-outcome analysis-outcome--${phase}`}
      role="status"
    >
      <div className="outcome-title">
        <Icon
          name={
            phase === "complete"
              ? "check"
              : phase === "empty"
                ? "search"
                : "clock"
          }
          size={20}
        />
        <h2>{title}</h2>
      </div>
      <p>{body}</p>
      <div className="outcome-actions">
        {phase === "complete"
          ? onComplete && (
              <Button
                className="button--primary"
                icon="arrow"
                onClick={onComplete}
              >
                OPEN YOUR BRIEFING
              </Button>
            )
          : phase !== "invalid" && (
              <Button
                className="button--outline"
                icon="arrow"
                onClick={onRetry}
              >
                {phase === "unavailable" ? "CHECK AGAIN" : "RETRY ANALYSIS"}
              </Button>
            )}
        <Button className="button--quiet" onClick={onReturn}>
          RETURN TO IMPORT
        </Button>
      </div>
    </section>
  )
}

export function AnalysisProgress({
  designPreview,
  state,
  source,
  onReturn,
  onRetry,
  onComplete,
}: {
  designPreview: boolean
  state: AnalysisProgressState
  source: string
  onReturn: () => void
  onRetry: () => void
  onComplete?: () => void
}) {
  const [preview, setPreview] = useState("")
  const [previewStep, setPreviewStep] = useState(0)
  const titleRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    titleRef.current?.focus()
  }, [])
  useEffect(() => {
    if (!designPreview) return
    if (previewStep >= analysisStages.length) {
      onComplete?.()
      return
    }
    const timer = window.setTimeout(
      () => setPreviewStep((step) => step + 1),
      650,
    )
    return () => window.clearTimeout(timer)
  }, [designPreview, onComplete, previewStep])
  const automaticPreviewState: AnalysisProgressState = {
    phase: previewStep >= analysisStages.length ? "complete" : "processing",
    stages: analysisStages.map((_, index) =>
      index < previewStep
        ? "completed"
        : index === previewStep
          ? "active"
          : "pending",
    ),
    activity:
      previewStep >= analysisStages.length
        ? "Illustrative preview sequence complete."
        : analysisStages[previewStep][1],
  }
  const previewState: AnalysisProgressState =
    preview === "processing"
      ? {
          phase: "processing",
          stages: ["completed", "active", "pending", "pending", "pending"],
          activity: "Checking important requests…",
        }
      : {
          phase: preview as AnalysisPhase,
          stages:
            preview === "complete" || preview === "empty"
              ? Array(5).fill("completed")
              : preview === "cancelled"
                ? ["completed", "active", "pending", "pending", "pending"]
                : ["completed", "failed", "pending", "pending", "pending"],
          activity:
            preview === "complete"
              ? "Verified briefing ready."
              : preview === "empty"
                ? "No supported findings to organize."
                : preview === "cancelled"
                  ? "Processing was cancelled before results were prepared."
                  : "Processing stopped. Your input is preserved.",
        }
  const shown = preview
    ? previewState
    : designPreview
      ? automaticPreviewState
      : state
  const active = shown.phase === "processing"
  const activeStageIndex = shown.stages.findIndex(
    (status) => status === "active",
  )
  const currentStage =
    activeStageIndex >= 0
      ? analysisStages[activeStageIndex][0]
      : shown.phase === "unavailable"
        ? "ANALYSIS ENGINE"
        : "ANALYSIS STATUS"
  return (
    <>
      <header className="progress-header">
        <Brand />
        <span className="progress-header-source" title={source}>
          {source}
        </span>
        <span className="progress-header-label">
          {preview || designPreview
            ? "DESIGN PREVIEW — SAMPLE DATA"
            : active
              ? "ANALYSIS IN PROGRESS"
              : shown.phase === "complete"
                ? "ANALYSIS COMPLETE"
                : "ANALYSIS NOT STARTED"}
        </span>
        <PrivacyPill />
        <Button className="button--quiet" onClick={onReturn}>
          {active && !preview ? "CANCEL & RETURN" : "RETURN TO IMPORT"}
        </Button>
      </header>
      <main className="analysis-progress">
        <div className="progress-kicker">
          <span>02 / FIND THE SIGNAL</span>
          <span>API-POWERED CONVERSATION INTELLIGENCE</span>
        </div>
        <section className="progress-intro">
          <div>
            <h1 tabIndex={-1} ref={titleRef}>
              FINDING
              <br />
              <em>THE SIGNAL.</em>
            </h1>
            <p>
              We're working through your conversation to surface what matters,
              what needs a response, and what you might have missed.
            </p>
          </div>
          <div
            className={`signal-meter ${active ? "signal-meter--active" : ""}`}
            aria-hidden="true"
          >
            <div className="signal-meter-grid">
              {Array.from({ length: 7 }, (_, i) => (
                <span key={i} />
              ))}
            </div>
            <span className="signal-meter-caption">
              {active ? "SEEKING SIGNAL" : "SIGNAL ON STANDBY"}
            </span>
          </div>
        </section>
        <div className="progress-source">
          <Icon name="file" size={18} />
          <strong>{source}</strong>
          <span>INPUT HELD IN THIS TAB</span>
        </div>
        <div className="progress-layout">
          <section className="progress-route" aria-label="Processing pipeline">
            <div className="progress-panel-heading">
              <span className="overline">THE ANALYSIS PIPELINE</span>
              <span>5 EVIDENCE-FIRST STAGES</span>
            </div>
            <ProgressTimeline stages={shown.stages} />
          </section>
          <aside className="progress-aside">
            <section
              className="current-activity"
              aria-live="polite"
              aria-atomic="true"
            >
              <p className="overline">
                CURRENT ACTIVITY{preview || designPreview ? " · PREVIEW" : ""}
              </p>
              <strong className="activity-status">
                {currentStage} ·{" "}
                {active ? "IN PROGRESS" : shown.phase.toUpperCase()}
              </strong>
              <div
                className={`activity-line ${
                  active ? "activity-line--active" : ""
                }`}
                aria-hidden="true"
              >
                <span />
              </div>
              <p className="activity-text">{shown.activity}</p>
              <span className="activity-note">
                No estimated time. No invented progress.
              </span>
            </section>
            <PrivacyStatusPanel />
          </aside>
        </div>
        {(preview || designPreview) && (
          <div className="preview-notice" role="status">
            DESIGN PREVIEW — SAMPLE DATA. Stages and results are illustrative;
            your conversation is not being analyzed.
          </div>
        )}
        <AnalysisErrorState
          phase={shown.phase}
          onRetry={() => {
            setPreview("")
            onRetry()
          }}
          onReturn={onReturn}
          onComplete={preview || designPreview ? undefined : onComplete}
        />
        <details className="progress-preview">
          <summary>DESIGN HANDOFF / INSPECT INTERACTION STATES</summary>
          <p>
            Preview the interface only. These controls do not run analysis or
            generate conversation findings.
          </p>
          <div className="preview-options">
            {[
              ["", "LIVE STATUS"],
              ["processing", "PROCESSING"],
              ["invalid", "UNREADABLE"],
              ["failed", "FAILURE / TIMEOUT"],
              ["cancelled", "CANCELLED"],
              ["empty", "NO FINDINGS"],
              ["complete", "COMPLETE"],
            ].map(([value, label]) => (
              <button
                type="button"
                aria-pressed={preview === value}
                onClick={() => setPreview(value)}
                key={value}
              >
                {label}
              </button>
            ))}
          </div>
        </details>
      </main>
    </>
  )
}

export default function App() {
  const [view, setView] =
    useState<"landing" | "workspace" | "extension" | "progress">("landing")
  const [paste, setPaste] = useState("")
  const [fileName, setFileName] = useState("")
  const [fileText, setFileText] = useState("")
  const [importStatus, setImportStatus] =
    useState<"idle" | "reading" | "invalid" | "error" | "processing">("idle")
  const [importMessage, setImportMessage] = useState("")
  const [designPreview, setDesignPreview] = useState(false)
  const [analysisState, setAnalysisState] =
    useState<AnalysisProgressState>(unavailableAnalysis)

  const hasInput = Boolean(fileText.trim() || paste.trim())
  useEffect(() => {
    if (analysisState.phase === "complete") setView("workspace")
  }, [analysisState.phase])
  const onFile = async (file: File) => {
    setFileName("")
    setFileText("")
    if (
      !file.name.toLowerCase().endsWith(".txt") &&
      file.type !== "text/plain"
    ) {
      setImportStatus("invalid")
      setImportMessage("Choose a plain-text .txt conversation export.")
      return
    }

    setImportStatus("reading")
    setImportMessage("The file is being read before analysis is requested.")
    try {
      const text = await file.text()
      if (!text.trim()) {
        setImportStatus("invalid")
        setImportMessage(
          "This text file is empty. Choose a conversation export with messages.",
        )
        return
      }
      setFileName(file.name)
      setFileText(text)
      setImportStatus("idle")
      setImportMessage("")
    } catch {
      setImportStatus("error")
      setImportMessage(
        "The browser could not read this file. Try another plain-text export.",
      )
    }
  }

  const handleAnalyze = () => {
    if (!hasInput) {
      setImportStatus("invalid")
      setImportMessage(
        "Upload a non-empty .txt file or paste conversation text first.",
      )
      return
    }
    setImportStatus("idle")
    setImportMessage("")
    setAnalysisState(unavailableAnalysis)
    setView("progress")
  }

  return (
    <div className="app-shell">
      {view !== "progress" && (
        <Header
          contextTitle={fileName || (paste.trim() ? "Pasted conversation" : "")}
          current={view}
          setCurrent={setView}
        />
      )}
      {view === "progress" && (
        <AnalysisProgress
          designPreview={designPreview}
          state={analysisState}
          source={fileName || "Pasted conversation"}
          onReturn={() => setView("landing")}
          onRetry={handleAnalyze}
          onComplete={() => setView("workspace")}
        />
      )}
      {view === "landing" && (
        <Landing
          fileName={fileName}
          hasInput={hasInput}
          importMessage={importMessage}
          importStatus={importStatus}
          onAnalyze={handleAnalyze}
          onFile={onFile}
          paste={paste}
          previewMode={designPreview}
          setPreviewMode={setDesignPreview}
          setPaste={(value) => {
            setPaste(value)
            if (importStatus === "invalid" || importStatus === "error") {
              setImportStatus("idle")
              setImportMessage("")
            }
          }}
        />
      )}
      {view === "workspace" && (
        <Workspace
          fileName={fileName || (paste ? "Pasted conversation" : "")}
          hasInput={hasInput}
          onDelete={() => {
            setFileName("")
            setFileText("")
            setPaste("")
            setImportStatus("idle")
          }}
          onExitPreview={() => setDesignPreview(false)}
          onInspectProgress={() => setView("progress")}
          onImport={() => setView("landing")}
          previewResults={designPreview}
        />
      )}
      {view === "extension" && (
        <ExtensionSuite
          onOpenApp={(file) => {
            if (file) void onFile(file)
            setView("landing")
          }}
        />
      )}
      <footer className="site-footer">
        <Brand compact />
        <p>THE UNREAD PROBLEM · DESIGNED FOR CLARITY, BUILT FOR PRIVACY.</p>
        <span>API-POWERED / 2025</span>
      </footer>
    </div>
  )
}
