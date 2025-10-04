interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
}

interface PromptOptions {
  title?: string
  message?: string
  placeholder?: string
  defaultValue?: string
  confirmText?: string
  cancelText?: string
}

type ConfirmResolver = ((value: boolean) => void) | null

type PromptResolver = ((value: string | null) => void) | null

interface ConfirmState {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
}

interface PromptState {
  isOpen: boolean
  title: string
  message: string
  placeholder: string
  inputValue: string
  confirmText: string
  cancelText: string
}

const createDefaultConfirmState = (): ConfirmState => ({
  isOpen: false,
  title: '',
  message: '',
  confirmText: '确定',
  cancelText: '取消'
})

const createDefaultPromptState = (): PromptState => ({
  isOpen: false,
  title: '',
  message: '',
  placeholder: '',
  inputValue: '',
  confirmText: '确定',
  cancelText: '取消'
})

export const useConfirm = () => {
  const state = useState<ConfirmState>('app-confirm-dialog', createDefaultConfirmState)
  const resolver = useState<ConfirmResolver>('app-confirm-dialog-resolver', () => null)

  const finalize = (result: boolean) => {
    const resolveFn = resolver.value
    resolver.value = null
    state.value = createDefaultConfirmState()
    resolveFn?.(result)
  }

  const confirm = (options: string | ConfirmOptions) => {
    if (!process.client) {
      return Promise.resolve(false)
    }

    if (state.value.isOpen) {
      finalize(false)
    }

    const normalized: ConfirmOptions = typeof options === 'string'
      ? { message: options }
      : options

    return new Promise<boolean>((resolve) => {
      state.value = {
        isOpen: true,
        title: normalized.title ?? '',
        message: normalized.message,
        confirmText: normalized.confirmText ?? '确定',
        cancelText: normalized.cancelText ?? '取消'
      }
      resolver.value = (decision: boolean) => {
        resolve(decision)
      }
    })
  }

  return {
    state,
    confirm,
    respond: finalize
  }
}

export const usePrompt = () => {
  const state = useState<PromptState>('app-prompt-dialog', createDefaultPromptState)
  const resolver = useState<PromptResolver>('app-prompt-dialog-resolver', () => null)

  const finalize = (value: string | null) => {
    const resolveFn = resolver.value
    resolver.value = null
    state.value = createDefaultPromptState()
    resolveFn?.(value)
  }

  const prompt = (messageOrOptions: string | PromptOptions, defaultValue?: string) => {
    if (!process.client) {
      return Promise.resolve(null)
    }

    if (state.value.isOpen) {
      finalize(null)
    }

    const normalized: PromptOptions = typeof messageOrOptions === 'string'
      ? { message: messageOrOptions, defaultValue }
      : messageOrOptions

    return new Promise<string | null>((resolve) => {
      state.value = {
        isOpen: true,
        title: normalized.title ?? '',
        message: normalized.message ?? '',
        placeholder: normalized.placeholder ?? '',
        inputValue: normalized.defaultValue ?? '',
        confirmText: normalized.confirmText ?? '确定',
        cancelText: normalized.cancelText ?? '取消'
      }
      resolver.value = (input: string | null) => {
        resolve(input)
      }
    })
  }

  const setValue = (value: string) => {
    state.value.inputValue = value
  }

  return {
    state,
    prompt,
    respond: finalize,
    setValue
  }
}
