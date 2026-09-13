import { OPERATOR_COLORS } from '../../constants/logs'

export function OperatorStrip({ operator }) {
  return <span className="operator-segment" style={{ backgroundColor: OPERATOR_COLORS[operator] }} title={operator} />
}
