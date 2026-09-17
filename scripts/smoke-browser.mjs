const endpoint = 'http://127.0.0.1:9223/json'
const { writeFile } = await import('node:fs/promises')

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

async function findTarget() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const targets = await fetch(endpoint).then((response) => response.json())
      const target = targets.find((item) => item.type === 'page' && item.url.includes('127.0.0.1:5173'))
      if (target) return target
    } catch {
      // Chrome may still be starting.
    }
    await sleep(250)
  }
  throw new Error('Chrome debugging target was not available')
}

const target = await findTarget()
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

let messageId = 0
const pending = new Map()
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (!message.id || !pending.has(message.id)) return
  const { resolve, reject } = pending.get(message.id)
  pending.delete(message.id)
  if (message.error) reject(new Error(message.error.message))
  else resolve(message.result)
})

function send(method, params = {}) {
  const id = ++messageId
  socket.send(JSON.stringify({ id, method, params }))
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }))
}

async function evaluate(expression) {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text)
  return response.result.value
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

await send('Runtime.enable')
await sleep(800)

const initial = await evaluate(`({
  title: document.title,
  renderedRows: document.querySelectorAll('.log-row').length,
  loaded: document.querySelectorAll('.log-row').length,
  scrollTop: document.querySelector('.log-scroll')?.scrollTop
})`)
assert(initial.title === 'Network Log Explorer', 'Unexpected document title')
assert(initial.renderedRows === 100 && initial.loaded === 100, 'Initial API page is invalid')
assert(initial.scrollTop > 0, 'The viewer did not start inside the loaded time window')

await evaluate(`(() => {
  const viewer = document.querySelector('.log-scroll');
  viewer.scrollTop = 0;
  viewer.dispatchEvent(new Event('scroll', { bubbles: true }));
})()`)
await sleep(350)
const afterOlderLoad = await evaluate(`({
  loaded: document.querySelectorAll('.log-row').length,
  scrollTop: document.querySelector('.log-scroll').scrollTop
})`)
assert(afterOlderLoad.loaded === 200, 'Scrolling up did not prepend the previous API page')
assert(afterOlderLoad.scrollTop > 0, 'Scroll anchor was not preserved after prepending logs')

await evaluate(`(() => {
  const viewer = document.querySelector('.log-scroll');
  viewer.scrollTop = viewer.scrollHeight - viewer.clientHeight;
  viewer.dispatchEvent(new Event('scroll', { bubbles: true }));
})()`)
await sleep(350)
const afterNewerLoad = await evaluate(`({
  loaded: document.querySelectorAll('.log-row').length
})`)
assert(afterNewerLoad.loaded > afterOlderLoad.loaded, 'Scrolling down did not append the next API page')

await evaluate(`(() => {
  const input = document.querySelector('[aria-label="Search logs by date"]');
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, '2026-09-12T15:00:00');
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
})()`)
await sleep(750)
const dateNavigation = await evaluate(`({
  rows: document.querySelectorAll('.log-row').length,
  inputValue: document.querySelector('[aria-label="Search logs by date"]').value
})`)
assert(dateNavigation.rows === 100 && dateNavigation.inputValue === '2026-09-12T15:00:00', 'Date navigation did not load the target page')

await evaluate(`document.querySelector('.log-row').click()`)
await sleep(150)
assert(await evaluate(`Boolean(document.querySelector('.log-details'))`), 'Log details did not open')
await send('Page.enable')
const detailScreenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
await writeFile('./artifacts/network-log-explorer.png', Buffer.from(detailScreenshot.data, 'base64'))

console.log(JSON.stringify({ initial, afterOlderLoad, afterNewerLoad, dateNavigation, details: true }, null, 2))
socket.close()
