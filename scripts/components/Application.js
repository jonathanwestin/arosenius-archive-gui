import React from 'react';
import {hashHistory} from 'react-router'

import Header from './Header';
import Search from './Search';
import ImageList from './ImageList';
import Timeline from './Timeline';
import TsneView from './TsneView';
import AboutPanel from './AboutPanel';
import TagCloud from './TagCloud';
	
import EventBus from 'eventbusjs';
import WindowScroll from './../utils/window-scroll';

/*

Main application component

*/
export default class Application extends React.Component {
	constructor(props) {
		super(props);

		this.galleryTypeLinkClickHandler = this.galleryTypeLinkClickHandler.bind(this);
		this.eventBusOpenTagsHandler = this.eventBusOpenTagsHandler.bind(this);

		// Register EventBus, a utility for global communication between components, used
		// to for example to open the TagSelector
		window.eventBus = EventBus;
		window.eventBus.addEventListener('search.open-tags', this.eventBusOpenTagsHandler);

		// Basic state, gallery is the default galleryType
		this.state = {
			searchParams: {},
			galleryType: 'gallery'
		};

		window.app = this;
	}

	componentDidMount() {
		// Set the initial state, looks for parameters from the url and set the state according to that
		this.setState({
			searchParams: {
				search: this.props.params.search || '',
				searchperson: this.props.params.searchperson ? this.props.params.searchperson.split(';') : null,
				person: this.props.params.person ? this.props.params.person.split(';') : null,
				place: this.props.params.place ? this.props.params.place.split(';') : null,
				museum: this.props.params.museum ? this.props.params.museum.split(';') : null,
				genre: this.props.params.genre ? this.props.params.genre.split(';') : null,
				tags: this.props.params.tags ? this.props.params.tags.split(';') : null,
				type: this.props.params.type ? this.props.params.type.split(';') : null
			}
		});
	}

	componentWillReceiveProps(props) {
		// Update state if new parameters are received
		this.setState({
			searchParams: {
				search: props.params.search || '',
				searchperson: props.params.searchperson ? props.params.searchperson.split(';') : null,
				person: props.params.person ? props.params.person.split(';') : null,
				place: props.params.place ? props.params.place.split(';') : null,
				museum: props.params.museum ? props.params.museum.split(';') : null,
				genre: props.params.genre ? props.params.genre.split(';') : null,
				tags: props.params.tags ? props.params.tags.split(';') : null,
				type: props.params.type ? props.params.type.split(';') : null
			}
		})
	}

	galleryTypeLinkClickHandler(event) {
		// Event handler for the gallery type links (Tidslinje, Galleri, Katalog, Bildrelationer)
		// this.state.galleryType is read by the render function to find which list module should be used
		var galleryType = event.target.dataset.type;

		this.setState({
			galleryType: galleryType
		});

		// Switch to the base route if new gallery type is tsne-view (bildrelationer)
		if (galleryType == 'tsne-view') {
			hashHistory.push('/');
		}

		// Scroll down to gallery
		if (window.scrollY < 30) {
			var windowScroll = new WindowScroll();
			windowScroll.scrollToY(windowScroll.getOffsetTop(this.refs.siteContent)-250, 800, 'easeInOutSine', true);
		}
	}

	eventBusOpenTagsHandler() {
		if (this.state.galleryType == 'tsne-view') {
			this.setState({
				galleryType: 'gallery'
			});
		}
	}

	render() {
		var galleryElement;

		/*

		Add the right gallery component to galleryElement based on which gallery type is selected
		All gallery types except TsneView (bildrelatiner) have the same interface and are updated on route params change

		*/
		if (this.state.galleryType == 'timeline') {
			galleryElement = <Timeline searchString={this.state.searchParams.search}
				searchPerson={this.state.searchParams.searchperson && this.state.searchParams.searchperson.length > 0 ? this.state.searchParams.searchperson : this.state.searchParams.person}
				searchPlace={this.state.searchParams.place}
				searchMuseum={this.state.searchParams.museum}
				searchGenre={this.state.searchParams.genre}
				searchTags={this.state.searchParams.tags}
				searchType={this.state.searchParams.type} />;
		}
		else if (this.state.galleryType == 'simple-list') {
			galleryElement = <div><ImageList count="50" enableAutoLoad="true" listType="simple"
				searchString={this.state.searchParams.search}
				searchPerson={this.state.searchParams.searchperson && this.state.searchParams.searchperson.length > 0 ? this.state.searchParams.searchperson : this.state.searchParams.person}
				searchPlace={this.state.searchParams.place}
				searchMuseum={this.state.searchParams.museum}
				searchGenre={this.state.searchParams.genre}
				searchTags={this.state.searchParams.tags}
				searchType={this.state.searchParams.type} /></div>;
		}
		else if (this.state.galleryType == 'tsne-view') {
			galleryElement = <TsneView searchMuseum={this.state.searchParams.museum} />;
		}
		else if (this.state.galleryType == 'tagcloud') {
			galleryElement = <div>
				<TagCloud />
				<ImageList count="50" enableAutoLoad="true"
					searchString={this.state.searchParams.search}
					searchPerson={this.state.searchParams.searchperson && this.state.searchParams.searchperson.length > 0 ? this.state.searchParams.searchperson : this.state.searchParams.person}
					searchPlace={this.state.searchParams.place}
					searchMuseum={this.state.searchParams.museum}
					searchGenre={this.state.searchParams.genre}
					searchTags={this.state.searchParams.tags}
					searchType={this.state.searchParams.type} />
			</div>;
		}
		else {
			galleryElement = <ImageList count="50" enableAutoLoad="true"
				searchString={this.state.searchParams.search}
				searchPerson={this.state.searchParams.searchperson && this.state.searchParams.searchperson.length > 0 ? this.state.searchParams.searchperson : this.state.searchParams.person}
				searchPlace={this.state.searchParams.place}
				searchMuseum={this.state.searchParams.museum}
				searchGenre={this.state.searchParams.genre}
				searchTags={this.state.searchParams.tags}
				searchType={this.state.searchParams.type} />;

		}

		// Data and render for the gallery types menu
		var galleryTypes = [
			{
				type: 'timeline',
				menuItem: 'Tidslinje'
			},
			{
				type: 'simple-list',
				menuItem: 'Katalog'
			},
			{
				type: 'gallery',
				menuItem: 'Galleri'
			},
			{
				type: 'tsne-view',
				menuItem: 'Bildmoln'
			},
			{
				type: 'tagcloud',
				menuItem: 'Ordmoln'
			}
		];

		var galleryMenuItems = galleryTypes.map(function(galleryType) {
			return <a key={galleryType.type} 
				className={this.state.galleryType == galleryType.type ? 'selected' : null} 
				data-type={galleryType.type} 
				onClick={this.galleryTypeLinkClickHandler}>{galleryType.menuItem}</a>;
		}.bind(this));

		return (
			<div>

				{/* AboutPanel displays on top and includes general information about the project and the website */}
				<AboutPanel />

				{/* Website header (actually the footer) */}
				<Header routerPath={this.props.location.pathname} />

				<div className={'site-content'+(this.props.location.pathname.substr(0, 7) == '/search' ? ' front' : '')}>
					{this.props.children}

					{/* Search component */}
					<Search searchParams={this.state.searchParams} />

					{/* Gallery types menu */}
					<div className="gallery-menu">
						{galleryMenuItems}
					</div>

					{/* Gallery element: display of search results */}
					<div className="site-content" ref="siteContent">
						{
							galleryElement
						}
					</div>
				</div>
			</div>
		)
	}
}
