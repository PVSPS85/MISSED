import { ReactNode, useRef, useState } from "react"
import { Brand, Icon } from "./App"

type Surface = "popup" | "panel" | "handoff"
type Ctx = null | { kind: "file"; name: string; size: string; file?: File } | {
  kind: "page"
  host: string
}
type PopupState = "initial" | "file" | "page" | "loading" | "unavailable" | "invalid" | "error"
type Phase = "idle" | "submitted" | "responding" | "answer" | "unsupported" | "invalid" | "ai-down" | "error"

const SAMPLE_FILE: Ctx = {
  kind: "file",
  name: "launch-planning-chat.txt",
  size: "48 KB",
}
const SAMPLE_PAGE: Ctx = { kind: "page", host: "mail.example.com/thread/2291" }
const SUGGESTED = [
  "Summarize this conversation.",
  "What needs my attention?",
  "Find deadlines and action items.",
]

type Evidence = {
  finding: string
  basis: "fact" | "interpretation"
  excerpt?: string
  sender?: string
  time?: string
  why?: string
}
const EVIDENCE: Record<number, Evidence> = {
  1: {
    finding: "The venue deposit is due Friday at 17:00.",
    basis: "fact",
    excerpt:
      "Reminder: the deposit for the venue has to be paid by Friday 17:00 or they release the date.",
    sender: "Maya R.",
    time: "Tue 09:14",
    why: "The sender states the deadline and the consequence in their own words.",
  },
  2: {
    finding: "Dev may still owe a final headcount.",
    basis: "interpretation",
    excerpt: "Can someone get me a final number for the caterer? @Dev",
    sender: "Maya R.",
    time: "Tue 09:20",
    why: "A direct request mentions Dev. No reply from Dev appears afterwards in the supplied text, so “still owed” is an inference.",
  },
  3: { finding: "Catering budget was approved.", basis: "interpretation" },
}

const POPUP_STATES: { id: PopupState; label: string }[] = [
  { id: "initial", label: "Initial" },
  { id: "file", label: "File selected" },
  { id: "page", label: "Page supplied" },
  { id: "loading", label: "Loading" },
  { id: "unavailable", label: "Unavailable" },
  { id: "invalid", label: "Invalid input" },
  { id: "error", label: "Error" },
]

const PANEL_STATES: { id: string; label: string }[] = [
  { id: "empty", label: "No context" },
  { id: "ready", label: "With context" },
  { id: "submitted", label: "Question sent" },
  { id: "responding", label: "Responding" },
  { id: "answer", label: "Answer + citations" },
  { id: "evidence", label: "Evidence open" },
  { id: "evidence-missing", label: "Evidence missing" },
  { id: "unsupported", label: "Page unsupported" },
  { id: "invalid", label: "Invalid file" },
  { id: "ai-down", label: "AI unavailable" },
  { id: "error", label: "Processing error" },
]

