const $showSearchBoxInput = document.getElementById('show-search-box-input')

$showSearchBoxInput.addEventListener('input', (e) => {
  const showSearchBox = e.target.checked

  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { showSearchBox })
  })
})
