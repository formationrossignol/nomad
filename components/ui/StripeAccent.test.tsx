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

  it('vertical orientation renders width 3px', () => {
    const { container } = render(<StripeAccent orientation="vertical" />)
    const el = container.firstChild as HTMLElement
    expect(el.style.width).toBe('3px')
  })

  it('visited=false renders stone stripe', () => {
    const { container } = render(<StripeAccent visited={false} />)
    const el = container.firstChild as HTMLElement
    expect(el.style.backgroundImage).toContain('#C8CDD4')
  })

  it('forwards className', () => {
    const { container } = render(<StripeAccent className="test-class" />)
    expect(container.firstChild).toHaveClass('test-class')
  })
})
