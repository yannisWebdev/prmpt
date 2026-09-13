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
  total: document.querySelector('.stat-total')?.innerText,
  renderedRows: document.querySelectorAll('.log-row').length,
  windowStart: Number(document.querySelector('.timeline-window')?.dataset.windowStart),
  windowEnd: Number(document.querySelector('.timeline-window')?.dataset.windowEnd),
  loaded: Number(document.querySelector('.timeline-window')?.dataset.windowEnd) - Number(document.querySelector('.timeline-window')?.dataset.windowStart),
  scrollTop: document.querySelector('.log-scroll')?.scrollTop,
  minimap: Boolean(document.querySelector('.minimap-track')),
  dark: document.documentElement.classList.contains('dark')
})`)
assert(initial.title === 'Network Log Explorer', 'Unexpected document title')
assert(initial.total.includes('20,000'), 'Initial 20,000 log count is missing')
assert(initial.renderedRows > 0 && initial.renderedRows < 100, 'Log rows are not virtualized')
assert(initial.minimap && initial.dark, 'Initial minimap or dark theme is missing')
assert(initial.loaded === 600 && initial.windowStart > 0 && initial.windowEnd < 20000, 'Initial progressive window is invalid')
assert(initial.scrollTop > 0, 'The viewer did not start inside the loaded time window')

await evaluate(`(() => {
  const viewer = document.querySelector('.log-scroll');
  viewer.scrollTop = 0;
  viewer.dispatchEvent(new Event('scroll', { bubbles: true }));
})()`)
await sleep(350)
const afterOlderLoad = await evaluate(`({
  start: Number(document.querySelector('.timeline-window').dataset.windowStart),
  end: Number(document.querySelector('.timeline-window').dataset.windowEnd),
  scrollTop: document.querySelector('.log-scroll').scrollTop
})`)
assert(afterOlderLoad.start < initial.windowStart, 'Scrolling up did not load older logs')
assert(afterOlderLoad.end === initial.windowEnd, 'Older loading changed the recent window edge unexpectedly')
assert(afterOlderLoad.scrollTop > 0, 'Scroll anchor was not preserved after prepending logs')

await evaluate(`(() => {
  const viewer = document.querySelector('.log-scroll');
  viewer.scrollTop = viewer.scrollHeight - viewer.clientHeight;
  viewer.dispatchEvent(new Event('scroll', { bubbles: true }));
})()`)
await sleep(350)
const afterNewerLoad = await evaluate(`({
  start: Number(document.querySelector('.timeline-window').dataset.windowStart),
  end: Number(document.querySelector('.timeline-window').dataset.windowEnd),
  loaded: Number(document.querySelector('.timeline-window').dataset.windowEnd) - Number(document.querySelector('.timeline-window').dataset.windowStart)
})`)
assert(afterNewerLoad.end > afterOlderLoad.end, 'Scrolling down did not load newer logs')
assert(afterNewerLoad.loaded <= 1200, 'Progressive log window exceeded its memory limit')

await evaluate(`(() => {
  const input = document.querySelector('[aria-label="Jump to date and time in UTC"]');
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, '2026-09-12T15:00:00');
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
})()`)
await sleep(750)
const dateNavigation = await evaluate(`({
  focused: Boolean(document.querySelector('.log-row.is-focused')),
  timestamp: document.querySelector('.log-row.is-focused .timestamp-cell')?.innerText,
  windowStart: Number(document.querySelector('.timeline-window').dataset.windowStart),
  inputValue: document.querySelector('[aria-label="Jump to date and time in UTC"]').value
})`)
assert(dateNavigation.focused && /^(14:59:59|15:00:00)/.test(dateNavigation.timestamp), 'Date navigation did not focus the closest timestamp')
assert(dateNavigation.windowStart > afterNewerLoad.start, 'Date navigation did not load the target time window')

await evaluate(`(() => {
  const input = document.querySelector('[aria-label="Search logs"]');
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'Network connection lost');
  input.dispatchEvent(new Event('input', { bubbles: true }));
})()`)
await sleep(500)
const filteredTotal = await evaluate(`Number(document.querySelector('.stat-total').innerText.replace(/[^0-9]/g, ''))`)
assert(filteredTotal > 0 && filteredTotal < 20000, 'Search did not filter the dataset')

await evaluate(`document.querySelector('.log-row').click()`)
await sleep(150)
assert(await evaluate(`Boolean(document.querySelector('.log-details'))`), 'Log details did not open')
const annotationSizing = await evaluate(`(() => {
  const bookmark = getComputedStyle(document.querySelector('.detail-action'));
  const palette = getComputedStyle(document.querySelector('.highlight-actions'));
  const swatch = getComputedStyle(document.querySelector('[aria-label="Highlight Yellow"]'));
  return { bookmarkFont: bookmark.fontSize, bookmarkHeight: bookmark.height, paletteHeight: palette.height, swatchSize: swatch.width };
})()`)
assert(annotationSizing.bookmarkFont === '12px' && annotationSizing.bookmarkHeight === '38px', 'Bookmark action is not large enough')
assert(annotationSizing.paletteHeight === '38px' && annotationSizing.swatchSize === '17px', 'Highlight palette is not large enough')
await send('Page.enable')
const detailScreenshot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
await writeFile('./artifacts/network-log-explorer.png', Buffer.from(detailScreenshot.data, 'base64'))

await evaluate(`document.querySelector('[aria-label="Highlight Yellow"]').click()`)
await evaluate(`document.querySelector('.detail-action').click()`)
await sleep(200)
const persisted = await evaluate(`({
  highlights: Object.keys(JSON.parse(localStorage.getItem('network-logs:highlights') || '{}')).length,
  bookmarks: JSON.parse(localStorage.getItem('network-logs:bookmarks') || '[]').length,
  bookmarkItems: document.querySelectorAll('.bookmark-item').length
})`)
assert(persisted.highlights === 1 && persisted.bookmarks === 1 && persisted.bookmarkItems === 1, 'Bookmark or highlight was not persisted')

await evaluate(`document.querySelector('.add-note').click()`)
await sleep(80)
await evaluate(`(() => {
  const note = document.querySelector('.note-editor textarea');
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(note, 'Field test observation');
  note.dispatchEvent(new Event('input', { bubbles: true }));
  document.querySelector('.note-editor button').click();
})()`)
await sleep(120)
assert(await evaluate(`JSON.parse(localStorage.getItem('network-logs:bookmarks'))[0].note === 'Field test observation'`), 'Bookmark note was not saved')

const scrollBefore = await evaluate(`document.querySelector('.log-scroll').scrollTop`)
await evaluate(`(() => {
  const track = document.querySelector('.minimap-track');
  const rect = track.getBoundingClientRect();
  track.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height * .72 }));
})()`)
await sleep(300)
const scrollAfter = await evaluate(`document.querySelector('.log-scroll').scrollTop`)
assert(scrollAfter > scrollBefore, 'Minimap click did not navigate the virtualized viewer')

await evaluate(`document.querySelector('[aria-label="Use light theme"]').click()`)
await sleep(100)
assert(await evaluate(`!document.documentElement.classList.contains('dark') && JSON.parse(localStorage.getItem('network-logs:theme')) === 'light'`), 'Theme preference was not applied or persisted')

console.log(JSON.stringify({ initial, afterOlderLoad, afterNewerLoad, dateNavigation, filteredTotal, annotationSizing, persisted, noteSaved: true, minimapScrolled: scrollAfter > scrollBefore, themePersisted: true }, null, 2))
socket.close()
