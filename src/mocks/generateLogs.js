import { LOG_COUNT, OPERATORS } from '../constants/logs.js'
import {
  DEGRADATION_PROFILE, DEVICE_COUNT, ERROR_MESSAGES, INFO_MESSAGES, WARNING_MESSAGES,
} from './mockConfig.js'

function mulberry32(seed) {
  return () => {
    let value = seed += 0x6D2B79F5
    value = Math.imul(value ^ value >>> 15, value | 1)
    value ^= value + Math.imul(value ^ value >>> 7, value | 61)
    return ((value ^ value >>> 14) >>> 0) / 4294967296
  }
}

function pick(items, random) {
  return items[Math.floor(random() * items.length)]
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function resolveSeverity(rsrp, latency, packetLoss, random, scenarioPosition) {
  if (scenarioPosition === 7 || (rsrp < -114 && random() < 0.48) || random() < 0.018) return 'ERROR'
  if (rsrp < -105 || latency > 145 || packetLoss > 3 || random() < 0.105) return 'WARNING'
  return 'INFO'
}

function resolveNetworkType(rsrp, random) {
  if (rsrp < -113 && random() < 0.24) return '3G'
  if (rsrp < -100 || random() < 0.34) return '4G'
  return '5G'
}

function messageFor(severity, random, scenarioPosition, operatorChange) {
  if (operatorChange) return operatorChange
  if (scenarioPosition === 5) return 'Signal degradation detected'
  if (scenarioPosition === 7) return 'Network connection lost'
  if (scenarioPosition === 8) return 'Network registration renewed'
  if (severity === 'ERROR') return pick(ERROR_MESSAGES, random)
  if (severity === 'WARNING') return pick(WARNING_MESSAGES, random)
  return pick(INFO_MESSAGES, random)
}

function tagFor(random, isRsrpReport) {
  if (isRsrpReport) return 'signal_measurement'
  return pick(['radio_event', 'registration', 'connection', 'handover', 'heartbeat'], random)
}

export function generateLogs(count = LOG_COUNT, seed = 20260912) {
  const random = mulberry32(seed)
  const logs = []
  const devices = Array.from({ length: DEVICE_COUNT }, (_, index) => ({
    id: `DEVICE-${String(index + 1).padStart(3, '0')}`,
    rsrp: -72 - Math.floor(random() * 30),
    operatorIndex: Math.floor(random() * OPERATORS.length),
    operatorRemaining: 140 + Math.floor(random() * 360),
    cellSequence: Math.floor(random() * 800000),
  }))
  let timestamp = Date.UTC(2026, 8, 12, 5, 30, 0, 0)
  let activeDeviceIndex = 0
  let sessionRemaining = 30 + Math.floor(random() * 70)
  let scenarioPosition = -1

  for (let index = 0; index < count; index += 1) {
    if (sessionRemaining <= 0) {
      activeDeviceIndex = (activeDeviceIndex + 1 + Math.floor(random() * 5)) % devices.length
      sessionRemaining = 28 + Math.floor(random() * 100)
    }
    sessionRemaining -= 1

    const device = devices[activeDeviceIndex]
    let operatorChange = null
    device.operatorRemaining -= 1
    if (device.operatorRemaining <= 0) {
      const previousOperator = OPERATORS[device.operatorIndex]
      device.operatorIndex = (device.operatorIndex + 1 + Math.floor(random() * (OPERATORS.length - 1))) % OPERATORS.length
      device.operatorRemaining = 160 + Math.floor(random() * 500)
      operatorChange = `Operator changed from ${previousOperator} to ${OPERATORS[device.operatorIndex]}`
    }

    const isRsrpReport = random() < 0.22
    if (isRsrpReport) {
      if (scenarioPosition < 0 && sessionRemaining > DEGRADATION_PROFILE.length && random() < 0.006) scenarioPosition = 0
      if (scenarioPosition >= 0) {
        device.rsrp = DEGRADATION_PROFILE[scenarioPosition] + Math.round((random() - 0.5) * 2)
        scenarioPosition += 1
        if (scenarioPosition >= DEGRADATION_PROFILE.length) scenarioPosition = -1
      } else {
        device.rsrp = clamp(device.rsrp + Math.round((random() - 0.48) * 5), -119, -67)
        if (device.rsrp < -110 && random() < 0.28) device.rsrp += 8
      }
    }

    const currentScenarioPosition = scenarioPosition < 0 ? -1 : scenarioPosition - 1
    const rsrp = Math.round(device.rsrp)
    const latency = Math.round(clamp(22 + (-82 - rsrp) * 2.3 + random() * 48, 12, 420))
    const packetLoss = Number(clamp(((-96 - rsrp) * 0.23) + random() * 1.2, 0, 14.8).toFixed(1))
    const severity = operatorChange ? 'INFO' : resolveSeverity(rsrp, latency, packetLoss, random, currentScenarioPosition)
    const networkType = resolveNetworkType(rsrp, random)
    const operator = OPERATORS[device.operatorIndex]
    if (random() < 0.035 || operatorChange) device.cellSequence += 1 + Math.floor(random() * 17)
    timestamp += 650 + Math.floor(random() * 3100)

    const text = isRsrpReport
      ? `rsrp=${rsrp} dBm`
      : messageFor(severity, random, currentScenarioPosition, operatorChange)
    logs.push({
      ctx: { operator },
      date: new Date(timestamp).toISOString(),
      tag: tagFor(random, isRsrpReport),
      level: severity === 'ERROR' ? 'E' : severity === 'WARNING' ? 'W' : 'D',
      text: isRsrpReport ? text : `${text}; network=${networkType}`,
    })
  }

  return logs
}
