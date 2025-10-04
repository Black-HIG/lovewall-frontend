import { createHmac } from 'node:crypto'

interface GeetestV4Tokens {
  lot_number: string
  captcha_output: string
  pass_token: string
  gen_time: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const captchaId = config.public?.geetestId as string | undefined
  const captchaKey = (config as any).geetestKey as string | undefined

  if (!captchaId || !captchaKey) {
    return {
      success: false,
      error: 'Geetest not configured',
    }
  }

  const body = (await readBody<Partial<GeetestV4Tokens>>(event)) || {}
  const { lot_number, captcha_output, pass_token, gen_time } = body

  if (!lot_number || !captcha_output || !pass_token || !gen_time) {
    return {
      success: false,
      error: 'Missing captcha fields',
    }
  }

  const signToken = createHmac('sha256', captchaKey)
    .update(lot_number, 'utf8')
    .digest('hex')

  const form = new URLSearchParams()
  form.set('lot_number', lot_number)
  form.set('captcha_output', captcha_output)
  form.set('pass_token', pass_token)
  form.set('gen_time', gen_time)
  form.set('sign_token', signToken)
  form.set('captcha_id', captchaId)

  try {
    const resp = await $fetch<{ result: 'success' | 'fail'; reason?: string }>(
      'https://gcaptcha4.geetest.com/validate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      }
    )

    if (resp.result === 'success') {
      return { success: true }
    }
    return { success: false, error: resp.reason || 'captcha failed' }
  } catch (e: any) {
    return { success: false, error: e?.message || 'captcha verify error' }
  }
})

