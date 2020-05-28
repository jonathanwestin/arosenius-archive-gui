# The Ivar Arosenius archive frontend

Here is the source code for the Ivar Arosenius online archive (http://aroseniusarkivet.org).
The system consists of a React.js frontend, Express.js API that connects to Elasticsearch and a Backbone.js administration system.

The archive connects to an API which source code can be found here: https://github.com/CDH-DevTeam/arosenius-api

Here is an administration system for the archives data: https://github.com/CDH-DevTeam/arosenius-admin

The admin system uses the API to connect to Elasticsearch and add/update data.

## Getting started

To build the archive from the source code, first clone the repository or fork it to your own repository. Then install all JS dependencies and start `gulp` to build it.
Node 11 or _lower_ is required (12 will not work).

```
git clone https://github.com/CDH-DevTeam/arosenius-archive-gui.git
cd arosenius-archive-gui
npm install
# Create scripts/config.js (see below)
npm run dev
# Visit www/index.html in a web browser
```

## Config file

The `scripts/config.js` file must include some configuration needed to run the archive.

```javascript
export default {
	apiUrl: '[url]', // link to the projects API
	imageUrl: '[api url]/images/', // link to the base image folder of the projects API

	adminUrl: '[url]', // link to the projects Administration system

	endpoints: { // API endpoints for various datatypes
		documents: 'documents',
		document: 'document/',
		autocomplete: 'autocomplete',

		tags: 'tags',
		persons: 'persons',
		places: 'places',
		genres: 'genres',
		museums: 'museums',
		types: 'types',
		year_range: 'year_range',
		tag_cloud: 'tags/cloud',

		colormap: 'colormap'
	}
};
```

## File structure

Gulp outputs `www/scripts/app.js` and `www/css/style.css`. The site entry point is `www/index.html`; open it directly in a web browser or serve it with Nginx or similar.

When using `npm run dev`, the build process keeps watching source files and rebuilds instantly on changes.

When done, run `npm run deploy` before committing.

The `www` directory also contains some static HTML and images, as well as data generated by [arosenius-nearest-neighbors](https://github.com/CDH-DevTeam/arosenius-nearest-neighbors).
