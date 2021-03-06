export const LOCAL_STORAGE_KEY_IS_ACTIVE = 'notion_replace_text_is_active'

// In-page cache
let isActive: boolean

export const getIsActive = async (): Promise<boolean> => {
  if (isActive !== undefined) {
    return isActive
  }

  const savedVal = (
    await chrome.storage.local.get(LOCAL_STORAGE_KEY_IS_ACTIVE)
  )[LOCAL_STORAGE_KEY_IS_ACTIVE]
  if (savedVal === undefined) {
    // localStorage に保存された値がない場合は true を返す
    isActive = true
  } else {
    isActive = savedVal
  }
  return isActive
}

export const setIsActive = (val: boolean) => {
  isActive = val
  chrome.storage.local.set({
    [LOCAL_STORAGE_KEY_IS_ACTIVE]: isActive ? 1 : 0
  })
}
