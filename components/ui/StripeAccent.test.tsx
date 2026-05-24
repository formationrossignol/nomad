import { render } from '@testing-library/react'
import { StripeAccent } from './StripeAccent'

describe('StripeAccent', () => {
  it('renders with aria-hidden', () => {
    const { container } = render(<StripeAccent />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('defaults to horizontal 3px height', () => {
    const { container } = render(<StripeAccent />)
    const el = container.firstChild as HTMLElement
    expect(el.style.height).toBe('3px')
  })
})
