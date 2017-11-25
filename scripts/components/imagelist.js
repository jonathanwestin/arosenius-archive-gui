import React from 'react';
import 'whatwg-fetch';
import _ from 'underscore';
import Masonry  from 'react-masonry-component';

import ImageListCollection from '../collections/ImageListCollection';
import ImageListItem from './ImageListItem';
import DateLabelListItem from './DateLabelListItem';

import WindowScroll from './../utils/window-scroll';

export default class ImageList extends React.Component {
	constructor(props) {
		super(props);

		window.imageList = this;

		this.imageLoadedHandler = this.imageLoadedHandler.bind(this);
		this.windowScrollHandler = this.windowScrollHandler.bind(this);

		this.state = {
			images: [],
			loading: false,
			initialized: false,
			columns: false,
			waitingForLoad: false,
			relativeSizes: false
		};

		this.collection = new ImageListCollection(function(event) {
			setTimeout(function() {
				this.waitingForLoad = false;
			}.bind(this), 500);

			var imageArray = [];

			if (event.append) {
				var appendImageArray = _.filter(event.data.documents, function(document) {
					return (document.image && document.image != '') || (document.images && document.images.length > 0 && document.images[0].image != '');
				});

				imageArray = this.state.images.concat(appendImageArray);
			}
			else {
				imageArray = _.filter(event.data.documents, function(document) {
					return (document.image && document.image != '') || (document.images && document.images.length > 0 && document.images[0].image != '');
				});
			}
			this.setState({
				images: imageArray,
				total: event.data.total,
				loading: false
			});
		}.bind(this), function(event) {
			this.setState({
				loading: false
			});
		}.bind(this));
	}

	componentDidMount() {
		if (this.props.enableAutoLoad || this.props.lazyLoad) {
			setTimeout(function() {
				window.addEventListener('scroll', this.windowScrollHandler);
			}.bind(this), 500);
		}
		
		if (!this.props.lazyLoad) {
			this.handleProps(this.props);
		}
	}

	componentWillUnmount() {
		if (this.props.enableAutoLoad || this.props.lazyLoad) {
			window.removeEventListener('scroll', this.windowScrollHandler);
		}
	}

