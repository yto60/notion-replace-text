const ACTIVE_ICON_COLOR = '#adadad'
const INACTIVE_ICON_COLOR = '#d3d3d3'

let isActive = true

function main() {
  setIsActive(true)
  chrome.action.onClicked.addListener(() => {
    setIsActive(!isActive)
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

const setIcon = () => {
  const color = isActive ? ACTIVE_ICON_COLOR : INACTIVE_ICON_COLOR
  const imageData = getIconImageData(color)
  chrome.action.setIcon({ imageData })
}

const setIsActive = (val: boolean) => {
  isActive = val
  setIcon()

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0]?.id!, { showSearchBox: isActive })
  })
}

main()
