'use client'

import { useEffect, useState } from 'react'

// ---- Types ----

type ProfileLink = { label: string; url: string }

type CreatedResult = { id: string; editToken: string }

// ---- API ----

async function postProfile(payload: {
  name: string
  title: string
  bio: string
  photoUrl: string
  links: ProfileLink[]
}): Promise<CreatedResult> {
  const res = await fetch('/api/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? 'Failed to create profile')
  }
  return res.json()
}

// ---- Presentational helpers ----

function initials(name: string): string | null {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return null
  return parts
    .slice(0, 2)
    .map(p => p[0]!.toUpperCase())
    .join('')
}

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" aria-hidden>
      <defs>
        <linearGradient id="lf-logo" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-strong)" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#lf-logo)" />
      {/* link A */}
      <rect
        x="7.5"
        y="10.5"
        width="17"
        height="11"
        rx="5.5"
        transform="rotate(45 16 16)"
        fill="none"
        stroke="var(--accent-foreground)"
        strokeWidth="3.4"
      />
      {/* link B: tile-colored halo erases A for an over/under weave */}
      <rect
        x="15.5"
        y="18.5"
        width="17"
        height="11"
        rx="5.5"
        transform="rotate(45 24 24)"
        fill="none"
        stroke="url(#lf-logo)"
        strokeWidth="5.8"
      />
      {/* link B */}
      <rect
        x="15.5"
        y="18.5"
        width="17"
        height="11"
        rx="5.5"
        transform="rotate(45 24 24)"
        fill="none"
        stroke="var(--accent-foreground)"
        strokeWidth="3.4"
      />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4 12L12 4M12 4H6M12 4V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Live, presentational preview of the profile as the user types.
function LivePreview({
  name,
  title,
  bio,
  photoUrl,
  links,
}: {
  name: string
  title: string
  bio: string
  photoUrl: string
  links: ProfileLink[]
}) {
  const monogram = initials(name)
  const visibleLinks = links.filter(l => l.label.trim() || l.url.trim())

  return (
    <div className="w-full max-w-[380px]">
      <div className="flex min-h-[430px] flex-col overflow-hidden rounded-[28px] border border-line bg-surface shadow-[0_45px_90px_-35px_rgb(var(--glow)/0.55)]">
        {/* cover band */}
        <div className="relative h-28 shrink-0 bg-gradient-to-br from-accent to-accent-strong">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,0.32),transparent_62%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_120%,rgba(0,0,0,0.18),transparent_55%)]" />
        </div>

        {/* body */}
        <div className="flex flex-1 flex-col px-7 pb-6">
          {/* avatar overlapping the cover */}
          <div className="-mt-[52px] mb-4 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1.5 rounded-full bg-accent/25 blur-md" />
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt={name || 'Profile photo'}
                  className="relative h-[88px] w-[88px] rounded-full object-cover shadow-lg ring-4 ring-surface"
                />
              ) : (
                <div className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-strong text-[28px] font-semibold text-accent-foreground shadow-lg ring-4 ring-surface">
                  {monogram ?? '✶'}
                </div>
              )}
            </div>
          </div>

          {/* identity */}
          <div className="text-center">
            <h3 className="font-display text-[26px] leading-tight text-ink transition-all duration-300">
              {name.trim() || 'Your name'}
            </h3>
            {title.trim() && (
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                {title}
              </p>
            )}
            {bio.trim() && (
              <p className="mx-auto mt-3 max-w-[270px] text-[13px] leading-relaxed text-ink-muted">
                {bio}
              </p>
            )}
          </div>

          {/* links */}
          <div className="mt-5 space-y-2.5">
            {visibleLinks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line px-4 py-3.5 text-center text-[13px] text-ink-faint">
                Your links appear here
              </div>
            ) : (
              visibleLinks.map((link, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3 text-[13px] font-medium text-ink"
                >
                  <span className="truncate">{link.label.trim() || 'Untitled'}</span>
                  <span className="text-ink-faint">
                    <ArrowIcon />
                  </span>
                </div>
              ))
            )}
          </div>

          {/* footer */}
          <div className="mt-auto flex items-center justify-center gap-2 border-t border-line pt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-faint">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Made with LinkFolio
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Page component ----

