import searchWindowStyles from './searchWindow.scss'

export const REPLACE_ICON_URL =
  'https://api.iconify.design/codicon:replace-all.svg'
export const LOADING_ICON_URL =
  'https://api.iconify.design/eos-icons:three-dots-loading.svg'

export default class SearchWindow extends HTMLElement {
  private rendered = false
  private _replaceAllButton: HTMLButtonElement = document.createElement(
    'button'
  )
  private _replaceIcon: HTMLImageElement = document.createElement('img')

  connectedCallback() {
    if (this.rendered) {
      return
    }

    // wrapper
    const wrapper = document.createElement('div')
    wrapper.setAttribute('class', 'wrapper')

    // buttons
    this._replaceAllButton.setAttribute('class', 'replace-all-button')
    const submitHandler = () => {
      if (this.isLoading) {
        return
      }
      this.fireSubmitEvent({
        searchVal: searchValInput.value,
        replaceTo: replaceToInput.value
      })
    }
    this._replaceAllButton.addEventListener('click', submitHandler)
    this._replaceAllButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        submitHandler()
      }
    })
    this.setReplaceAllButtonStatus(false)

    // inputs
    const searchValInput = document.createElement('input')
    searchValInput.setAttribute('class', 'search-val-input')
    searchValInput.placeholder = 'Find'
    const replaceToInput = document.createElement('input')
    replaceToInput.setAttribute('class', 'replace-to-input')
    replaceToInput.placeholder = 'Replace'

    // styles
    const style = document.createElement('style')
    style.textContent = searchWindowStyles

    // Notion 側のページ内容を誤って変更してしまうことを避けるため、イベントの伝搬を止めておかないといけない
    this.preventEventPropagations()

    // initial render
    this.attachShadow({ mode: 'open' })
    this.shadowRoot!.appendChild(style)
    this.shadowRoot!.appendChild(wrapper)
    wrapper.appendChild(searchValInput)
    wrapper.appendChild(replaceToInput)
    wrapper.appendChild(this._replaceAllButton)
    this._replaceAllButton.appendChild(this._replaceIcon)

    this.rendered = true
  }

  render() {
    this.setReplaceAllButtonStatus(this.isLoading)
  }

  static get observedAttributes() {
    return ['loading']
  }

  attributeChangedCallback() {
    this.render()
  }

  get isLoading() {
    return this.getAttribute('loading') !== null
  }

  preventEventPropagations() {
    const eventNames: (keyof HTMLElementEventMap)[] = [
      'click',
      'keydown',
      'copy',
      'cut',
      'paste'
    ]
    eventNames.forEach((name) => {
      this.addEventListener(name, stopEventPropagation)
    })
  }

  setReplaceAllButtonStatus(isLoading: boolean): void {
    if (isLoading) {
      this._replaceAllButton.setAttribute('disabled', '')
    } else {
      this._replaceAllButton.removeAttribute('disabled')
    }
    const iconUrl = isLoading ? LOADING_ICON_URL : REPLACE_ICON_URL
    this._replaceIcon.setAttribute('src', iconUrl)
  }

  fireSubmitEvent(detail: { searchVal: string; replaceTo: string }): void {
    const event = new CustomEvent('submit', { detail })
    this.dispatchEvent(event)
  }
}

const stopEventPropagation = (e: Event) => {
  e.stopPropagation()
}
