interface AdminDialogOptions {
  title: string
  message?: string
  showInput?: boolean
  inputLabel?: string
  placeholder?: string
  defaultValue?: string
  confirmText?: string
  cancelText?: string
}

interface AdminDialogResult {
  confirmed: boolean
  inputValue: string
}

type AdminDialogResolver = ((value: AdminDialogResult) => void) | null

interface AdminDialogState {
  isOpen: boolean
  title: string
  message: string
  showInput: boolean
  inputLabel: string
  placeholder: string
  inputValue: string
  confirmText: string
  cancelText: string
}

const createDefaultState = (): AdminDialogState => ({
  isOpen: false,
  title: '',
  message: '',
  showInput: false,
  inputLabel: '',
  placeholder: '',
  inputValue: '',
  confirmText: '确定',
  cancelText: '取消'
})

export const useAdminDialog = () => {
  const state = useState<AdminDialogState>('admin-dialog', createDefaultState)
  const resolver = useState<AdminDialogResolver>('admin-dialog-resolver', () => null)

  const finalize = (result: AdminDialogResult) => {
    const resolveFn = resolver.value
    resolver.value = null
    state.value = createDefaultState()
    resolveFn?.(result)
  }

  /**
   * 显示确认对话框
   */
  const confirm = (options: string | AdminDialogOptions): Promise<boolean> => {
    if (!process.client) {
      return Promise.resolve(false)
    }

    if (state.value.isOpen) {
      finalize({ confirmed: false, inputValue: '' })
    }

    const normalized: AdminDialogOptions = typeof options === 'string'
      ? { title: '确认', message: options }
      : options

    return new Promise<boolean>((resolve) => {
      state.value = {
        isOpen: true,
        title: normalized.title,
        message: normalized.message ?? '',
        showInput: false,
        inputLabel: '',
        placeholder: '',
        inputValue: '',
        confirmText: normalized.confirmText ?? '确定',
        cancelText: normalized.cancelText ?? '取消'
      }
      resolver.value = (result: AdminDialogResult) => {
        resolve(result.confirmed)
      }
    })
  }

  /**
   * 显示带输入框的对话框
   */
  const prompt = (options: string | AdminDialogOptions, defaultValue?: string): Promise<string | null> => {
    if (!process.client) {
      return Promise.resolve(null)
    }

    if (state.value.isOpen) {
      finalize({ confirmed: false, inputValue: '' })
    }

    const normalized: AdminDialogOptions = typeof options === 'string'
      ? { title: '输入', message: options, defaultValue }
      : options

    return new Promise<string | null>((resolve) => {
      state.value = {
        isOpen: true,
        title: normalized.title,
        message: normalized.message ?? '',
        showInput: true,
        inputLabel: normalized.inputLabel ?? '',
        placeholder: normalized.placeholder ?? '',
        inputValue: normalized.defaultValue ?? '',
        confirmText: normalized.confirmText ?? '确定',
        cancelText: normalized.cancelText ?? '取消'
      }
      resolver.value = (result: AdminDialogResult) => {
        resolve(result.confirmed ? result.inputValue : null)
      }
    })
  }

  return {
    state,
    confirm,
    prompt,
    respond: finalize
  }
}