export default function CreatePage() {
  // Form state
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [bio, setBio] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [links, setLinks] = useState<ProfileLink[]>([{ label: '', url: '' }])

  // Submit state
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CreatedResult | null>(null)

  // Presentation-only state
  const [origin, setOrigin] = useState('')
  const [copied, setCopied] = useState<'public' | 'edit' | null>(null)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  // ---- Link handlers ----

  function addLink() {
    setLinks(prev => [...prev, { label: '', url: '' }])
  }

  function updateLink(i: number, field: 'label' | 'url', value: string) {
    setLinks(prev => prev.map((l, j) => (j === i ? { ...l, [field]: value } : l)))
  }

  function removeLink(i: number) {
    setLinks(prev => prev.filter((_, j) => j !== i))
  }

  // ---- Submit handler ----

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setError(null)
    try {
      const data = await postProfile({ name, title, bio, photoUrl, links })
      setResult(data)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  // ---- Clipboard (presentation only) ----

  async function copyToClipboard(text: string, which: 'public' | 'edit') {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(which)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  // ---- Post-creation view ----

  if (status === 'done' && result) {
    const publicUrl = `${origin}/p/${result.id}`
    const editUrl = `${origin}/p/${result.id}?token=${result.editToken}`

    return (
      <main className="relative z-10 flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
        <div className="lf-glow left-1/2 top-0 h-[420px] w-[520px] -translate-x-1/2 animate-glow" />

        <div className="grid w-full min-w-0 max-w-5xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          {/* success copy + share links */}
          <div className="min-w-0 animate-fade-up">
            <span className="lf-eyebrow">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              You&apos;re live
            </span>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] text-ink sm:text-6xl">
              Your LinkFolio is{' '}
              <span className="italic text-accent">ready.</span>
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
              Share the public link with the world. Keep the edit link private
              anyone who has it can change your profile.
            </p>

            <div className="mt-8 space-y-4">
              {/* public link */}
              <div className="lf-card p-4 animate-fade-up" style={{ animationDelay: '80ms' }}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-muted">
                    Public link
                  </span>
                  <a
                    href={`/p/${result.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lf-btn-soft relative before:absolute before:-inset-4 before:content-[''] sm:before:hidden"
                  >
                    Open <ArrowIcon />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-lg bg-surface-2 px-3 py-2 font-mono text-[13px] text-ink-muted">
                    {publicUrl || `/p/${result.id}`}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(publicUrl, 'public')}
                    className="lf-btn-ghost shrink-0 px-3 py-2 text-[13px]"
                  >
                    {copied === 'public' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* edit link */}
              <div className="lf-card p-4 animate-fade-up" style={{ animationDelay: '160ms' }}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-accent">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path
                        d="M11.5 6.5V4.5a3.5 3.5 0 1 0-7 0v2M4 6.5h8a1 1 0 0 1 1 1V13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7.5a1 1 0 0 1 1-1Z"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Private edit link
                  </span>
                  <a
                    href={`/p/${result.id}?token=${result.editToken}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lf-btn-soft relative before:absolute before:-inset-4 before:content-[''] sm:before:hidden"
                  >
                    Open <ArrowIcon />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-lg bg-surface-2 px-3 py-2 font-mono text-[13px] text-ink-muted">
                    {editUrl || `/p/${result.id}?token=…`}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(editUrl, 'edit')}
                    className="lf-btn-ghost shrink-0 px-3 py-2 text-[13px]"
                  >
                    {copied === 'edit' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* live preview of what they just made */}
          <div className="flex min-w-0 justify-center animate-scale-in lg:justify-end" style={{ animationDelay: '120ms' }}>
            <LivePreview
              name={name}
              title={title}
              bio={bio}
              photoUrl={photoUrl}
              links={links}
            />
          </div>
        </div>
      </main>
    )
  }

  // ---- Creation form ----

  return (
    <main className="relative z-10 min-h-screen lg:grid lg:grid-cols-[1fr_minmax(0,520px)]">
      {/* ---------- Left: form ---------- */}
      <div className="flex flex-col px-6 py-10 sm:px-10 lg:px-16 lg:py-14">
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
        <header className="flex items-center gap-2.5 animate-fade-up">
          <LogoMark />
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            LinkFolio
          </span>
        </header>

        <div className="flex-1 pt-12 lg:pt-16">
          <div className="animate-fade-up" style={{ animationDelay: '60ms' }}>
            <span className="lf-eyebrow">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              No account needed
            </span>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] text-ink sm:text-6xl">
              One link for{' '}
              <span className="italic text-accent">everything</span> you are.
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
              Fill in a few details and get a beautiful profile page plus a
              private link to edit it later.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-6 animate-fade-up"
            style={{ animationDelay: '120ms' }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label htmlFor="name" className="lf-label">
                  Name <span className="text-accent">*</span>
                </label>
                <input
                  id="name"
                  required
                  placeholder="Ada Lovelace"
                  className="lf-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="sm:col-span-1">
                <label htmlFor="title" className="lf-label">
                  Title
                </label>
                <input
                  id="title"
                  placeholder="Designer & Founder"
                  className="lf-input"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="lf-label">
                Bio
              </label>
              <textarea
                id="bio"
                rows={3}
                placeholder="A sentence or two about you."
                className="lf-input resize-none"
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="photoUrl" className="lf-label">
                Photo URL
              </label>
              <input
                id="photoUrl"
                type="url"
                placeholder="https://…"
                className="lf-input"
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
              />
            </div>

            <fieldset className="space-y-3">
              <div className="flex items-center justify-between">
                <legend className="lf-label mb-0">
                  Links <span className="text-accent">*</span>
                </legend>
                <span className="lf-chip">{links.length} added</span>
              </div>

              <div className="space-y-3">
                {links.map((link, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-2 animate-fade-up sm:flex-row sm:items-center"
                  >
                    <input
                      placeholder="Label"
                      required
                      className="lf-input sm:w-44"
                      value={link.label}
                      onChange={e => updateLink(i, 'label', e.target.value)}
                    />
                    <div className="flex items-center gap-2 sm:flex-1">
                      <input
                        placeholder="https://…"
                        type="url"
                        required
                        className="lf-input flex-1"
                        value={link.url}
                        onChange={e => updateLink(i, 'url', e.target.value)}
                      />
                      {links.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLink(i)}
                          aria-label="Remove link"
                          className="lf-icon-btn"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={addLink} className="lf-btn-soft">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                Add link
              </button>
            </fieldset>

            {status === 'error' && (
              <p className="animate-slide-down rounded-xl border border-accent/30 bg-accent-tint px-4 py-3 text-[14px] text-accent-strong">
                {error}
              </p>
            )}

            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="lf-btn-accent"
              >
                {status === 'submitting' ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/40 border-t-current" />
                    Creating…
                  </>
                ) : (
                  <>
                    Create profile <ArrowIcon />
                  </>
                )}
              </button>
              <span className="text-[13px] text-ink-faint">
                Takes about 20 seconds
              </span>
            </div>
          </form>
        </div>
        </div>
      </div>

      {/* ---------- Right: sticky live preview ---------- */}
      <aside className="relative hidden items-center justify-center overflow-hidden border-l border-line bg-paper-2 lg:flex">
        <div className="lf-glow left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 animate-glow" />
        <div className="sticky top-0 flex h-screen items-center justify-center px-10">
          <div className="animate-float">
            <LivePreview
              name={name}
              title={title}
              bio={bio}
              photoUrl={photoUrl}
              links={links}
            />
          </div>
        </div>
      </aside>
    </main>
  )
}
