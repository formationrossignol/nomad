import { render, screen, fireEvent } from '@testing-library/react'
import { VisitedToggle } from './VisitedToggle'

describe('VisitedToggle', () => {
  it('shows "Mark as visited" when not visited', () => {
    render(<VisitedToggle isVisited={false} onToggle={jest.fn()} />)
    expect(screen.getByText(/mark as visited/i)).toBeInTheDocument()
  })

  it('shows "Visited" when visited', () => {
    render(<VisitedToggle isVisited={true} onToggle={jest.fn()} />)
    expect(screen.getByText('Visited')).toBeInTheDocument()
  })

  it('calls onToggle when clicked', () => {
    const onToggle = jest.fn()
    render(<VisitedToggle isVisited={false} onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
