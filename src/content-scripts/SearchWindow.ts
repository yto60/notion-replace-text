import searchWindowStyles from './searchWindow.css'

export default class SearchWindow extends HTMLElement {
  constructor() {
    super()

    const shadow = this.attachShadow({ mode: 'open' })

    // wrapper
    const wrapper = document.createElement('div')
    wrapper.setAttribute('class', 'wrapper')

    // inputs
    const searchValInput = document.createElement('input')
    searchValInput.setAttribute('class', 'search-val-input')
    searchValInput.placeholder = '検索'
    searchValInput.addEventListener('keydown', inputKeydownHandler)
    const replaceToInput = document.createElement('input')
    replaceToInput.setAttribute('class', 'replace-to-input')
    replaceToInput.placeholder = '置換'
    replaceToInput.addEventListener('keydown', inputKeydownHandler)

    // buttons
    const replaceAllButton = document.createElement('button')
    replaceAllButton.setAttribute('class', 'replace-all-button')
    replaceAllButton.innerText = '一括置換'
    replaceAllButton.addEventListener('click', () => {
      this.fireSubmitEvent({
        searchVal: searchValInput.value,
        replaceTo: replaceToInput.value
      })
    })

    // styles
    const style = document.createElement('style')
    style.textContent = searchWindowStyles

    shadow.appendChild(style)
    shadow.appendChild(wrapper)
    wrapper.appendChild(searchValInput)
    wrapper.appendChild(replaceToInput)
    wrapper.appendChild(replaceAllButton)
  }

  fireSubmitEvent(detail: { searchVal: string; replaceTo: string }) {
    const event = new CustomEvent('submit', { detail })
    this.dispatchEvent(event)
  }
}

const inputKeydownHandler = (e: KeyboardEvent) => {
  e.stopPropagation()
}
