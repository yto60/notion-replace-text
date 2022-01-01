// polyfill for using web components in chrome extension (refs: https://stackoverflow.com/questions/30022350)
import '@webcomponents/custom-elements'

import SearchWindow from './searchWindow'

/** 要素の子孫を辿って、最初の葉を返す */
const getFirstLeaf = ($parent: HTMLElement): HTMLElement => {
  if ($parent.childElementCount > 0) {
    return getFirstLeaf($parent.children[0] as HTMLElement)
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
  if (!window.confirm('一括置換します')) {
    return
  }
  const notionTextBlocks = Array.prototype.slice.call(
    document.getElementsByClassName('notion-text-block')
  ) as HTMLElement[]
  notionTextBlocks.forEach(($textBlock) => {
    let text = $textBlock.innerText
    while (text.includes(searchVal)) {
      const replacedText = text.replace(searchVal, replaceTo)
      const $leaf = getFirstLeaf($textBlock)
      replaceAllInBlock($leaf, replacedText) // TODO 本当は毎回の置換前に確認したい
      text = $textBlock.innerText
    }
  })
}

customElements.define('search-window', SearchWindow)
const $searchWindow = document.createElement('search-window')
$searchWindow.addEventListener('submit', (e) => {
  const { searchVal, replaceTo } = (e as any).detail
  replaceText(searchVal, replaceTo)
})
document.body.append($searchWindow)
