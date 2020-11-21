// Zoom constants. Define Max, Min, increment and default values
const ZOOM_INCREMENT = 0.2;
const MAX_ZOOM = 3;
const MIN_ZOOM = 0.3;
const DEFAULT_ZOOM = 1;
const MIN_CHAR_LIMIT = 2;

let currentTabList = [];
let filteredCurrentTabList = [];
let tabsList = document.getElementById('tabs-list');
let filteredTabsList = document.getElementById('search-results');
let searchInput = document.getElementById('search');

function firstUnpinnedTab(tabs) {
  for (var tab of tabs) {
    if (!tab.pinned) {
      return tab.index;
    }
  }
}

function clearSearchResults() {
  searchInput.value = "";
  filteredTabsList.textContent = '';
}

function createTabLink(tab) {
  let tabLink = document.createElement('a');
  let tabLinkImage = document.createElement('img');
  tabLinkImage.classList.add("favicon");
  tabLinkImage.height = "16";
  tabLinkImage.width = "16";
  
  let newtext = document.createTextNode(tab.title || tab.id);
  
  tabLinkImage.src = tab.favIconUrl;

  tabLink.classList.add('switch-tabs');
  tabLink.appendChild(tabLinkImage);
  tabLink.appendChild(newtext);

  tabLink.setAttribute('href', tab.id);
  return tabLink;
}
 
/**
 * listTabs to switch to
 */
function listTabs() {
  getCurrentWindowTabs().then((tabs) => {
    
    let currentTabs = document.createDocumentFragment();

    tabsList.textContent = '';

    for (let tab of tabs) {
      if (tab.pinned) {
        let tabLink = createTabLink(tab);        
        currentTabList.push(tab);
        currentTabs.appendChild(tabLink);
      }
    }

    tabsList.appendChild(currentTabs);
  });
}

function showSearchResults() {
  if (filteredCurrentTabList.length > 0) {
    filteredTabsList.textContent = '';
    let filteredCurrentTabs = document.createDocumentFragment();
    
    for (let tab of filteredCurrentTabList) {
        let tabLink = createTabLink(tab);
      
      filteredCurrentTabs.appendChild(tabLink);
    }
    filteredTabsList.appendChild(filteredCurrentTabs);
  }
}

document.addEventListener("DOMContentLoaded", listTabs);

function getCurrentWindowTabs() {
  return browser.tabs.query({currentWindow: true});
}


document.addEventListener('input', e => {
  if (e.target.id === "search") {
    if (e.target.value) {
      if (e.target.value.length > MIN_CHAR_LIMIT) {      
        filteredCurrentTabList = currentTabList.filter(t => !!t.title || !! t.url ? ( t.title.toLowerCase().indexOf(e.target.value) !== -1 ) ? true : (t.url.toLowerCase().indexOf(e.target.value) !== -1  ? true : false) : false)
        showSearchResults();
      } else if (e.target.value.length === 0) {
        clearSearchResults();
      }
    }
  }
});

document.addEventListener('change', e => {
  if (e.target.id === "search") {
    if (e.target.value) {
      if (e.target.value.length === 0) {
        clearSearchResults();
      }
    }
  }
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains('switch-tabs')) {
    var tabId = +e.target.getAttribute('href');

    browser.tabs.query({
      currentWindow: true
    }).then((tabs) => {
      for (var tab of tabs) {
        if (tab.id === tabId) {
          browser.tabs.update(tabId, {
              active: true
          });
        }
      }
    });
  }

  if (e.target.classList.contains('clear-results')) {
    clearSearchResults();
  }

  e.preventDefault();
});

//onRemoved listener. fired when tab is removed
browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log(`The tab with id: ${tabId}, is closing`);

  if(removeInfo.isWindowClosing) {
    console.log(`Its window is also closing.`);
  } else {
    console.log(`Its window is not closing`);
  }
});

//onMoved listener. fired when tab is moved into the same window
browser.tabs.onMoved.addListener((tabId, moveInfo) => {
  var startIndex = moveInfo.fromIndex;
  var endIndex = moveInfo.toIndex;
  console.log(`Tab with id: ${tabId} moved from index: ${startIndex} to index: ${endIndex}`);
});
