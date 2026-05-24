interface StripeAccentProps {
  orientation?: 'horizontal' | 'vertical'
  height?: string
  visited?: boolean
  className?: string
}

const STRIPE_NAVY = 'repeating-linear-gradient(90deg, #163A70 0px, #163A70 3px, #F7F5F1 3px, #F7F5F1 18px)'
const STRIPE_STONE = 'repeating-linear-gradient(90deg, #C8CDD4 0px, #C8CDD4 3px, #F7F5F1 3px, #F7F5F1 18px)'
const STRIPE_VERTICAL = 'repeating-linear-gradient(0deg, #163A70 0px, #163A70 3px, #F7F5F1 3px, #F7F5F1 18px)'

export function StripeAccent({ orientation = 'horizontal', height = '3px', visited = true, className = '' }: StripeAccentProps) {
  const style = orientation === 'horizontal'
    ? { height, backgroundImage: visited ? STRIPE_NAVY : STRIPE_STONE }
    : { width: '3px', alignSelf: 'stretch', backgroundImage: STRIPE_VERTICAL }
  return <div style={style} className={className} aria-hidden="true" />
}
