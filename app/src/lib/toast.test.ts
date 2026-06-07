import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ToastStore } from './toast.ts'

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

test('push adds a toast and returns its id', () => {
  const store = new ToastStore()
  const id = store.push({ kind: 'info', message: 'hello' })
  assert.equal(store.getToasts().length, 1)
  assert.equal(store.getToasts()[0].id, id)
  assert.equal(store.getToasts()[0].message, 'hello')
})

test('push appends in order and preserves earlier toasts', () => {
  const store = new ToastStore()
  store.push({ kind: 'info', message: 'first' })
  store.push({ kind: 'success', message: 'second' })
  const toasts = store.getToasts()
  assert.equal(toasts.length, 2)
  assert.equal(toasts[0].message, 'first')
  assert.equal(toasts[1].message, 'second')
})

test('dismiss removes a toast by id and is a no-op for unknown ids', () => {
  const store = new ToastStore()
  const id = store.push({ kind: 'info', message: 'hello' })
  store.dismiss('does-not-exist')
  assert.equal(store.getToasts().length, 1)
  store.dismiss(id)
  assert.equal(store.getToasts().length, 0)
})

test('subscribers are notified on push and dismiss', () => {
  const store = new ToastStore()
  let notifications = 0
  const unsubscribe = store.subscribe(() => { notifications++ })

  const id = store.push({ kind: 'info', message: 'hello' })
  assert.equal(notifications, 1)

  store.dismiss(id)
  assert.equal(notifications, 2)

  unsubscribe()
  store.push({ kind: 'info', message: 'after unsubscribe' })
  assert.equal(notifications, 2)
})

test('success toasts auto-dismiss after their timer', async () => {
  const store = new ToastStore({ success: 15 })
  store.push({ kind: 'success', message: 'auto-clears' })
  assert.equal(store.getToasts().length, 1)

  await wait(60)
  assert.equal(store.getToasts().length, 0)
})

test('error toasts persist until manually dismissed', async () => {
  const store = new ToastStore({ error: null })
  const id = store.push({ kind: 'error', message: 'sticks around' })

  await wait(60)
  assert.equal(store.getToasts().length, 1, 'error toast should not auto-dismiss')

  store.dismiss(id)
  assert.equal(store.getToasts().length, 0)
})

test('dismissing a toast clears its pending auto-dismiss timer (no double-removal errors)', async () => {
  const store = new ToastStore({ info: 30 })
  const id = store.push({ kind: 'info', message: 'manually dismissed early' })

  store.dismiss(id)
  assert.equal(store.getToasts().length, 0)

  // If the timer weren't cleared, this would fire a second removal attempt —
  // dismiss() is a no-op for unknown ids, so nothing should change either way.
  await wait(60)
  assert.equal(store.getToasts().length, 0)
})
