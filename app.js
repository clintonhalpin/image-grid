/**
 * UI Components
 */
const app = document.getElementById("app");
// const url = 'https://api.unsplash.com/photos?page=1&per_page=20&client_id=2af528ddceed2cfff8cf179322cd972ff6c54e772e471193cdbfc628d801dacd'
const url = 'https://api.unsplash.com/photos?page=3&per_page=24&client_id=ec4779e6804bf4e4c72ac5f5d70a81480712b24f2ecfe46494169d9b74ee9f83'

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
	const cache = localStorage.getItem(endpoint)
	const p = new Promise((resolve, reject) => {
		const options = { 
			method: 'GET',
		};

		if( cache ) {
			resolve(JSON.parse(cache))
		} else {
			fetch(endpoint, options).then((response) => {
			  if( 200 !== response.status ) {
			    reject('Error')
			  }
			  return response.json()
			}).then((json) => {
			  localStorage.setItem(endpoint, JSON.stringify(json))
			 	resolve(json)
			})
		}
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
	return `<img id="${ photo.id }" class="image" src="${ photo.urls.regular }" />`
}


function renderModalControls(state) {
	return `<div class="modal__controls p2 right-align">
						<a id="close" class="btn btn-outline rounded black mr2 left" href="#">Back</a>
						<a id="prev" class="btn rounded bg-white black mr2" href="#">Prev</a>
						<a id="next" class="btn rounded bg-white black mr2" href="#">Next</a>
					</div>`
}

function nextPhoto(state) {
	const { selectedPhoto, photos } = state;
	let selectedPhotoIdx = false;
	photos.map((idx, photo) => {
		if( selectedPhoto === photo.id ) {
			selectedPhotoIdx = idx
		}
	})
	if( selectedPhotoIdx ) {
		state = Object.assign(state, { selectedPhoto : photos[9].id })
		render(state)
	}
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
	return [
		`<div class="modal p2 ${ currentPhoto ? 'modal--active' : ''}">`, 
		'<div class="modal__inner p2 bg-white rounded">',
		renderModalControls(), 
		currentPhoto ? renderPhoto(currentPhoto) : '', 
		'</div>',
		'</div>'
	].join('')
}

/**
 * [render description]
 * @return {[type]} [description]
 */
function render(state) {
  let photos = state.photos.map(photo => `<div id="${photo.id}" class="image image-col col col-6 md-col md-col-3" style="background-image:url(${photo.urls.regular})"></div>`)
  app.innerHTML = [ renderModal(state), ...photos ].join('');
  addListeners()
}

/**
 * [addListeners description]
 * @return {[type]} [description]
 */
function addListeners() {
	
	const images = document.querySelectorAll('.image');

	for (var i = 0; i < images.length; i++) {
		images[i].addEventListener('click', (e) => {
			state = Object.assign(state, { selectedPhoto: e.target.id })
			render(state)
		})
	}

	document.getElementById("close").addEventListener('click', e => {
		state = Object.assign(state, { selectedPhoto: false })
		render(state)
	})

	document.getElementById("next").addEventListener('click', e => {
		nextPhoto(state)
	})

}

/**
 * Fetch the Initial data, and render the app
 */
document.addEventListener("DOMContentLoaded", () => {
	fetchData(url, 'photos').then((res) => {
		console.log(res)
  	state = Object.assign(state, { photos: res })
  	render(state)
  })
});