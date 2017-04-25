import React from 'react';
import 'whatwg-fetch';
import _ from 'underscore';

import ImageList from './ImageList';
import WindowScroll from './../utils/window-scroll';

export default class ImageDisplay extends React.Component {
	constructor(props) {
		super(props);

		this.toggleFullDisplay = this.toggleFullDisplay.bind(this);
		this.imageLoadedHandler = this.imageLoadedHandler.bind(this);
		this.windowScrollHandler = this.windowScrollHandler.bind(this);
		this.windowResizeHandler = this.windowResizeHandler.bind(this);
		this.hideUiClick = this.hideUiClick.bind(this);
		this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
		this.imageDisplayClickHandler = this.imageDisplayClickHandler.bind(this);

		this.state = {
			image: null,
			imageUrl: null,
			fullDisplay: false,
			fullDisplayImageUrl: null,
			fixedImageButtons: true,
			flipped: false,
			flippable: false
		};
	}

	fetchData() {
		fetch('http://cdh-vir-1.it.gu.se:8004/document/'+this.props.params.imageId)
			.then(function(response) {
				return response.json()
			}).then(function(json) {
				this.setState({
					image: json.data,
					imageUrl: '',
					flipped: false
				});

				setTimeout(function() {
					this.loadImage();
				}.bind(this), 50);
			}.bind(this)).catch(function(ex) {
				console.log('parsing failed', ex)
			})
		;
	}

	toggleFullDisplay() {
		this.setState({
			fullDisplay: !this.state.fullDisplay
		}, function() {
			if (this.state.fullDisplay && !this.state.fullDisplayImageUrl) {
				// load fullDisplayImage
			}
			setTimeout(function() {
				this.positionImageButtons();
			}.bind(this), 100);
		}.bind(this));
	}

	imageDisplayClickHandler() {
		if (this.state.image.images.length == 2) {
			this.setState({
				flipped: !this.state.flipped
			});
		}
	}

	windowScrollHandler() {
		this.positionImageButtons();
	}

	windowResizeHandler() {
		this.positionImageButtons();
	}

	hideUiClick() {
		document.body.classList.add('hide-ui');
	}

	mouseMoveHandler() {
		if (this.mouseIdleTimer) {
			clearTimeout(this.mouseIdleTimer);
		}
		this.mouseIdleTimer = setTimeout(this.mouseIdleHandler.bind(this), 2000);
	}

	mouseIdleHandler() {
		document.body.classList.add('hide-ui');
	}

	positionImageButtons() {
		if (this.refs.imageContainer) {		
			var imageContainerHeight = this.refs.imageContainer.clientHeight;
			var windowHeight = document.documentElement.clientHeight;
			var scrollPos = window.scrollY;

			if (imageContainerHeight+80 <= windowHeight) {
				this.setState({
					fixedImageButtons: false
				});
			}
			else if (imageContainerHeight < windowHeight+scrollPos-80) {
				this.setState({
					fixedImageButtons: false
				});
			}
			else {
				this.setState({
					fixedImageButtons: true
				});
			}
		}
	}

	loadImage() {
		if (this.state.image.images && this.state.image.images[0]) {
			var image = new Image();

			image.onload = this.imageLoadedHandler;
			image.onerror = this.imageErrorHandler;
			image.src = 'http://cdh-vir-1.it.gu.se:8004/images/1000x/'+this.state.image.images[0].image+'.jpg';
		}
	}

	imageLoadedHandler() {
		this.setState({
			imageUrl: 'http://cdh-vir-1.it.gu.se:8004/images/1000x/'+this.state.image.images[0].image+'.jpg',
			flippable: this.state.image.images.length == 2
		});

		setTimeout(function() {
			this.positionImageButtons();
		}.bind(this), 100);
	}

	imageErrorHandler(event) {
	}

	componentDidMount() {
		this.fetchData();

		window.addEventListener('scroll', this.windowScrollHandler);
		window.addEventListener('resize', this.windowResizeHandler);

		this.positionImageButtons();
	}