function formatSize(bytes: number) {
  return bytes < 1024
    ? `${bytes} B`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function StatusBlock({
  tone,
  symbol,
  title,
  text,
  children,
}: {
  tone: "neutral" | "busy" | "ok" | "warn" | "error"
  symbol: string
  title: string
  text: string
  children?: ReactNode
}) {
  return (
    <div
      className={`x-status x-status--${tone}`}
      role={tone === "error" || tone === "warn" ? "alert" : "status"}
    >
      <span className="x-status__sym">
        {tone === "busy" ? (
          <span className="loading-bars">
            <i />
            <i />
            <i />
          </span>
        ) : (
          symbol
        )}
      </span>
      <div>
        <strong>{title}</strong>
        <span>{text}</span>
        {children}
      </div>
    </div>
  )
}

function Popup({
  state,
  setState,
  ctx,
  setCtx,
  pickFile,
  onPanel,
  onWebsite,
}: {
  state: PopupState
  setState: (s: PopupState) => void
  ctx: Ctx
  setCtx: (c: Ctx) => void
  pickFile: () => void
  onPanel: () => void
  onWebsite: () => void
}) {
  const supplied = state === "file" || state === "page"
  return (
    <div className="x-popup">
      <div className="x-popup__head">
        <Brand compact />
        <span className="version-tag">BETA</span>
      </div>
      <div className="x-popup__hero">
        <h2>
          WHAT DID
          <br />
          YOU MISS?
        </h2>
        <p>Add one conversation or page, then ask what matters.</p>
      </div>

      <div className="x-input-area">
        <span className="micro-label">CONTENT STATUS</span>
        {state === "initial" && (
          <StatusBlock
            tone="neutral"
            symbol="–"
            title="NOTHING SUPPLIED"
            text="No file or page has been added yet."
          />
        )}
        {state === "file" && ctx?.kind === "file" && (
          <StatusBlock
            tone="ok"
            symbol="✓"
            title={ctx.name.toUpperCase()}
            text={`Uploaded conversation · ${ctx.size} · not analyzed yet`}
          >
            <button
              className="x-link"
              onClick={() => {
                setCtx(null)
                setState("initial")
              }}
              type="button"
            >
              REMOVE
            </button>
          </StatusBlock>
        )}
        {state === "page" && ctx?.kind === "page" && (
          <StatusBlock
            tone="ok"
            symbol="✓"
            title="CURRENT WEBPAGE"
            text={`${ctx.host} · requested by you · not analyzed yet`}
          >
            <button
              className="x-link"
              onClick={() => {
                setCtx(null)
                setState("initial")
              }}
              type="button"
            >
              REMOVE
            </button>
          </StatusBlock>
        )}
        {state === "loading" && (
          <StatusBlock
            tone="busy"
            symbol=""
            title="READING CONTENT…"
            text="Preparing what you selected. Nothing is sent until you ask."
          />
        )}
        {state === "unavailable" && (
          <StatusBlock
            tone="warn"
            symbol="!"
            title="PAGE CAN’T BE READ"
            text="Browser pages and protected tabs are off limits. Upload an exported chat instead."
          />
        )}
        {state === "invalid" && (
          <StatusBlock
            tone="warn"
            symbol="!"
            title="INVALID FILE"
            text="Choose a non-empty plain-text .txt conversation export."
          />
        )}
        {state === "error" && (
          <StatusBlock
            tone="error"
            symbol="×"
            title="COULDN’T READ THAT"
            text="Something went wrong while reading. Try again."
          >
            <button
              className="x-link"
              onClick={() => setState("initial")}
              type="button"
            >
              TRY AGAIN
            </button>
          </StatusBlock>
        )}
      </div>

      {supplied ? (
        <button
          className="x-btn x-btn--primary"
          onClick={onPanel}
          type="button"
        >
          <span>ASK IN SIDE PANEL</span>
          <Icon name="arrow" />
        </button>
      ) : (
        <button
          className="x-btn x-btn--primary"
          onClick={pickFile}
          type="button"
        >
          <span>UPLOAD CHAT</span>
          <Icon name="upload" />
        </button>
      )}
      <div className="x-popup__row">
        <button
          className="x-btn"
          onClick={() => {
            setCtx(SAMPLE_PAGE)
            setState("page")
          }}
          type="button"
        >
          <span>USE CURRENT PAGE</span>
        </button>
        <button className="x-btn" onClick={onWebsite} type="button">
          <span>OPEN MISSED WEBSITE</span>
          <Icon name="arrow" size={16} />
        </button>
      </div>
      <p className="x-privacy">
        <Icon name="lock" size={14} />
        <span>
          Content you choose is sent to the configured AI provider only when you
          ask a question or start an analysis.
        </span>
      </p>
    </div>
  )
}

function CitationButton({
  n,
  onOpen,
}: {
  n: number
  onOpen: (n: number) => void
}) {
  const ev = EVIDENCE[n]
  return (
    <button
      className={`x-cite ${ev.excerpt ? "" : "x-cite--missing"}`}
      onClick={() => onOpen(n)}
      type="button"
    >
      <b>{n}</b>
      <span>
        {ev.excerpt
          ? `${ev.sender ?? "Page"} · ${ev.time ?? "excerpt"}`
          : "Source unavailable"}
      </span>
    </button>
  )
}

function EvidenceDrawer({ n, onClose }: { n: number; onClose: () => void }) {
  const ev = EVIDENCE[n]
  return (
    <div className="x-drawer" role="dialog" aria-label="Source evidence">
      <div className="x-drawer__bar">
        <strong>SOURCE EVIDENCE</strong>
        <button aria-label="Close evidence" onClick={onClose} type="button">
          ×
        </button>
      </div>
      <div className="x-drawer__body">
        <span className="x-sample">SAMPLE EVIDENCE — ILLUSTRATIVE</span>
        <span className="micro-label">SELECTED FINDING</span>
        <h3>{ev.finding}</h3>
        <span className={`x-basis x-basis--${ev.basis}`}>
          <i /> {ev.basis === "fact" ? "EXPLICIT FACT" : "INTERPRETATION"}
        </span>

        {ev.excerpt ? (
          <>
            <span className="micro-label">ORIGINAL MESSAGE</span>
            <blockquote>
              <p>“{ev.excerpt}”</p>
              {(ev.sender || ev.time) && (
                <footer>
                  {ev.sender}
                  {ev.sender && ev.time ? " · " : ""}
                  {ev.time}
                </footer>
              )}
            </blockquote>
            <span className="micro-label">WHY IT’S RELEVANT</span>
            <p className="x-why">{ev.why}</p>
            <dl className="x-legend">
              <dt>
                <i className="fact-dot" /> FACT
              </dt>
              <dd>Said directly in the source text.</dd>
              <dt>
                <i className="interpret-dot" /> INTERPRETATION
              </dt>
              <dd>Inferred from the source; confirm before acting.</dd>
            </dl>
          </>
        ) : (
          <div className="x-status x-status--warn">
            <span className="x-status__sym">?</span>
            <div>
              <strong>SUPPORTING EVIDENCE UNAVAILABLE</strong>
              <span>
                No message or excerpt could be linked to this finding. Treat it
                as unverified.
              </span>
            </div>
          </div>
        )}
        <button
          className="x-btn x-btn--primary"
          onClick={onClose}
          type="button"
        >
          <span>BACK TO CONVERSATION</span>
          <Icon name="arrow" />
        </button>
      </div>
    </div>
  )
}

function Panel({
  ctx,
  phase,
  setPhase,
  question,
  ask,
  hint,
  evidence,
  setEvidence,
  pickFile,
  usePage,
  clearCtx,
  openFull,
  openWebsite,
}: {
  ctx: Ctx
  phase: Phase
  setPhase: (p: Phase) => void
  question: string
  ask: (q: string) => void
  hint: boolean
  evidence: number | null
  setEvidence: (n: number | null) => void
  pickFile: () => void
  usePage: () => void
  clearCtx: () => void
  openFull: () => void
  openWebsite: () => void
}) {
  const [draft, setDraft] = useState("")
  const conversing =
    phase === "submitted" || phase === "responding" || phase === "answer"
  const ctxLabel = !ctx
    ? "NO CONTEXT"
    : ctx.kind === "file"
      ? "UPLOADED CONVERSATION"
      : "CURRENT WEBPAGE"
  const ctxDetail = !ctx
    ? "Add a chat or page to begin"
    : ctx.kind === "file"
      ? ctx.name
      : ctx.host

  return (
    <div className="x-panel">
      <div className="x-panel__head">
        <div>
          <Brand compact />
          <span className="micro-label">CONVERSATION ASSISTANT</span>
        </div>
        <button
          aria-label="Open full MISSED website"
          className="x-iconbtn"
          onClick={openWebsite}
          type="button"
        >
          <Icon name="arrow" size={16} />
        </button>
      </div>

      <div className={`x-context ${ctx ? "x-context--on" : ""}`}>
        <span className="live-dot" />
        <div>
          <strong>{ctxLabel}</strong>
          <span>{ctxDetail}</span>
        </div>
        {ctx && (
          <button className="x-link" onClick={clearCtx} type="button">
            CLEAR
          </button>
        )}
      </div>

      <div className="x-actions">
        <button onClick={pickFile} type="button">
          <Icon name="upload" size={18} />
          <span>UPLOAD CHAT</span>
        </button>
        <button onClick={usePage} type="button">
          <Icon name="file" size={18} />
          <span>USE CURRENT PAGE</span>
        </button>
        <button
          disabled={!ctx}
          onClick={openFull}
          title={ctx ? "" : "Add context first"}
          type="button"
        >
          <Icon name="arrow" size={18} />
          <span>OPEN FULL ANALYSIS</span>
        </button>
      </div>

      <div className="x-scroll">
        {phase === "idle" && (
          <div className="x-welcome">
            <h2>
              LET’S FIND
              <br />
              THE SIGNAL.
            </h2>
            <p>Ask about a conversation or the page you’re viewing.</p>
            {!ctx && (
              <div className={`x-empty ${hint ? "x-empty--hint" : ""}`}>
                <strong>
                  {hint ? "ADD CONTEXT FIRST" : "NOTHING TO ASK ABOUT YET"}
                </strong>
                <span>
                  Upload an exported chat, or explicitly ask to use the page
                  you’re on. MISSED. does not read other tabs or messages on its
                  own.
                </span>
              </div>
            )}
            <div className="x-suggest">
              {SUGGESTED.map((q) => (
                <button key={q} onClick={() => ask(q)} type="button">
                  <span>{q}</span>
                  <Icon name="arrow" size={14} />
                </button>
              ))}
            </div>
          </div>
        )}

        {conversing && (
          <div className="x-thread">
            <div className="x-msg x-msg--user">
              <span className="micro-label">YOU</span>
              <p>{question}</p>
            </div>

            {phase === "submitted" && (
              <div className="x-msg x-msg--bot x-msg--wait">
                <span className="micro-label">MISSED.</span>
                <p>
                  Sending your question with{" "}
                  {ctx?.kind === "page"
                    ? "the current page"
                    : "the uploaded conversation"}{" "}
                  to the configured AI provider…
                </p>
                <button
                  className="x-link"
                  onClick={() => setPhase("responding")}
                  type="button"
                >
                  PREVIEW ▸ NEXT STATE
                </button>
              </div>
            )}
            {phase === "responding" && (
              <div className="x-msg x-msg--bot x-msg--wait">
                <span className="micro-label">MISSED. · RESPONDING</span>
                <span className="loading-bars">
                  <i />
                  <i />
                  <i />
                </span>
                <div className="x-skel">
                  <i />
                  <i />
                  <i />
                </div>
                <button
                  className="x-link"
                  onClick={() => setPhase("answer")}
                  type="button"
                >
                  PREVIEW ▸ SHOW SAMPLE ANSWER
                </button>
              </div>
            )}
            {phase === "answer" && (
              <>
                <div className="x-msg x-msg--bot">
                  <span className="x-sample">
                    DESIGN PREVIEW — SAMPLE ANSWER
                  </span>
                  <p className="x-lead">
                    Two items in this sample need a response.
                  </p>
                  <ul>
                    <li>
                      <span className="x-basis x-basis--fact">
                        <i /> FACT
                      </span>
                      The venue deposit is due Friday at 17:00.
                      <CitationButton n={1} onOpen={setEvidence} />
                    </li>
                    <li>
                      <span className="x-basis x-basis--interpretation">
                        <i /> INTERPRETATION
                      </span>
                      Dev may still owe the final headcount.
                      <CitationButton n={2} onOpen={setEvidence} />
                    </li>
                    <li>
                      <span className="x-basis x-basis--interpretation">
                        <i /> INTERPRETATION
                      </span>
                      The catering budget looks approved.
                      <CitationButton n={3} onOpen={setEvidence} />
                    </li>
                  </ul>
                </div>
                <div className="x-followups">
                  <span className="micro-label">ASK NEXT</span>
                  {["Who is waiting on me?", "Show open questions."].map(
                    (q) => (
                      <button key={q} onClick={() => ask(q)} type="button">
                        {q}
                      </button>
                    ),
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {phase === "unsupported" && (
          <div className="x-statewrap">
            <StatusBlock
              tone="warn"
              symbol="!"
              title="THIS PAGE CAN’T BE READ"
              text="Browser-internal pages, the Web Store and protected tabs don’t allow extensions to read them."
            >
              <div className="x-statewrap__acts">
                <button
                  className="x-btn x-btn--sm x-btn--primary"
                  onClick={pickFile}
                  type="button"
                >
                  <span>UPLOAD CHAT INSTEAD</span>
                </button>
                <button
                  className="x-btn x-btn--sm"
                  onClick={() => setPhase("idle")}
                  type="button"
                >
                  <span>RETURN</span>
                </button>
              </div>
            </StatusBlock>
          </div>
        )}
        {phase === "invalid" && (
          <div className="x-statewrap">
            <StatusBlock
              tone="warn"
              symbol="!"
              title="MISSING OR INVALID FILE"
              text="The file is empty or isn’t plain text. Export the conversation as .txt and choose it again."
            >
              <div className="x-statewrap__acts">
                <button
                  className="x-btn x-btn--sm x-btn--primary"
                  onClick={pickFile}
                  type="button"
                >
                  <span>CHOOSE FILE</span>
                </button>
                <button
                  className="x-btn x-btn--sm"
                  onClick={() => setPhase("idle")}
                  type="button"
                >
                  <span>RETURN</span>
                </button>
              </div>
            </StatusBlock>
          </div>
        )}
        {phase === "ai-down" && (
          <div className="x-statewrap">
            <StatusBlock
              tone="warn"
              symbol="~"
              title="AI ANALYSIS UNAVAILABLE"
              text="The configured AI provider can’t be reached right now. Your content was not analyzed."
            >
              <div className="x-statewrap__acts">
                <button
                  className="x-btn x-btn--sm x-btn--primary"
                  onClick={() => ask(question || SUGGESTED[1])}
                  type="button"
                >
                  <span>RETRY</span>
                </button>
                <button
                  className="x-btn x-btn--sm"
                  onClick={() => setPhase("idle")}
                  type="button"
                >
                  <span>RETURN</span>
                </button>
              </div>
            </StatusBlock>
          </div>
        )}
        {phase === "error" && (
          <div className="x-statewrap">
            <StatusBlock
              tone="error"
              symbol="×"
              title="PROCESSING ERROR"
              text="Something failed while preparing your question. No answer was produced."
            >
              <div className="x-statewrap__acts">
                <button
                  className="x-btn x-btn--sm x-btn--primary"
                  onClick={() => ask(question || SUGGESTED[1])}
                  type="button"
                >
                  <span>TRY AGAIN</span>
                </button>
                <button
                  className="x-btn x-btn--sm"
                  onClick={() => setPhase("idle")}
                  type="button"
                >
                  <span>RETURN</span>
                </button>
              </div>
            </StatusBlock>
          </div>
        )}
      </div>

      <p className="x-privacy x-privacy--panel">
        <Icon name="lock" size={13} />
        <span>
          Nothing is analyzed until you send a question. Then the selected
          content goes to the configured AI provider.
        </span>
      </p>
      <form
        className="x-compose"
        onSubmit={(e) => {
          e.preventDefault()
          if (draft.trim()) {
            ask(draft.trim())
            setDraft("")
          }
        }}
      >
        <textarea
          aria-label="Message"
          disabled={!ctx}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              e.currentTarget.form?.requestSubmit()
            }
          }}
          placeholder={
            ctx ? "Ask what you missed…" : "Add context to ask a question"
          }
          rows={2}
          value={draft}
        />
        <button
          aria-label="Send question"
          className="x-send"
          disabled={!ctx || !draft.trim()}
          type="submit"
        >
          <Icon name="send" size={18} />
        </button>
      </form>

      {evidence !== null && (
        <EvidenceDrawer n={evidence} onClose={() => setEvidence(null)} />
      )}
    </div>
  )
}

function Handoff({
  ctx,
  playKey,
  onReplay,
  onBack,
  onContinue,
}: {
  ctx: Ctx
  playKey: number
  onReplay: () => void
  onBack: () => void
  onContinue: () => void
}) {
  const label =
    ctx?.kind === "page" ? "Current webpage" : "Uploaded conversation"
  const detail =
    ctx?.kind === "page"
      ? ctx.host
      : ctx?.kind === "file"
        ? ctx.name
        : "launch-planning-chat.txt"
  return (
    <div className="x-handoff">
      <div className="x-handoff__stage" key={playKey}>
        <div className="x-mini x-mini--panel">
          <div className="x-mini__bar">
            <Brand compact />
          </div>
          <span className="micro-label">{label.toUpperCase()}</span>
          <strong>{detail}</strong>
          <span className="x-mini__lines">
            <i />
            <i />
            <i />
          </span>
          <span className="x-mini__tag">COMPACT ASSISTANT</span>
        </div>
        <div className="x-handoff__travel" aria-hidden="true">
          <span className="x-token">
            <Icon name="file" size={18} />
          </span>
          <span className="x-track" />
          <span className="micro-label">HANDED OVER IN MEMORY</span>
        </div>
        <div className="x-mini x-mini--work">
          <div className="x-mini__bar x-mini__bar--ink">
            <Brand compact />
          </div>
          <span className="micro-label">FULL ANALYSIS WORKSPACE</span>
          <strong>{detail}</strong>
          <ol>
            {[
              "Preparing Conversation",
              "Reading the Conversation",
              "Finding the Signal",
              "Building Your Catch-Up",
              "Verifying the Evidence",
            ].map((s, i) => (
              <li key={s}>
                <b>{i + 1}</b>
                {s}
              </li>
            ))}
          </ol>
          <span className="x-mini__tag">WAITS FOR YOU TO START</span>
        </div>
      </div>

      <div className="x-handoff__notes">
        <h3>WHAT HAPPENS WHEN YOU OPEN FULL ANALYSIS</h3>
        <ol>
          <li>
            <b>1</b>
            <span>
              You choose <strong>OPEN FULL ANALYSIS</strong>. Only the content
              you already supplied is carried over.
            </span>
          </li>
          <li>
            <b>2</b>
            <span>
              The existing MISSED. website opens on its import step with that
              content attached. It is passed through the extension,{" "}
              <strong>never placed in the URL</strong>.
            </span>
          </li>
          <li>
            <b>3</b>
            <span>
              Nothing is analyzed until you press{" "}
              <strong>ANALYZE CONVERSATION</strong>. Then the content goes to
              the configured AI provider.
            </span>
          </li>
        </ol>
        <div className="x-handoff__acts">
          <button
            className="x-btn x-btn--primary"
            onClick={onContinue}
            type="button"
          >
            <span>CONTINUE TO MISSED. WORKSPACE</span>
            <Icon name="arrow" />
          </button>
          <button className="x-btn" onClick={onReplay} type="button">
            <span>REPLAY</span>
          </button>
          <button className="x-btn" onClick={onBack} type="button">
            <span>BACK TO PANEL</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ExtensionSuite({
  onOpenApp,
}: {
  onOpenApp: (file?: File) => void
}) {
  const [surface, setSurface] = useState<Surface>("panel")
  const [popupState, setPopupState] = useState<PopupState>("initial")
  const [ctx, setCtx] = useState<Ctx>(null)
  const [phase, setPhase] = useState<Phase>("idle")
  const [question, setQuestion] = useState("")
  const [evidence, setEvidence] = useState<number | null>(null)
  const [hint, setHint] = useState(false)
  const [playKey, setPlayKey] = useState(0)
  const [activePreset, setActivePreset] = useState("empty")
  const fileRef = useRef<HTMLInputElement>(null)
  const target = useRef<"popup" | "panel">("panel")

  const pickFile = (from: "popup" | "panel") => {
    target.current = from
    fileRef.current?.click()
  }

  const onChosen = async (file?: File) => {
    if (!file) return
    const ok =
      file.name.toLowerCase().endsWith(".txt") || file.type === "text/plain"
    let text = ""
    try {
      text = ok ? await file.text() : ""
    } catch {
      if (target.current === "popup") setPopupState("error")
      else setPhase("error")
      return
    }
    if (!ok || !text.trim()) {
      if (target.current === "popup") setPopupState("invalid")
      else {
        setPhase("invalid")
        setEvidence(null)
      }
      return
    }
    setCtx({ kind: "file", name: file.name, size: formatSize(file.size), file })
    setHint(false)
    if (target.current === "popup") setPopupState("file")
    else {
      setPhase("idle")
      setActivePreset("ready")
    }
  }

  const ask = (q: string) => {
    if (!ctx) {
      setHint(true)
      return
    }
    setQuestion(q)
    setEvidence(null)
    setPhase("submitted")
    setActivePreset("submitted")
  }

  const preset = (id: string) => {
    setActivePreset(id)
    setHint(false)
    setEvidence(null)
    const q = question || SUGGESTED[1]
    const withCtx = ctx ?? SAMPLE_FILE
    switch (id) {
      case "empty":
        setCtx(null)
        setPhase("idle")
        break
      case "ready":
        setCtx(withCtx)
        setPhase("idle")
        break
      case "submitted":
      case "responding":
      case "answer":
        setCtx(withCtx)
        setQuestion(q)
        setPhase(id)
        break
      case "evidence":
        setCtx(withCtx)
        setQuestion(q)
        setPhase("answer")
        setEvidence(1)
        break
      case "evidence-missing":
        setCtx(withCtx)
        setQuestion(q)
        setPhase("answer")
        setEvidence(3)
        break
      case "unsupported":
        setCtx(null)
        setPhase("unsupported")
        break
      case "invalid":
        setCtx(null)
        setPhase("invalid")
        break
      case "ai-down":
      case "error":
        setCtx(withCtx)
        setQuestion(q)
        setPhase(id)
        break
    }
  }

  const openFull = () => {
    setPlayKey((k) => k + 1)
    setSurface("handoff")
  }

  const usePanelPage = () => {
    setHint(false)
    setCtx(SAMPLE_PAGE)
    setPhase("idle")
    setActivePreset("ready")
  }

  const goPanelFromPopup = () => {
    setPhase("idle")
    setActivePreset("ready")
    setSurface("panel")
  }

  return (
    <main className="extension-page">
      <input
        accept=".txt,text/plain"
        className="visually-hidden"
        onChange={(e) => {
          void onChosen(e.target.files?.[0])
          e.target.value = ""
        }}
        ref={fileRef}
        tabIndex={-1}
        type="file"
      />
      <div className="extension-heading">
        <div>
          <p className="overline">03 / BROWSER COMPANION</p>
          <h1>
            LESS TAB-HOPPING.
            <br />
            <em>MORE CONTEXT.</em>
          </h1>
        </div>
        <p>
          The same evidence-first experience, sized for the conversations
          already in your browser.
        </p>
      </div>

      <div className="x-controls">
        <span className="x-banner">DESIGN PREVIEW — SAMPLE DATA</span>
        <div className="x-tabs" role="tablist">
          {([
            ["popup", "POPUP"],
            ["panel", "SIDE PANEL"],
            ["handoff", "OPEN FULL ANALYSIS"],
          ] as [Surface, string][]).map(([id, label]) => (
            <button
              aria-selected={surface === id}
              className={surface === id ? "is-on" : ""}
              key={id}
              onClick={() => {
                if (id === "handoff") setPlayKey((k) => k + 1)
                setSurface(id)
              }}
              role="tab"
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="x-stage">
        {surface !== "handoff" && (
          <aside className="x-rail" aria-label="Preview states">
            <span className="micro-label">PREVIEW STATE</span>
            {surface === "popup"
              ? POPUP_STATES.map((s) => (
                  <button
                    className={popupState === s.id ? "is-on" : ""}
                    key={s.id}
                    onClick={() => {
                      setPopupState(s.id)
                      if (s.id === "file") setCtx(SAMPLE_FILE)
                      if (s.id === "page") setCtx(SAMPLE_PAGE)
                    }}
                    type="button"
                  >
                    {s.label}
                  </button>
                ))
              : PANEL_STATES.map((s) => (
                  <button
                    className={activePreset === s.id ? "is-on" : ""}
                    key={s.id}
                    onClick={() => preset(s.id)}
                    type="button"
                  >
                    {s.label}
                  </button>
                ))}
          </aside>
        )}

        {surface === "popup" && (
          <section className="browser-card x-frame x-frame--popup">
            <div className="browser-label">CHROME POPUP · 380 WIDE</div>
            <Popup
              ctx={ctx}
              onPanel={goPanelFromPopup}
              onWebsite={() => onOpenApp()}
              pickFile={() => pickFile("popup")}
              setCtx={setCtx}
              setState={setPopupState}
              state={popupState}
            />
          </section>
        )}

        {surface === "panel" && (
          <section className="browser-card x-frame x-frame--panel">
            <div className="browser-label">
              CHROME SIDE PANEL · 350–420 WIDE
            </div>
            <Panel
              clearCtx={() => preset("empty")}
              ctx={ctx}
              ask={ask}
              evidence={evidence}
              hint={hint}
              openFull={openFull}
              openWebsite={() => onOpenApp()}
              phase={phase}
              pickFile={() => pickFile("panel")}
              question={question}
              setEvidence={setEvidence}
              setPhase={(p) => {
                setPhase(p)
                setActivePreset(p === "idle" ? (ctx ? "ready" : "empty") : p)
              }}
              usePage={usePanelPage}
            />
          </section>
        )}

        {surface === "handoff" && (
          <section className="x-frame x-frame--wide">
            <Handoff
              ctx={ctx}
              onBack={() => setSurface("panel")}
              onContinue={() =>
                onOpenApp(ctx?.kind === "file" ? ctx.file : undefined)
              }
              onReplay={() => setPlayKey((k) => k + 1)}
              playKey={playKey}
            />
          </section>
        )}
      </div>
    </main>
  )
}
