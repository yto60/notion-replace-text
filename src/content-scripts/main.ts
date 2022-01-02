// polyfill for using web components in chrome extension (refs: https://stackoverflow.com/questions/30022350)
import '@webcomponents/custom-elements'

import SearchWindow from './searchWindow'

let $searchWindow: HTMLElement

function main() {
  customElements.define('search-window', SearchWindow)
  $searchWindow = document.createElement('search-window')
  $searchWindow.addEventListener('submit', (e: any) => {
    const { searchVal, replaceTo } = e.detail
    replaceText(searchVal, replaceTo)
  })
  document.body.append($searchWindow)
}

const wait = async (milliseconds: number) => {
  // eslint-disable-next-line promise/avoid-new
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

/** 要素の子孫を辿って、最初の葉を返す */
const getFirstLeaf = ($parent: HTMLElement): HTMLElement => {
  if ($parent.childElementCount > 0) {
    return getFirstLeaf($parent.children[0] as HTMLElement)
  }
  return $parent
}

const replaceTextInBlock = ($block: HTMLElement, replacedText: string) => {
  // TODO 脱 execCommand (https://stackoverflow.com/questions/60581285/execcommand-is-now-obsolete-whats-the-alternative)
  $block.focus()
  document.execCommand('selectAll')
  document.execCommand('delete')
  document.execCommand('insertText', false, replacedText)
}

const replaceText = async (searchVal: string, replaceTo: string) => {
  if (searchVal.length === 0 || replaceTo.length === 0) {
    return
  }
  if (!window.confirm('Replace All?')) {
    return
  }
  $searchWindow.setAttribute('loading', '')

  const notionTextBlocks = Array.prototype.slice.call(
    document.getElementsByClassName('notion-text-block')
  ) as HTMLElement[]
  if (notionTextBlocks.length === 0) {
    return
  }

  // ページ内の何かを click して focus してからでないと、 replaceText() で書き換えた内容が反映されない。
  // とりあえず notionTextBlocks の最初の要素を使う。(タイトルブロック等でも良い。)
  const firstBlock = getFirstLeaf(notionTextBlocks[0])
  firstBlock.click()
  firstBlock.focus()
  await wait(500) // 少し待つ必要がある

  notionTextBlocks.forEach(($textBlock) => {
    let text = $textBlock.innerText
    if (text.includes(searchVal)) {
      // TODO 本当は毎回の置換前に確認したい
      const replacedText = text.replaceAll(searchVal, replaceTo)
      const $leaf = getFirstLeaf($textBlock)
      replaceTextInBlock($leaf, replacedText)
      text = $textBlock.innerText
    }
  })
  $searchWindow.removeAttribute('loading')
}

main()
