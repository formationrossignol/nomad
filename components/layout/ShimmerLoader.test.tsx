import { render } from '@testing-library/react'
import { ShimmerLoader } from './ShimmerLoader'

describe('ShimmerLoader', () => {
  it('renders with aria-hidden', () => {
    const { container } = render(<ShimmerLoader />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('forwards className to outer div', () => {
    const { container } = render(<ShimmerLoader className="h-48" />)
    expect(container.firstChild).toHaveClass('h-48')
  })
})
