import { useEffect, useState } from 'react'
import { fetchProPlan, PlanValidationError, type Plan } from './api/plans.ts'
import { PlanCard } from './components/PlanCard.tsx'

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string; detail?: string }
  | { status: 'success'; plan: Plan }

function toErrorState(error: unknown): State {
  if (error instanceof PlanValidationError) {
    return {
      status: 'error',
      message: 'The server sent an invalid plan response.',
      detail: error.issues.join('; '),
    }
  }
  const message = error instanceof Error ? error.message : 'Unknown error'
  return { status: 'error', message }
}

function App() {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    fetchProPlan(controller.signal)
      .then((plan) => setState({ status: 'success', plan }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState(toErrorState(error))
      })

    return () => controller.abort()
  }, [attempt])

  function retry() {
    setState({ status: 'loading' })
    setAttempt((n) => n + 1)
  }

  return (
    <main>
      <header className="page-header">
        <h1>Choose your plan</h1>
        <p>Simple pricing. Cancel any time.</p>
      </header>

      {state.status === 'loading' && (
        <p className="status" role="status">
          Loading plan…
        </p>
      )}

      {state.status === 'error' && (
        <div className="status status-error" role="alert">
          <p>We couldn't load the plan. {state.message}</p>
          {state.detail && <p className="status-detail">{state.detail}</p>}
          <button type="button" className="button" onClick={retry}>
            Try again
          </button>
        </div>
      )}

      {state.status === 'success' && <PlanCard plan={state.plan} />}
    </main>
  )
}

export default App
