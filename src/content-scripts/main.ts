const getLastDescendant = ($parent: HTMLElement): HTMLElement => {
  if ($parent.childElementCount > 0) {
    return getLastDescendant($parent.children[0] as HTMLElement)
  }
  return $parent
}

const replaceAllInBlock = ($block: HTMLElement, replacedText: string) => {
  // TODO 脱 execCommand (https://stackoverflow.com/questions/60581285/execcommand-is-now-obsolete-whats-the-alternative)
  $block.focus()
  document.execCommand('selectAll')
  document.execCommand('delete')
  document.execCommand('insertText', false, replacedText)
}

// TODO たまに変更内容が正しくサーバーに送られない場合がある
const replaceText = (searchVal: string, replaceTo: string) => {
  const notionTextBlocks = Array.prototype.slice.call(
    document.getElementsByClassName('notion-text-block')
  ) as HTMLElement[]
  if (window.confirm('一括置換します')) {
    notionTextBlocks.forEach(($textBlock) => {
      let text = $textBlock.innerText
      while (text.includes(searchVal)) {
        const replacedText = text.replace(searchVal, replaceTo)
        const $leaf = getLastDescendant($textBlock)
        replaceAllInBlock($leaf, replacedText) // TODO 本当は毎回の置換前に確認したい
        text = $textBlock.innerText
      }
    })
  }
}

// TODO 入力受け取るようにしたい
const searchVal = 'ab'
const replaceTo = 'dc'

const $btn = document.createElement('button')
$btn.innerText = '一括置換'
$btn.onclick = () => replaceText(searchVal, replaceTo)
$btn.style.cssText = `
  position: fixed;
  top: 60px;
  right: 24px;
  z-index: 999999;
`
document.body.appendChild($btn)
