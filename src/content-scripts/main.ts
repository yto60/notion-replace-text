// polyfill for using web components in chrome extension (refs: https://stackoverflow.com/questions/30022350)
import '@webcomponents/custom-elements'
import { getIsActive } from '../storage'

import SearchWindow from './searchWindow'

let $searchWindow: HTMLElement

async function main() {
  customElements.define('search-window', SearchWindow)
  $searchWindow = document.createElement('search-window')
  $searchWindow.addEventListener('submit', (e: any) => {
    const { searchVal, replaceTo } = e.detail
    replaceAll(searchVal, replaceTo)
  })
  document.body.append($searchWindow)
  applySearchBoxAppearance(false) // isActive=false の場合にページ表示後に一瞬チラつくのを防ぐため、一旦 hidden にしておく

  const isActive = await getIsActive()
  if (isActive) {
    // isActive=true の場合はここで表示される
    applySearchBoxAppearance(isActive)
  }

  chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    const { showSearchBox } = request
    applySearchBoxAppearance(showSearchBox)
  })
}

const wait = async (milliseconds: number) => {
  // eslint-disable-next-line promise/avoid-new
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

const applySearchBoxAppearance = (showSearchBox: boolean) => {
  if (!showSearchBox) {
    $searchWindow.setAttribute('hidden', 'true')
  } else {
    $searchWindow.removeAttribute('hidden')
  }
}

/** 要素の子孫を辿って、最初の contenteditable leaf を返す。見つからなければ null 。 */
const getFirstContentEditableLeaf = ($el: HTMLElement): HTMLElement | null => {
  if ($el.getAttribute('data-content-editable-leaf') === 'true') {
    return $el
  }
  if ($el.childElementCount > 0) {
    return getFirstContentEditableLeaf($el.children[0] as HTMLElement)
  }
  return null
}

const replaceTextInBlock = ($block: HTMLElement, replacedText: string) => {
  // TODO 脱 execCommand (https://stackoverflow.com/questions/60581285/execcommand-is-now-obsolete-whats-the-alternative)
  $block.focus()
  document.execCommand('selectAll')
  document.execCommand('delete')
  document.execCommand('insertText', false, replacedText)
}

const replaceAll = async (searchVal: string, replaceTo: string) => {
  if (searchVal.length === 0) {
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
  const firstBlock = getFirstContentEditableLeaf(notionTextBlocks[0])
  firstBlock!.click()
  firstBlock!.focus()
  await wait(500) // 少し待つ必要がある

  notionTextBlocks.forEach(($textBlock) => {
    const text = $textBlock.innerText
    if (text.includes(searchVal)) {
      // TODO 本当は毎回の置換前に確認したい
      const replacedText = text.replaceAll(searchVal, replaceTo)
      const $leaf = getFirstContentEditableLeaf($textBlock)
      if ($leaf !== null) {
        if ($leaf.childElementCount > 0) {
          // data-content-editable-leaf=true な要素の内側に更に要素が存在する場合、文字がデコレーションされている。
          // そのまま置換してしまうとデコレーションが消えるので、一旦何もせずにスキップする。
          // TODO デコレーションを残したまま置換できるようにする
        } else {
          replaceTextInBlock($leaf, replacedText)
        }
      }
    }
  })
  $searchWindow.removeAttribute('loading')
}

main()