	isInViewport(el) {
		var rect = el.getBoundingClientRect();

		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
			rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
		);
	}

	windowScrollHandler() {
		if (this.props.enableAutoLoad) {
			if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight-50) {
				this.appendPage();
			}
		}

		if (this.props.lazyLoad && this.refs.container) {
			if (this.isInViewport(this.refs.container) && this.state.images.length == 0) {
				setTimeout(function() {
					if (this.isInViewport(this.refs.container) && this.state.images.length == 0) {
						this.handleProps(this.props);
					}
				}.bind(this), 500);
			}
		}
	}

	componentWillReceiveProps(props) {
		if (!this.props.lazyLoad || this.isInViewport(this.refs.container)) {
			this.handleProps(props);
		}
	}

	handleProps(props) {
		if (props.related && props.relatedValue) {
			if (props.related == 'person') {
				this.collection.fetch({
					person: props.relatedValue
				}, props.count, 1, false, props.archiveMaterial || null);
			}
			if (props.related == 'place') {
				this.collection.fetch({
					place: props.relatedValue
				}, props.count, 1, false, props.archiveMaterial || null);
			}
			if (props.related == 'museum') {
				this.collection.fetch({
					museum: props.relatedValue
				}, props.count, 1, false, props.archiveMaterial || null);
			}
			if (props.related == 'genre') {
				this.collection.fetch({
					genre: props.relatedValue
				}, props.count, 1, false, props.archiveMaterial || null);
			}
			if (props.related == 'tag') {
				this.collection.fetch({
					tags: props.relatedValue
				}, props.count, 1, false, props.archiveMaterial || null);
			}
		}
		else if (!props.year && !props.searchString && !props.searchPerson && !props.searchPlace && !props.searchMuseum && !props.searchGenre && !props.searchTags && !props.searchType && !props.searchHue && !props.searchSaturation && this.state.images.length == 0) {
			this.waitingForLoad = true;

			this.collection.fetch(null, props.count, 1, false, props.archiveMaterial || null);
		}
		else if (this.props.searchString != props.searchString || 
			this.props.searchPerson != props.searchPerson || 
			this.props.searchPlace != props.searchPlace || 
			this.props.searchMuseum != props.searchMuseum ||
			this.props.searchGenre != props.searchGenre ||
			this.props.searchTags != props.searchTags ||
			this.props.searchType != props.searchType ||
			this.props.searchHue != props.searchHue ||
			this.props.year != props.year ||
			
			this.props.searchSaturation != props.searchSaturation ||

			this.state.images.length == 0
		) {
			this.waitingForLoad = true;

			this.setState({
				loading: true
			});

			this.collection.fetch({
				searchString: props.searchString, 
				person: props.searchPerson, 
				place: props.searchPlace, 
				museum: props.searchMuseum, 
				genre: props.searchGenre, 
				tags: props.searchTags,
				type: props.searchType, 
				hue: props.searchHue, 
				saturation: props.searchSaturation,
				year: props.year
			}, props.count, 1, false, props.archiveMaterial || null);

			if ((props.searchString || props.searchPerson || props.searchPlace || props.searchMuseum || props.searchGenre || props.searchTags || props.searchType || props.searchHue || props.searchSaturation) && !this.props.lazyLoad) {
				var windowScroll = new WindowScroll();
				windowScroll.scrollToY(windowScroll.getOffsetTop(this.refs.container)-250, 1000, 'easeInOutSine');
			}
		}
	}

	appendPage() {
		if (!this.waitingForLoad) {
			this.waitingForLoad = true;

			this.collection.fetch({
				searchString: this.props.searchString, 
				person: this.props.searchPerson, 
				place: this.props.searchPlace, 
				museum: this.props.searchMuseum, 
				genre: this.props.searchGenre, 
				tags: this.props.searchTags,
				type: this.props.searchType, 
				hue: this.props.searchHue, 
				saturation: this.props.searchSaturation
			}, this.props.count, this.collection.currentPage+1, true);
		}
	}

	imageLoadedHandler() {
		setTimeout(function() {
			if (!this.state.initialized) {
				this.setState({
					initialized: true
				});
			}
		}.bind(this), 200);
	}

	render() {
		var maxWidth = _.max(_.map(this.state.images, function(image) {
			return image && image.size && image.size.inner ? image.size.inner.width : 0;
		}));

		var items = _.map(this.state.images, function(image, index) {
			if (this.props.listType == 'date-labels') {
				return <DateLabelListItem key={image.id} image={image} index={index} />;
			}
			else {
				return <ImageListItem 
					key={image.id} 
					image={image} 
					index={index} 
					relativeSize={this.state.relativeSizes} 
					maxWidth={maxWidth} />;
			}
		}.bind(this));

		console.log(maxWidth);

		if (items.length == 0) {
			items.push(<h2 key="no-results" className="no-results">Inga sökträffar</h2>)
		}
		else if (this.props.listType != 'date-labels') {
			items.push(<div key="grid-sizer" className="grid-sizer"/>);
		}

		var listElement;
		if (this.props.listType == 'date-labels') {
			listElement = <div className="image-label-list">
				{items}
			</div>;
		}
		else {
			listElement = <Masonry
				className={'grid'+(this.state.initialized ? ' initialized' : '')} // default ''
				options={masonryOptions} // default {}
				disableImagesLoaded={false} // default false
				updateOnEachImageLoad={true} // default false and works only if disableImagesLoaded is false
				onImagesLoaded={this.imageLoadedHandler}
				>
				{items}
			</Masonry>
		}

		var masonryOptions = {
			columnWidth: '.grid-sizer',
			percentPosition: true,
			transitionDuration: 0
		};

		if (this.props.columns || this.state.columns) {
			return <div className="grid grid-columns initialized">
				{items}
			</div>;
		}
		else {
			return <div ref="container" data-title={this.props.title} className={'image-list'+(this.state.loading ? ' loading' : '')} style={this.state.images.length < 2 && this.props.related ? {display: 'none'} : null}>
				<div>
					{
						this.props.title && this.state.images.length > 0 &&
						<h3>{this.props.title}</h3>
					}
					{
						this.props.related && this.state.total > this.state.images.length &&
						<a className="view-more-link" href={'#/search/tags/'+this.props.related+'/'+this.props.relatedValue}>Visa alla</a>
					}
				</div>

				<div style={{position: 'absolute', top: 20, right: 20, zIndex: 60}}>
					<button style={{width: 30, height: 30, borderRadius: 30, padding: 0, lineHeight: '30px', backgroundColor: '#fff'}} 
						onClick={function() {this.setState({relativeSizes: !this.state.relativeSizes})}.bind(this)}>r</button>
				</div>

				{
					listElement
				}
				

				<div className="loading-overlay" />
			</div>;
		}
	}
}