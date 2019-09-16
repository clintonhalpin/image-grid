/**
 * Selectors
 */
const app = document.getElementById("app");

/**
 * State
 */
let state = {};
const initialState = {
  page: 1,
  loading: false,
  selectedPhoto: false,
  photos: []
};

/**
 * Api
 */
const API_BASE = "https://api.unsplash.com/photos";
const params = {
  page: initialState.page,
  per_page: 24,
  client_id: "ec4779e6804bf4e4c72ac5f5d70a81480712b24f2ecfe46494169d9b74ee9f83"
};

/**
 * Listen for Document, to be ready and boot the app up!
 */
document.addEventListener("DOMContentLoaded", boot);

function boot() {
  /**
   * Set state, do first render
   */
  setState(initialState);
  render(state);

  /**
   * Fetch Data from API, render app again
   */
  const endpoint = API_BASE + queryString(params);
  fetchData(endpoint).then(response => {
    const formattedResponse = formatResponse(response, "unsplash");
    setState({ photos: formattedResponse });
    render(state);
  });
}

/**
 * Utility functions
 */

/**
 * [formatResponse Not much to see here, we could easily implement other providers with this pattern]
 * @param  {array}  response [description]
 * @param  {string} provider [unsplash]
 * @return {array}          [description]
 */
function formatResponse(response, provider) {
  if ("unsplash" === provider) {
    return response.map(photo => ({
      id: photo.id,
      color: photo.color,
      urls: photo.urls,
      links: photo.links,
      user: photo.user,
      created_at: photo.created_at
    }));
  }
  return response;
}

/**
 * [queryString description]
 * @return {[type]} [description]
 */
function queryString(params) {
  let query = Object.keys(params)
    .map(key => key + "=" + params[key])
    .join("&");
  return "?" + query;
}

/**
 * [setState description]
 * @param {object} nextState [description]
 */
function setState(nextState) {
  state = Object.assign(state, nextState);
  return state;
}

/**
 * [toggleClass from http://youmightnotneedjquery.com/]
 * @param  {DOM} el []
 * @return {sideeffect}    []
 */
function toggleClass(el, className) {
  if (el.classList) {
    el.classList.toggle(className);
  } else {
    let classes = el.className.split(" ");
    let existingIndex = classes.indexOf(className);
    if (existingIndex >= 0) {
      classes.splice(existingIndex, 1);
    } else {
      classes.push(className);
    }
    el.className = classes.join(" ");
  }
}

/**
 * [findById description]
 * @param  {any} id  [In the case of unsplash we use strings, but it could be an int]
 * @param  {array} arr [description]
 * @return {false|object}     [description]
 */
function findById(id, arr) {
  let match = false;
  arr.map((item, idx) => {
    if (id === item.id) {
      match = {
        idx,
        item
      };
    }
  });
  return match;
}

/**
 * Core functionality
 */

/**
 * [fetchData Fetch data, and cache it in localStorage]
 * @param  {string} endpoint  [https://api.image.com/featured]
 * @return {promise}          [description]
 */
function fetchData(endpoint) {
  const cache = localStorage.getItem(endpoint);
  return new Promise((resolve, reject) => {
    const options = {
      method: "GET"
    };
    if (cache) {
      resolve(JSON.parse(cache));
    } else {
      fetch(endpoint, options)
        .then(response => {
          if (200 !== response.status) {
            reject("Error");
          }
          return response.json();
        })
        .then(json => {
          localStorage.setItem(endpoint, JSON.stringify(json));
          resolve(json);
        });
    }
  });
}

/**
 * [changePhoto description]
 * @param  {[type]} state     [description]
 * @param  {[type]} direction [description]
 * @return {[type]}           [description]
 */
function changePhoto(state, direction = "next") {
  let { selectedPhoto, photos } = state;
  let currentPhoto = findById(selectedPhoto.id, state.photos);
  let nextIndex =
    "next" === direction ? currentPhoto.idx + 1 : currentPhoto.idx - 1;
  /**
   * @note, This logic seems to work, w/o conditional check for direction.
   * Might need a bit of debugging
   */
  if (nextIndex >= photos.length) {
    nextIndex = 0;
  }
  if (-1 === nextIndex) {
    nextIndex = photos.length - 1;
  }
  setState({ selectedPhoto: state.photos[nextIndex] });
}

/**
 * [addEventListeners Once render completes, we will want to hook up event listeners]
 */
function addEventListeners() {
  const images = document.querySelectorAll(".image");
  if (images.length) {
    for (var i = 0; i < images.length; i++) {
      images[i].addEventListener("click", e => {
        toggleClass(document.body, "no-scroll");
        setState({ selectedPhoto: findById(e.target.id, state.photos).item });
        render(state);
      });
    }
  }

  const overlay = document.getElementById("overlay");
  const closeBtn = document.getElementById("close");
  const nextBtn = document.getElementById("next");
  const prevBtn = document.getElementById("prev");
  const loadBtn = document.getElementById("load");

  if (overlay) {
    overlay.addEventListener("click", close);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", close);
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", next);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", prev);
  }

  if (loadBtn) {
    loadBtn.addEventListener("click", load);
  }
}

