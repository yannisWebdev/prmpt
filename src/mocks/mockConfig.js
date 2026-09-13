export const DEVICE_COUNT = 24

export const INFO_MESSAGES = [
  'Network connection established', 'Network connection stable', 'Operator selected',
  'Cell handover completed', 'Network type changed from 4G to 5G', 'Signal strength updated',
  'Data session established', 'Cell reselection completed', 'Radio link synchronized',
  'Bearer configuration updated', 'IP connectivity verified', 'Roaming status checked',
  'Network registration renewed', 'Uplink channel allocated', 'Downlink throughput nominal',
]

export const WARNING_MESSAGES = [
  'Weak signal detected', 'High network latency', 'Packet loss detected',
  'Frequent cell handovers detected', 'Signal degradation detected', 'Network type fallback to 4G',
  'Radio link quality unstable', 'Cell congestion observed', 'Retry threshold approaching',
  'Uplink throughput degraded', 'Temporary DNS resolution delay', 'Intermittent connectivity detected',
]

export const ERROR_MESSAGES = [
  'Network connection lost', 'Data session timeout', 'Cell handover failed',
  'Network registration failed', 'SIM registration error', 'Severe signal degradation',
  'Packet transmission failed', 'Radio link failure', 'Authentication rejected by network',
  'PDP context activation failed', 'Cell synchronization lost', 'Uplink transmission timeout',
]

export const DEGRADATION_PROFILE = [
  -86, -88, -91, -95, -101, -107, -113, -118, -116, -108, -101, -94, -88,
]
