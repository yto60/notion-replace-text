import {
  getIsActive,
  LOCAL_STORAGE_KEY_IS_ACTIVE,
  setIsActive
} from './storage'

const ACTIVE_ICON_COLOR = '#adadad'
const INACTIVE_ICON_COLOR = '#d3d3d3'

async function main() {
  chrome.action.onClicked.addListener(async () => {
    const isActive = await getIsActive()
    setIsActive(!isActive)
  })
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') {
      return
    }

    const newVal = !!changes[LOCAL_STORAGE_KEY_IS_ACTIVE].newValue
    onIsActiveChange(newVal)
  })
}

/** 拡張機能のアイコンを生成する */
const getIconImageData = (color: string): ImageData => {
  const canvas = new OffscreenCanvas(16, 16)
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, 16, 16)

  // background
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 16, 16)

  // text
  ctx.fillStyle = '#ffffff'
  ctx.font = `12px serif`
  ctx.fillText('n', 5, 12)

  return ctx.getImageData(0, 0, 16, 16)
}

const setIcon = (isActive: boolean) => {
  const color = isActive ? ACTIVE_ICON_COLOR : INACTIVE_ICON_COLOR
  const imageData = getIconImageData(color)
  chrome.action.setIcon({ imageData })
}

const onIsActiveChange = (isActive: boolean) => {
  setIcon(isActive)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0]?.id!, { showSearchBox: isActive })
  })
}

main()
