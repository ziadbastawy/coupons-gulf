'use client'

import { useRef, useState, useTransition } from 'react'
import { voteCoupon } from '@/app/(frontend)/actions'

type Labels = {
  copy: string
  deal: string
  copied: string
  go: string
  didItWork: string
  yes: string
  no: string
  thanks: string
  pasteHint: string
  close: string
}

/**
 * The code is always printed in the page (so search engines and AI assistants can read it).
 * The button copies it and opens a sheet with the link to the store and a quick vote.
 */
export function CopyCode({ couponId, code, goHref, labels }: { couponId: number; code: string | null; goHref: string; labels: Labels }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [voted, setVoted] = useState(false)
  const [pending, start] = useTransition()

  async function onClick() {
    if (code) {
      try {
        await navigator.clipboard.writeText(code)
      } catch {
        /* clipboard blocked: the code is shown in the sheet to copy by hand */
      }
      dialog.current?.showModal()
    } else {
      window.open(goHref, '_blank', 'noopener')
    }
  }

  function vote(worked: boolean) {
    start(async () => {
      await voteCoupon(couponId, worked)
      setVoted(true)
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="h-11 w-full rounded-xl bg-ink px-4 font-semibold text-paper transition-opacity hover:opacity-90"
      >
        {code ? labels.copy : labels.deal}
      </button>

      {code && (
        <dialog
          ref={dialog}
          className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-2xl border border-line bg-card p-0 text-ink"
          onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        >
          <div className="sheet space-y-5 p-6 text-center">
            <p className="text-sm font-medium text-palm">{labels.copied}</p>
            <p className="code-face select-all rounded-xl border-2 border-dashed border-saffron bg-saffron-soft py-4 text-3xl font-bold text-saffron-ink">{code}</p>
            <p className="text-sm text-ink-soft">{labels.pasteHint}</p>
            <a
              href={goHref}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="flex h-12 items-center justify-center rounded-xl bg-saffron px-4 text-lg font-bold text-ink hover:brightness-95"
            >
              {labels.go}
            </a>
            <div className="border-t border-line pt-4">
              {voted ? (
                <p className="text-sm text-ink-soft" role="status">
                  {labels.thanks}
                </p>
              ) : (
                <>
                  <p className="mb-3 text-sm font-medium">{labels.didItWork}</p>
                  <div className="flex justify-center gap-2">
                    <button disabled={pending} onClick={() => vote(true)} className="rounded-full border border-palm px-4 py-1.5 text-sm text-palm hover:bg-palm-soft disabled:opacity-50">
                      {labels.yes}
                    </button>
                    <button disabled={pending} onClick={() => vote(false)} className="rounded-full border border-line px-4 py-1.5 text-sm text-ink-soft hover:bg-paper disabled:opacity-50">
                      {labels.no}
                    </button>
                  </div>
                </>
              )}
            </div>
            <button onClick={() => dialog.current?.close()} className="text-sm text-ink-soft underline underline-offset-4">
              {labels.close}
            </button>
          </div>
        </dialog>
      )}
    </>
  )
}