	componentDidUpdate(prevProps) {
		if (this.state.image && this.state.image.id != this.props.params.imageId) {
			this.fetchData();
			
			window.scrollTo(0, 0);
//			new WindowScroll().scrollToY(0, 1, 'easeInOutSine');
		}
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this.windowScrollHandler);
		window.removeEventListener('resize', this.windowResizeHandler);
	}

	getImageStyle(rearImage) {
		if (rearImage && this.state.image.images.length == 2) {
			var imgObj = this.state.image.images[1];
		}
		else {
			var imgObj = this.state.image.images[0];
		}

		var viewWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

		var ratio = 0;

		var imageWidth = imgObj.imagesize.width;
		var imageHeight = imgObj.imagesize.height;

		if (this.state.fullDisplay) {
			ratio = viewWidth / imageWidth;
			imageWidth = viewWidth;
			imageHeight = imageHeight * ratio;
		}
		else {
			if (imageWidth > viewWidth){
				ratio = viewWidth / imageWidth;
				imageWidth = viewWidth;
				imageHeight = imageHeight * ratio;
			}

			if (imageHeight > viewHeight){
				ratio = viewHeight / imageHeight;
				imageHeight = viewHeight;
				imageWidth = imageWidth * ratio
			}
		}

		var imageStyle = imgObj.color && imgObj.color.colors ? {
			backgroundColor: imgObj.color.dominant.hex,
			backgroundImage: rearImage ? "url('http://cdh-vir-1.it.gu.se:8004/images/1000x/"+imgObj.image+".jpg')" : this.state.imageUrl && this.state.imageUrl != '' ? "url('"+this.state.imageUrl+"')" : null,

			width: imageWidth,
			height: imageHeight
		} : null;

		return imageStyle;
	}

	render() {
		if (this.state.image && this.state.image.images[0]) {
			var colorElements = this.state.image.images[0].color ? this.state.image.images[0].color.colors.five.map(function(color, index) {
				return <a href={'#/search/color/'+color.hsv.h+'/'+color.hsv.s} key={index} className="color" style={{backgroundColor: color.hex}} ></a>
			}) : [];

			var persons = this.state.image.persons ? this.state.image.persons.map(function(person, index) {
				if (person != '') {
					return <span key={index}><a href={'#/search/person/'+person}>{person}</a>{index > 0 ? ', ' : ''}</span>
				}
			}) : [];

			var genre = this.state.image.genre ? this.state.image.genre.map(function(genre, index) {
				if (genre != '') {
					return <span key={index}><a href={'#/search/genre/'+genre}>{genre}</a>{index > 0 ? ', ' : ''}</span>
				}
			}) : [];

			return <div onMouseMove={this.mouseMoveHandler}>

				<div ref="imageContainer" className={'image-container'+(this.state.fullDisplay ? ' full-display' : '')+(this.state.flippable ? ' flippable' : '')+(this.state.flipped ? ' flipped' : '')+(this.state.imageUrl && this.state.imageUrl != '' ? ' initialized' : '')}>
					<div className="image-display" onClick={this.imageDisplayClickHandler} style={this.getImageStyle()}>
						<div className="loader"></div>
					</div>

					{
						this.state.image.images.length == 2 && 
						<div className="image-display image-rear" onClick={this.imageDisplayClickHandler} style={this.getImageStyle(true)}>
						</div>
					}

					<div ref="imageButtons" className={'image-buttons'+(this.state.fixedImageButtons ? ' fixed' : '')}>
						
						{/*<button className="icon-plus" onClick={this.hideUiClick}></button>*/}

						<button className="icon-plus"></button>

						<button className="toggle-show-all" style={{transitionDelay: '60ms'}} onClick={this.toggleFullDisplay}>
							<span className="icon-arrow arrow-1"></span>
							<span className="icon-arrow arrow-2"></span>
							Show all
						</button>

					</div>
				</div>

				<div className="container">

					<h2>{this.state.image.title}</h2>

					<div className="row">
						{
							(this.state.image.item_date || (this.state.image.size && this.state.image.size.inner) || this.state.image.material) &&

							<div className="four columns">
								{
									this.state.image.item_date &&
									<div><span className="label">Datering:</span> {this.state.image.item_date}</div>
								}
								{
									this.state.image.material &&
									<div><span className="label">Material:</span> {this.state.image.material}</div>
								}
								{
									this.state.image.size && this.state.image.size.inner &&
									<div><span className="label">Mått:</span> {this.state.image.size.inner.height+'x'+this.state.image.size.inner.width} cm</div>
								}
							</div>
						}

						<div className="four columns">
							<div><span className="label">Plats:</span> <a href={'#/search/museum/'+this.state.image.collection.museum}>{this.state.image.collection.museum}</a></div>
							{
								genre.length > 0 &&
								<div>
									<span className="label">Genre:</span> {genre}
								</div>
							}
						</div>

						<div className="four columns">
							<div className="color-list">
								{colorElements}
							</div>
						</div>
					</div>

					<div className="row">
						{
							persons.length > 0 &&
							<div className="six columns">
								<br/>
								<span className="label">Personer:</span><br/>
								{persons}
							</div>
						}
					</div>

					<br/>
					<p>{this.state.image.description}</p>

				</div>

				<div className="container">
					{
						this.state.image.persons && this.state.image.persons.length > 0 &&
						<div>
							<br/>
							<h3>Flera bilder av {this.state.image.persons[0]}</h3>
							<ImageList related="person" relatedValue={this.state.image.persons[0]} count="10" />
						</div>
					}

					{
						this.state.image.genre && this.state.image.genre.length > 0 &&
						<div>
							<br/><br/><br/>
							<h3>Flera {this.state.image.genre[0]}</h3>
							<ImageList related="genre" relatedValue={this.state.image.genre[0]} count="10" />
						</div>
					}

					<br/><br/><br/>
					<h3>Flera bilder från {this.state.image.collection.museum}</h3>
					<ImageList related="museum" relatedValue={this.state.image.collection.museum} count="10" />
				</div>

			</div>;
		}
		else {
			return <div></div>;
		}
	}
}