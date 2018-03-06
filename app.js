/**
 * UI Components
 */
const app = document.getElementById("app");

/**
 * Kick off the app
 */
document.addEventListener("DOMContentLoaded", () => {
  let params = {
    page: 4,
    per_page: 24,
    client_id:
      "ec4779e6804bf4e4c72ac5f5d70a81480712b24f2ecfe46494169d9b74ee9f83"
  };
  let url = "https://api.unsplash.com/photos";
  fetchData(url + queryString(params), "photos").then(res => {
    state = setState({ photos: res });
    render(state);
  });
});

/**
 * State
 */
let state = {
  selectedPhoto: false,
  photos: []
};

/**
 * [setState description]
 * @param {[type]} nextState [description]
 */
function setState(nextState) {
  state = Object.assign(state, nextState);
  return state;
}

/**
 * [fetchData description]
 * @param  {[type]} endpoint [description]
 * @return {[type]}          [description]
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
 * [findPhotoById description]
 * @param  {[type]} id    [description]
 * @param  {[type]} state [description]
 * @return {[type]}       [description]
 */
function findPhotoById( id, state ) {
	let match = false;
	state.photos.map((photo, idx) => {
		if( id === photo.id ) {
			match = {
				idx: idx,
				photo: photo
			}
		}
	})
	return match
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
 * [renderPhoto description]
 * @param  {[type]} photo [description]
 * @return {[type]}       [description]
 */
function renderPhoto(photo) {
  return `<img id="${photo.id}" class="image" src="${photo.urls.regular}" />`;
}

function renderModalControls(state) {
  return `<div class="modal__controls mb2 right-align">
						<a id="close" class="btn btn-outline rounded black mr2 left" href="#">Back</a>
						<a id="prev" class="btn btn-outline rounded black mr2" href="#">Prev</a>
						<a id="next" class="btn btn-outline rounded black " href="#">Next</a>			
					</div>`;
}

function cyclePhoto(state, direction = "next") {
  let { selectedPhoto, photos } = state;
  let currentPhoto = findPhotoById(selectedPhoto.id, state);
  let nextIndex = 'next' === direction ? currentPhoto.idx + 1 : currentPhoto.idx - 1;
  /**
   * @note, This logic seems to work, w/o conditional check for direction. 
   * Might need a bit of debugging
   * On First Photo, hit prev
   * On last photo, hit next
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
 * [getEndpoint description]
 * @return {[type]} [description]
 */
function queryString(params) {
  let query = Object.keys(params)
    .map(key => key + "=" + params[key])
    .join("&");
  return "?" + query;
}

/**
 * [renderModal description]
 * @param  {[type]} state [description]
 * @return {[type]}       [description]
 */
function renderModal(state) {
  const { selectedPhoto, photos } = state;
  return [
    `<div class="modal ${selectedPhoto ? "modal--active" : ""}">`,
    '<div id="overlay" class="modal__overlay"></div>',
    '<div class="modal__inner p2 bg-white rounded">',
    renderModalControls(),
    selectedPhoto ? renderPhoto(selectedPhoto) : "",
    "</div>",
    "</div>"
  ].join("");
}

/**
 * [render description]
 * @return {[type]} [description]
 */
function render(state) {
  let classNames = "image image-col col col-6 md-col md-col-3";
  let photos = state.photos.map(
    photo =>
      `<div id="${
        photo.id
      }" class="${classNames}" style="background-image:url(${
        photo.urls.regular
      })"></div>`
  );
  app.innerHTML = [renderModal(state), ...photos].join("");
  addListeners();
}

/**
 * [addListeners description]
 * @return {[type]} [description]
 */
function addListeners() {
  const images = document.querySelectorAll(".image");

  for (var i = 0; i < images.length; i++) {
    images[i].addEventListener("click", e => {
      toggleClass(document.body, "no-scroll");
      let photo = findPhotoById(e.target.id, state);
      setState({ selectedPhoto: photo.photo });
      render(state);
    });
  }

	document.getElementById("overlay").addEventListener("click", close);
  document.getElementById("close").addEventListener("click", close);
  document.getElementById("next").addEventListener("click", next);
  document.getElementById("prev").addEventListener("click", prev);

  document.body.addEventListener("keydown", e => {
    switch (e.keyCode) {
      case 39:
        next(e);
        break;
      case 37:
        prev(e);
        break;
    }
  });
}

function close(e) {
	e.preventDefault();
	toggleClass(document.body, "no-scroll");
	setState({ selectedPhoto: false });
	render(state);
}

/**
 * [next description]
 * @param  {[type]}   e [description]
 * @return {Function}   [description]
 */
function next(e) {
  e.preventDefault();
  cyclePhoto(state, "next");
  render(state);
}
/**
 * [prev description]
 * @param  {[type]} e [description]
 * @return {[type]}   [description]
 */
function prev(e) {
  e.preventDefault();
  cyclePhoto(state, "prev");
  render(state);
}