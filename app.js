/**
 * Selectors
 */
const app = document.getElementById("app");


/**
 * State
 */
let state = {};
let initialState = {
  selectedPhoto: false,
  photos: []
};
let API_BASE = "https://api.unsplash.com/photos";

/**
 * Boot the App
 */
document.addEventListener("DOMContentLoaded", boot);

/**
 * [boot Start the application]
 * @return {side-effect} [description]
 */
function boot() {
	setState(initialState)
	render(state);
	const params = {
    page: 4,
    per_page: 24,
    client_id:
      "ec4779e6804bf4e4c72ac5f5d70a81480712b24f2ecfe46494169d9b74ee9f83"
	};
	fetchData(API_BASE + queryString(params)).then(response => {
		setState(initialState);
		setState({ photos : response });
		render(state);
	})
}

/**
 * Utility functions
 */

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
function findById( id, arr ) {
	let match = false;
	arr.map((item, idx) => {
		if( id === item.id ) {
			match = {
				idx,
				item
			}
		}
	})
	return match
}

/**
 * Core functionality
 */

/**
 * [fetchData Fetch data, and cache it locally]
 * @param  {string} endpoint [description]
 * @return {promise}          [description]
 */
function fetchData( endpoint ) {
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
function changePhoto(state, direction) {
  let { selectedPhoto, photos } = state;
  let currentPhoto = findById(selectedPhoto.id, state.photos);
  let nextIndex = 'next' === direction ? currentPhoto.idx + 1 : currentPhoto.idx - 1;
  /**
   * @note, This logic seems to work, w/o conditional check for direction. 
   * Might need a bit of debugging
   */
  if( nextIndex >= photos.length ) {
  	nextIndex = 0;
  }
  if( -1 === nextIndex) {
  	nextIndex = photos.length - 1;
  }
  setState({ selectedPhoto : state.photos[ nextIndex ] })	
}

/**
 * [addEventListeners Once render completes, we will want to hook up event listeners]
 */
function addEventListeners(){

  const images = document.querySelectorAll(".image");
  if( images.length ) {
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

  if( overlay ) {
		overlay.addEventListener("click", close);
	}

	if( closeBtn ) {
		closeBtn.addEventListener("click", close);
	}

	if( nextBtn ) {
		nextBtn.addEventListener("click", next);
	}

	if( prevBtn ) {
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
			<a id="close" class="btn btn-outline rounded black mr2 left" href="#">Back</a>
			<a id="prev" class="btn btn-outline rounded black mr2" href="#">Prev</a>
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
	if( ! selectedPhoto ) {
		return '';
	}
	console.log(selectedPhoto);
	return `
		<img id="${selectedPhoto.id}" class="image" src="${selectedPhoto.urls.regular}" />
	`
}

/**
 * [renderModal renders the modal component]
 * @param  {object} state [description]
 * @return {string}       [description]
 */
function renderModal(state){
	const { selectedPhoto } = state;
	return `
		<div class="modal ${ selectedPhoto ? "modal--active" : "" }">
			<div id="overlay" class="modal__overlay"></div>
			<div class="modal__inner p2 bg-white rounded">
				${ renderModalControls(state) }
				${ renderModalPhoto(state) }
			</div>
		</div>
	`;
} 

/**
 * [renderPhotos description]
 * @param  {object} state [description]
 * @return {string}       [description]
 */
function renderPhotos(state){

	if( ! state.photos) {
		return '<h1 class="center">Loading...</h1>';
	}

	let classNames = "image image-col col col-6 md-col md-col-3";
	let photos = state.photos.map(
    photo =>
      `<div id="${
        photo.id
      }" class="${classNames}" style="background-image:url(${
        photo.urls.regular
      })"></div>`
  );
	return photos.join('');
}

/**
 * [renderHeader description]
 * @param  {object} state [description]
 * @return {string}       [description]
 */
function renderHeader(state){
	return `
		<div class="py3 px2">
			<h1 class="black line-height-1 m0">all files ${state.photos ? '(' + state.photos.length + ')' : ''}</h1>
		</div>
	`
}

/**
 * [render Main render function, similar to react]
 * @param  {object} state [the application state]
 * @return {side-effect}  [Could return a string but for simplicity just append to app]
 */
function render(state) {
	app.innerHTML =  [
		renderHeader(state),
		renderModal(state),
		renderPhotos(state)
	].join('');
	addEventListeners();
}