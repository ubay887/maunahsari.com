import { describe, it, expect } from 'vitest'

describe('Project tooling', () => {
  it('vitest is configured and running', () => {
    expect(true).toBe(true)
  })

  it('path alias @/ resolves to src/', async () => {
    // Dynamic import using the @/ alias - if this resolves, the alias works
    const module = await import('@/test/setup.js')
    expect(module).toBeDefined()
  })
})
