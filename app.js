/**
 * Selectors
 */
const app = document.getElementById("app");

/**
 * State
 */
let API_BASE = "https://api.unsplash.com/photos";
let state = {};
let initialState = {
  selectedPhoto: false,
  photos: []
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
  const params = {
    page: 10,
    per_page: 24,
    client_id:
      "ec4779e6804bf4e4c72ac5f5d70a81480712b24f2ecfe46494169d9b74ee9f83"
  };
  const endpoint = API_BASE + queryString(params);

  fetchData(endpoint).then(response => {
  	const formattedResponse = formatResponse(response, 'unsplash');
    setState({ photos: formattedResponse });
    render(state);
  });
}

/**
 * Utility functions
 */

/**
 * [formatResponse transform API response]
 * @param  {[type]} response [description]
 * @param  {[type]} provider [description]
 * @return {[type]}          [description]
 */
function formatResponse(response, provider) {

	if( 'unsplash' === provider ) {
		return response.map(photo => {
			return {
				id: photo.id,
				color: photo.color,
				urls: photo.urls,
				links: photo.links,
				user: photo.user,
				created_at: photo.created_at
			}
		})
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
 * [queryString build a query string from object]
 * @return {string} [description]
 */
function queryString(params) {
  let query = Object.keys(params)
    .map(key => key + "=" + params[key])
    .join("&");
  return "?" + query;
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
 * [fetchData Fetch data, and cache it locally]
 * @param  {string} endpoint [description]
 * @return {promise}          [description]
 */
function fetchData(endpoint) {
  const cache = localStorage.getItem(endpoint);
  const p = new Promise((resolve, reject) => {
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
  return p;
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
 * [renderModalControls description]
 * @param  {[type]} state [description]
 * @return {[type]}       [description]
 */
function renderModalControls(state) {
  return `
		<div class="modal__controls mb2 right-align">
			<a id="close" class="btn btn-outline rounded black mr2 left" href="#">&times;</a>
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
  const photoDate = new Date(selectedPhoto.created_at)
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
			<div class="md-col md-col-3 px2">
				<div class="border p2 rounded bg-light-gray">
					<p class="m0">
						<a href="${selectedPhoto.user.links.html}">${selectedPhoto.user.name}</a>
					</p>
					<p class="m0 h6 gray">${ photoDate.toLocaleDateString() }, ${ photoDate.toLocaleTimeString() }</p>
					<input class="field col-12 mt1" type="text" value="${selectedPhoto.links.html}" />
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
  if (!state.photos) {
    return '<h1 class="center">Loading...</h1>';
  }

  let classNames = "image image-col col col-6 md-col md-col-3";
  let photos = state.photos.map(
    photo => `
      <div 
      	id="${photo.id}" 
      	class="${classNames}" 
      	style="
      		background-image:url(${photo.urls.regular}); 
      		background-color: ${photo.color}
      	"></div>
    `
  );
  return photos.join("");
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
				<li class="inline-block mr2">flikr</li>
			</ul>
			<h1 class="black line-height-1 m0">
				recent photos ${state.photos ? "(" + state.photos.length + ")" : ""}
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
    renderPhotos(state)
  ].join("");
  addEventListeners();
}
