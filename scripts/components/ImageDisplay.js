import React from 'react';
import 'whatwg-fetch';
import _ from 'underscore';

import config from './../config';

export default class ImageDisplay extends React.Component {
	constructor(props) {
		super(props);

		this.imageLoadedHandler = this.imageLoadedHandler.bind(this);
		this.windowScrollHandler = this.windowScrollHandler.bind(this);
		this.windowResizeHandler = this.windowResizeHandler.bind(this);
		this.imageDisplayClickHandler = this.imageDisplayClickHandler.bind(this);
		this.toggleFullDisplay = this.toggleFullDisplay.bind(this);

		this.state = {
			image: null,
			imageUrl: '',
			flipped: false
		};
	}

	toggleFullDisplay() {
		this.setState({
			fullDisplay: !this.state.fullDisplay
		}, function() {
			setTimeout(function() {
				this.positionImageButtons();
			}.bind(this), 500);
		}.bind(this));
	}

	imageDisplayClickHandler() {
		if (this.state.image.back) {
			this.setState({
				flipped: !this.state.flipped
			});
		}
	}

	windowResizeHandler() {
		this.positionImageButtons();
	}

	windowScrollHandler() {
		this.positionImageButtons();
	}

	mouseMoveHandler() {
		if (this.mouseIdleTimer) {
			clearTimeout(this.mouseIdleTimer);
		}
		this.mouseIdleTimer = setTimeout(this.mouseIdleHandler.bind(this), 2000);
	}

	mouseIdleHandler() {
//		document.body.classList.add('hide-ui');
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
		if (this.state.image) {
			var image = new Image();

			image.onload = this.imageLoadedHandler;
			image.onerror = this.imageErrorHandler;
			image.src = config.imageUrl+'1000x/'+this.state.image.front.image+'.jpg';
		}
	}

	imageLoadedHandler() {
		var imageUrl = config.imageUrl+'1000x/'+this.state.image.front.image+'.jpg';

		this.setState({
			imageUrl: imageUrl,
			flippable: Boolean(this.state.image.back),
			flipped: false
		});

		setTimeout(function() {
			this.positionImageButtons();
		}.bind(this), 100);
	}

	imageErrorHandler(event) {
	}

	componentDidMount() {
		window.addEventListener('scroll', this.windowScrollHandler);
		window.addEventListener('resize', this.windowResizeHandler);

		this.setState({
			image: this.props.image
		}, function() {
			this.loadImage();
		}.bind(this));
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this.windowScrollHandler);
		window.removeEventListener('resize', this.windowResizeHandler);
	}

	componentWillReceiveProps(props) {
		if (props.image.front.image != this.state.image.front.image) {
			this.setState({
				image: props.image,
				imageUrl: '',
				flipped: false
			}, function() {
				this.loadImage();
			}.bind(this));
		}
	}

	getImageStyle(rearImage) {
		if (rearImage) {
			var imgObj = this.state.image.back;
		}
		else {
			var imgObj = this.state.image.front;
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
			backgroundImage: rearImage ? "url('"+config.imageUrl+"1000x/"+imgObj.image+".jpg')" : this.state.imageUrl && this.state.imageUrl != '' ? "url('"+this.state.imageUrl+"')" : null,

			width: imageWidth,
			height: imageHeight
		} : null;

		return imageStyle;
	}


	render() {
		if (this.state.image) {
			var rearImageEl;
			if (this.state.image.back) {
				rearImageEl = <div className="image-display image-rear" onClick={this.imageDisplayClickHandler} style={this.getImageStyle(true)}></div>;
			}

			return <div ref="imageContainer" className={'image-container'+(this.state.fullDisplay ? ' full-display' : '')+(this.state.flippable ? ' flippable' : '')+(this.state.flipped ? ' flipped' : '')+(this.state.imageUrl && this.state.imageUrl != '' ? ' initialized' : '')}>
				<div className="image-display" onClick={this.imageDisplayClickHandler} style={this.getImageStyle()}>
					<div className="loader"></div>
				</div>

				{rearImageEl}

				<div ref="imageButtons" className={'image-buttons'+(this.state.fixedImageButtons ? ' fixed' : '')}>
					
					{/*<button className="icon-plus" onClick={this.hideUiClick}></button>*/}

					<a className="icon-download" href={config.imageUrl+(this.state.flipped ? this.state.image.back.image : this.state.image.front.image)+'.jpg'} target="_blank"></a>

					{/*<button className="icon-plus"></button>*/}

					<button className="toggle-show-all" style={{transitionDelay: '60ms'}} onClick={this.toggleFullDisplay}>
						<span className="icon-arrow arrow-1"></span>
						<span className="icon-arrow arrow-2"></span>
						Show all
					</button>

				</div>
			</div>;
		}
		else {

			return <div />
		}
	}
}