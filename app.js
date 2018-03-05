/**
 * UI Components
 */
const app = document.getElementById("app");
const modal = document.getElementById("modal");
const url = 'https://api.unsplash.com/photos?page=1&per_page=20&client_id=2af528ddceed2cfff8cf179322cd972ff6c54e772e471193cdbfc628d801dacd'

/**
 * State
 */
let state = {
	selectedPhoto: false,
	photos: []
};

/**
 * [fetchData description]
 * @param  {[type]} endpoint [description]
 * @return {[type]}          [description]
 */
function fetchData(endpoint) {
	const p = new Promise((resolve, reject) => {
		const options = { 
			method: 'GET',
		};
		fetch(endpoint, options).then((response) => {
		  if( 200 !== response.status ) {
		    reject('Error')
		  }
		  return response.json()
		}).then((json) => {
		  resolve(json)
		})
	})
	return p
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
    var classes = el.className.split(" ");
    var existingIndex = classes.indexOf(className);

    if (existingIndex >= 0) classes.splice(existingIndex, 1);
    else classes.push(className);

    el.className = classes.join(" ");
  }
}

/**
 * [renderPhoto description]
 * @param  {[type]} photo [description]
 * @return {[type]}       [description]
 */
function renderPhoto(photo) {
	return `<img id="${ photo.id }" class="image col col-3" src="${ photo.urls.small }" />`
}

/**
 * [renderModal description]
 * @param  {[type]} state [description]
 * @return {[type]}       [description]
 */
function renderModal( state ) {
	const { selectedPhoto, photos } = state;
	let currentPhoto = false;

	photos.map(photo => {
		if( selectedPhoto === photo.id ) {
			currentPhoto = photo
		}
	})
	if( currentPhoto ) {
		modal.innerHTML = renderPhoto(currentPhoto)
	}
}

/**
 * [render description]
 * @return {[type]} [description]
 */
function render(state) {
  let photos = state.photos.map(photo => renderPhoto(photo))
  app.innerHTML = ['<div class="container">', ...photos, '</div>' ].join('');
}

/**
 * [boot description]
 * @return {[type]} [description]
 */
function boot() {
	const images = document.querySelectorAll('.image');
	for (var i = 0; i < images.length; i++) {
		images[i].addEventListener('click', (e) => {
			state = Object.assign(state, { selectedPhoto: e.target.id })
			toggleClass(modal, 'modal--active')
			renderModal(state)
		})
	}
}

/**
 * Fetch the Initial data, and render the app
 */
document.addEventListener("DOMContentLoaded", () => {
	fetchData(url).then((res) => {
  	state = Object.assign(state, { photos: res })
  	render(state)
  	boot()
  })
});