/**
 * [next Change to the next photo]
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function close(e) {
  e.preventDefault();
  toggleClass(document.body, "no-scroll");
  setState({ selectedPhoto: false });
  render(state);
}

/**
 * [next Change to the next photo]
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function next(e) {
  e.preventDefault();
  changePhoto(state);
  render(state);
}

/**
 * [prev, Previous Photo]
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function prev(e) {
  e.preventDefault();
  changePhoto(state, "prev");
  render(state);
}

/**
 * [load Load more data from unsplash]
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function load(e) {
  e.preventDefault();
  setState({ loading: true, page: state.page + 1 });
  params.page = state.page;
  let endpoint = API_BASE + queryString(params);

  fetchData(endpoint).then(response => {
    let formattedResponse = formatResponse(response, "unsplash");
    setState({
      loading: false,
      photos: [...state.photos, ...formattedResponse]
    });
    render(state);
  });
}

/**
 * Render Methods
 */

/**
 * [renderModalControls description]
 * @param  {[type]} state [description]
 * @return {[type]}       [description]
 */
function renderModalControls(state) {
  return `
		<div class="modal__controls mb2 right-align">
			<a id="close" class="btn btn-outline rounded black mr2 left" href="#" style="font-size: 24px">&times;</a>
			<a id="prev" class="btn btn-outline rounded black" href="#">Prev</a>
			<a id="next" class="btn btn-outline rounded black " href="#">Next</a>			
		</div>
	`;
}

/**
 * [renderModalPhoto description]
 * @param  {[type]} state [description]
 * @return {[type]}       [description]
 */
function renderModalPhoto(state) {
  const { selectedPhoto } = state;
  if (!selectedPhoto) {
    return "";
  }
  const photoDate = new Date(selectedPhoto.created_at);
  return `
  	<div>
	  	<div class="md-col md-col-9 center">
		  	<a class="center" href="${selectedPhoto.links.download}">
				<img 
					id="${selectedPhoto.id}" 
					class="image--modal" 
					src="${selectedPhoto.urls.regular}"
					alt="Photo"
				/>
				</a>
			</div>
			<div class="md-col md-col-3">
				<div class="border p2 rounded bg-light-gray">
					<p class="m0">
						<a href="${selectedPhoto.user.links.html}">${selectedPhoto.user.name}</a>
					</p>
					<p class="m0 h6 gray">${photoDate.toLocaleDateString()}, ${photoDate.toLocaleTimeString()}</p>
					<input class="field col-12 mt1" type="text" value="${
            selectedPhoto.links.html
          }" />
				</div>
			</div>
		</div>
	`;
}

/**
 * [renderModal renders the modal component]
 * @param  {object} state [description]
 * @return {string}       [description]
 */
function renderModal(state) {
  const { selectedPhoto } = state;
  return `
		<div class="modal ${selectedPhoto ? "modal--active" : ""}">
			<div id="overlay" class="modal__overlay"></div>
			<div class="modal__inner p2 bg-white rounded">
				${renderModalControls(state)}
				${renderModalPhoto(state)}
			</div>
		</div>
	`;
}

/**
 * [renderPhotos description]
 * @param  {object} state [description]
 * @return {string}       [description]
 */
function renderPhotos(state) {
  if (state.photos.length === 0) {
    return '<h1 class="center py4">Loading...</h1>';
  }

  let classNames = "image image-col col col-6 md-col md-col-3";
  let photos = state.photos.map(
    photo => `
      <div 
      	id="${photo.id}" 
      	class="${classNames}" 
      	tabindex="0"
      	style="
      		background-image:url(${photo.urls.small}); 
      		background-color: ${photo.color}
      	"></div>
    `
  );
  return ['<div class="clearfix">', ...photos, "</div>"].join("");
}

function renderLoader(state) {
  let btn = `<a id="load" href="#" class="btn btn-primary col-12 bg-black center">Load More</a>`;
  if (state.photos.length === 0) {
    return "";
  }
  return `
		<div class="container clearfix p2">
			${btn}
		</div>
	`;
}

/**
 * [renderHeader description]
 * @param  {object} state [description]
 * @return {string}       [description]
 */
function renderHeader(state) {
  return `
		<div class="py3 px2">
			<ul class="list-reset">
				<li class="blue inline-block mr2">unsplash</li>
			</ul>
			<h1 class="black line-height-1 m0">
				recent photos
			</h1>
		</div>
	`;
}

/**
 * [render Main render function, similar to react]
 * @param  {object} state [the application state]
 * @return {side-effect}  [Could return a string but for simplicity just append to app]
 */
function render(state) {
  app.innerHTML = [
    renderHeader(state),
    renderModal(state),
    renderPhotos(state),
    renderLoader(state)
  ].join("");
  addEventListeners();
}
