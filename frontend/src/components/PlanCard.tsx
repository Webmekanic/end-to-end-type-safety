import type { Plan } from '../api/plans.ts'
import { formatPrice } from './formatPrice.ts'

const features = ['Unlimited projects', 'Priority support', 'Advanced analytics']

export function PlanCard({ plan }: { plan: Plan }) {
  return (
    <article className="plan-card" aria-labelledby="plan-name">
      <h2 id="plan-name" className="plan-name">
        {plan.name}
      </h2>
      <p className="plan-price">
        <span className="plan-amount">{formatPrice(plan.price, plan.currency)}</span>
        <span className="plan-period"> / month</span>
      </p>
      <p className="plan-description">
        Everything a growing team needs to ship with confidence.
      </p>
      <ul className="plan-features">
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <button type="button" className="button">
        Choose {plan.name}
      </button>
    </article>
  )
}
