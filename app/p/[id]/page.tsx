'use client'

import { use, useState, useEffect, useCallback } from 'react'

// ---- Types ----

type ProfileLink = { label: string; url: string }

type Profile = {
  id: string
  createdAt: string
  name: string
  title: string
  bio: string
  photoUrl: string
  links: ProfileLink[]
}

type EditFormState = {
  name: string
  title: string
  bio: string
  photoUrl: string
  links: ProfileLink[]
}

// ---- API ----

async function fetchProfile(
  id: string,
  token: string | undefined
): Promise<{ profile: Profile; isEditable: boolean }> {
  const url = token
    ? `/api/profiles/${id}?token=${encodeURIComponent(token)}`
    : `/api/profiles/${id}`
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? 'Failed to load profile')
  }
  return res.json()
}

async function putProfile(
  id: string,
  token: string,
  form: EditFormState
): Promise<Profile> {
  const res = await fetch(`/api/profiles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, ...form }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? 'Failed to save profile')
  }
  const json = await res.json()
  return (json as { profile: Profile }).profile
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

function ProfileSkeleton() {
  return (
    <div className="w-full max-w-md text-center">
      <div className="lf-skeleton mx-auto h-24 w-24 rounded-full" />
      <div className="lf-skeleton mx-auto mt-5 h-7 w-44" />
      <div className="lf-skeleton mx-auto mt-3 h-4 w-28" />
      <div className="mt-8 space-y-3">
        <div className="lf-skeleton h-14 w-full rounded-xl" />
        <div className="lf-skeleton h-14 w-full rounded-xl" />
        <div className="lf-skeleton h-14 w-full rounded-xl" />
      </div>
    </div>
  )
}

// ---- Page component ----

export default function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = use(params)
  const rawSearch = use(searchParams)
  const token = typeof rawSearch.token === 'string' ? rawSearch.token : undefined

  // Load state
  const [loadStatus, setLoadStatus] = useState<'loading' | 'error' | 'ready'>('loading')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isEditable, setIsEditable] = useState(false)

  // Save state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)

  // Edit form state (pre-filled from profile on load)
  const [editForm, setEditForm] = useState<EditFormState>({
    name: '',
    title: '',
    bio: '',
    photoUrl: '',
    links: [],
  })

  // Presentation-only: whether the edit panel is expanded
  const [editing, setEditing] = useState(false)

  // ---- Data fetching ----

  const loadProfile = useCallback(async () => {
    setLoadStatus('loading')
    setLoadError(null)
    try {
      const data = await fetchProfile(id, token)
      setProfile(data.profile)
      setIsEditable(data.isEditable)
      setEditForm({
        name: data.profile.name,
        title: data.profile.title,
        bio: data.profile.bio,
        photoUrl: data.profile.photoUrl,
        links: data.profile.links,
      })
      setLoadStatus('ready')
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load profile')
      setLoadStatus('error')
    }
  }, [id, token])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // ---- Form handlers ----

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setSaveStatus('saving')
    setSaveError(null)
    try {
      const updated = await putProfile(id, token, editForm)
      setProfile(updated)
      setEditForm({
        name: updated.name,
        title: updated.title,
        bio: updated.bio,
        photoUrl: updated.photoUrl,
        links: updated.links,
      })
      setSaveStatus('saved')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
      setSaveStatus('error')
    }
  }

  function addLink() {
    setEditForm(f => ({ ...f, links: [...f.links, { label: '', url: '' }] }))
  }

  function updateLink(i: number, field: 'label' | 'url', value: string) {
    setEditForm(f => ({
      ...f,
      links: f.links.map((l, j) => (j === i ? { ...l, [field]: value } : l)),
    }))
  }

  function removeLink(i: number) {
    setEditForm(f => ({ ...f, links: f.links.filter((_, j) => j !== i) }))
  }

  // ---- Render states ----

  if (loadStatus === 'loading') {
    return (
      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <ProfileSkeleton />
      </main>
    )
  }

  if (loadStatus === 'error') {
    return (
      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="lf-card max-w-sm p-8 text-center animate-scale-in">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-tint text-accent">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <h1 className="mt-4 font-display text-2xl text-ink">
            Profile not found
          </h1>
          <p className="mt-2 text-[14px] text-ink-muted">
            {loadError ?? 'This profile may have been removed.'}
          </p>
          <a href="/" className="lf-btn-ghost mt-6">
            Create your own
          </a>
        </div>
      </main>
    )
  }

  if (!profile) return null

  const monogram = initials(profile.name)

  // ---- Main render ----

  return (
    <main className="relative z-10 grid min-h-screen place-items-center overflow-hidden px-6 py-16 sm:py-20">
      <div className="lf-glow left-1/2 top-[-60px] h-[380px] w-[560px] -translate-x-1/2 animate-glow" />

      <div className="relative mx-auto w-full max-w-md">
        {/* ---- Editor banner (only when token matches) ---- */}
        {isEditable && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent-tint px-4 py-3 animate-fade-up">
            <span className="flex items-center gap-2 text-[13px] font-medium text-accent-strong">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M11.5 6.5V4.5a3.5 3.5 0 1 0-7 0v2M4 6.5h8a1 1 0 0 1 1 1V13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7.5a1 1 0 0 1 1-1Z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Edit access
            </span>
            <button
              type="button"
              onClick={() => setEditing(v => !v)}
              className="lf-btn-soft"
            >
              {editing ? 'View profile' : 'Edit profile'}
            </button>
          </div>
        )}

        {/* ---- Profile view ---- */}
        <section className="text-center animate-fade-up" style={{ animationDelay: '60ms' }}>
          <div className="relative mx-auto mb-5 h-24 w-24">
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-accent/40 to-transparent blur-lg" />
            {profile.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.photoUrl}
                alt={profile.name}
                className="relative h-24 w-24 rounded-full object-cover ring-2 ring-surface shadow-lg"
              />
            ) : (
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-strong text-3xl font-semibold text-accent-foreground shadow-lg">
                {monogram ?? '✶'}
              </div>
            )}
          </div>

          <h1 className="font-display text-4xl leading-tight text-ink">
            {profile.name}
          </h1>
          {profile.title && (
            <p className="mt-1.5 text-[13px] font-semibold uppercase tracking-[0.16em] text-accent">
              {profile.title}
            </p>
          )}
          {profile.bio && (
            <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-ink-muted">
              {profile.bio}
            </p>
          )}

          <ul className="mt-8 space-y-3 text-left">
            {profile.links.map((link, i) => (
              <li
                key={i}
                className="animate-fade-up"
                style={{ animationDelay: `${120 + i * 60}ms` }}
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lf-link group"
                >
                  <span className="truncate">{link.label}</span>
                  <span className="text-ink-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-accent">
                    <ArrowIcon />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* ---- Edit form (only when token matches and panel open) ---- */}
        {isEditable && editing && (
          <section className="mt-10 animate-slide-down">
            <div className="lf-card p-6 sm:p-7">
              <h2 className="font-display text-2xl text-ink">Edit profile</h2>
              <p className="mt-1 text-[13px] text-ink-muted">
                Changes go live the moment you save.
              </p>

              <form onSubmit={handleSave} className="mt-6 space-y-5">
                <div>
                  <label htmlFor="edit-name" className="lf-label">
                    Name <span className="text-accent">*</span>
                  </label>
                  <input
                    id="edit-name"
                    required
                    className="lf-input"
                    value={editForm.name}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>

                <div>
                  <label htmlFor="edit-title" className="lf-label">
                    Title
                  </label>
                  <input
                    id="edit-title"
                    className="lf-input"
                    value={editForm.title}
                    onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label htmlFor="edit-bio" className="lf-label">
                    Bio
                  </label>
                  <textarea
                    id="edit-bio"
                    rows={3}
                    className="lf-input resize-none"
                    value={editForm.bio}
                    onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                  />
                </div>

                <div>
                  <label htmlFor="edit-photo" className="lf-label">
                    Photo URL
                  </label>
                  <input
                    id="edit-photo"
                    type="url"
                    className="lf-input"
                    value={editForm.photoUrl}
                    onChange={e => setEditForm(f => ({ ...f, photoUrl: e.target.value }))}
                  />
                </div>

                <fieldset className="space-y-3">
                  <legend className="lf-label mb-0">Links</legend>
                  <div className="space-y-3">
                    {editForm.links.map((link, i) => (
                      <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          placeholder="Label"
                          required
                          className="lf-input sm:w-36"
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
                          {editForm.links.length > 1 && (
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

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={saveStatus === 'saving'}
                    className="lf-btn-accent"
                  >
                    {saveStatus === 'saving' ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/40 border-t-current" />
                        Saving…
                      </>
                    ) : (
                      'Save changes'
                    )}
                  </button>

                  {saveStatus === 'saved' && (
                    <span className="flex items-center gap-1.5 text-[14px] font-medium text-accent animate-fade-in">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path d="M3 8.5l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Saved
                    </span>
                  )}
                  {saveStatus === 'error' && (
                    <span className="text-[14px] text-accent-strong">{saveError}</span>
                  )}
                </div>
              </form>
            </div>
          </section>
        )}

        {/* ---- Footer wordmark ---- */}
        <footer className="mt-12 text-center animate-fade-in" style={{ animationDelay: '300ms' }}>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-faint transition-colors hover:text-accent"
          >
            Made with LinkFolio
          </a>
        </footer>
      </div>
    </main>
  )
}
