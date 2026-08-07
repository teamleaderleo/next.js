import {
  NextInstance,
  nextTestSetup,
} from 'e2e-utils'
import { instant } from '@next/playwright'
import type * as Playwright from 'playwright'
import { join } from 'node:path'

async function openPage(next: NextInstance) {
  let page: Playwright.Page
  await next.browser('/', {
    beforePageLoad(p) {
      page = p
    },
  })
  return page!
}

describe('instant navigation origin isolation', () => {
  const { next } = nextTestSetup({
    files: join(__dirname, 'fixtures', 'default'),
  })

  it('preserves an instant-navigation cookie owned by another origin', async () => {
    const page = await openPage(next)
    const context = page.context()
    const otherDomain = 'other.example'
    const otherValue = JSON.stringify([1, 'other-origin', null])

    await context.addCookies([
      {
        name: 'next-instant-navigation-testing',
        value: otherValue,
        domain: otherDomain,
        path: '/',
      },
    ])

    await instant(page, async () => {
      const otherOriginCookie = (await context.cookies()).find(
        (cookie) =>
          cookie.name === 'next-instant-navigation-testing' &&
          cookie.domain === otherDomain &&
          cookie.path === '/'
      )

      expect(otherOriginCookie?.value).toBe(otherValue)
    })
  })
})
