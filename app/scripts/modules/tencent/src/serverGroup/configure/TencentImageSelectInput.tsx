import * as React from 'react';
import { IPromise } from 'angular';
import { $q } from 'ngimport';
import { ReactSelectProps, HandlerRendererResult, MenuRendererProps, Option, OptionValues } from 'react-select';
import { Subject, Observable, BehaviorSubject } from 'rxjs';

import { Application, HelpField, TetheredSelect, ValidationMessage } from '@spinnaker/core';

import { TencentImageReader, ITencentImage } from '../../image';

export interface ITencentImageSelectorProps {
  onChange: (value: ITencentImage) => void;
  value: ITencentImage;
  application: Application;
  credentials: string;
  region: string;
}

export interface ITencentImageSelectorState {
  errorMessage?: string;
  selectionMode: 'packageImages' | 'searchAllImages';
  searchString: string;
  searchResults: ITencentImage[];
  isSearching: boolean;
  packageImages: ITencentImage[];
  isLoadingPackageImages: boolean;
}

type sortImagesByOptions = 'name' | 'ts';

export class TencentImageSelectInput extends React.Component<ITencentImageSelectorProps, ITencentImageSelectorState> {
  public state: ITencentImageSelectorState = {
    errorMessage: null,
    selectionMode: 'packageImages',
    searchString: '',
    searchResults: null,
    isSearching: false,
    packageImages: null,
    isLoadingPackageImages: true,
  };

  private tencentImageReader = new TencentImageReader();
  private props$ = new Subject<ITencentImageSelectorProps>();
  private searchInput$ = new Subject<string>();
  private destroy$ = new Subject();
  private sortImagesBy$ = new BehaviorSubject<sortImagesByOptions>('ts');

  public static makeFakeImage(imageName: string, imageId: string, region: string): ITencentImage {
    if (!imageName && !imageId) {
      return null;
    }

    // assume that the specific image exists in the selected region
    const imgIds = { [region]: [imageId] };
    const attributes = { virtualizationType: '*', createdTime: new Date().toISOString() };

    return ({ imageName, imgIds, attributes } as unknown) as ITencentImage;
  }

  private loadImagesFromApplicationName(application: Application): IPromise<ITencentImage[]> {
    const query = application.name.replace(/_/g, '[_\\-]') + '*';
    return this.tencentImageReader.findImages({ q: query });
  }

  private buildQueryForSimilarImages(imageName: string) {
    let addDashToQuery = false;
    let packageBase = imageName.split('_')[0];
    const parts = packageBase.split('-');
    if (parts.length > 3) {
      packageBase = parts.slice(0, -3).join('-');
      addDashToQuery = true;
    }

    const tooShort = !packageBase || packageBase.length < 3;
    return tooShort ? null : packageBase + (addDashToQuery ? '-*' : '*');
  }

  private loadImageById(imageId: string, region: string, credentials: string): IPromise<ITencentImage> {
    return !imageId ? $q.when(null) : this.tencentImageReader.getImage(imageId, region, credentials).catch(() => null);
  }

  private searchForImages(query: string): IPromise<ITencentImage[]> {
    const hasMinLength = query && query.length >= 3;
    return hasMinLength ? this.tencentImageReader.findImages({ q: query }) : $q.when([]);
  }

  private fetchPackageImages(
    value: ITencentImage,
    region: string,
    credentials: string,
    application: Application,
  ): IPromise<ITencentImage[]> {
    const imageId = value && value.imgIds && value.imgIds[region] && value.imgIds[region][0];

    return this.loadImageById(imageId, region, credentials).then(image => {
      if (!image) {
        return this.loadImagesFromApplicationName(application);
      }

      return this.searchForImages(this.buildQueryForSimilarImages(image.imageName)).then(similarImages => {
        if (!similarImages.find(img => img.imageName === image.imageName)) {
          // findImages has a limit of 1000 and may not always include the current image, which is confusing
          return similarImages.concat(image);
        }
        return similarImages;
      });
    });
  }

  private selectImage(selectedImage: ITencentImage) {
    if (this.props.value !== selectedImage) {
      this.props.onChange(selectedImage);
    }
  }

  private findMatchingImage(images: ITencentImage[], selectedImage: ITencentImage) {
    const { region } = this.props;
    const selectImageId =
      selectedImage && selectedImage.imgIds[region] && selectedImage && selectedImage.imgIds[region][0];
    return images.find(img => img.imgIds[region] && img.imgIds[region][0] === selectImageId);
  }

  public componentDidMount() {
    const region$ = this.props$.map(x => x.region).distinctUntilChanged();
    const { value, region, credentials, application } = this.props;

    this.setState({ isLoadingPackageImages: true });
    const fetchPromise = this.fetchPackageImages(value, region, credentials, application);

    const packageImages$ = Observable.fromPromise(fetchPromise)
      .catch(() => {
        this.setState({ errorMessage: 'Unable to load package images' });
        return Observable.of([] as ITencentImage[]);
      })
      .do(() => this.setState({ isLoadingPackageImages: false }));

    const packageImagesInRegion$ = packageImages$
      .combineLatest(region$, this.sortImagesBy$)
      .map(([packageImages, latestRegion, sortImagesBy]) => {
        const images = packageImages.filter(img => !!img.imgIds[latestRegion]);
        return this.sortImages(images, sortImagesBy);
      });

    const searchString$ = this.searchInput$
      .do(searchString => this.setState({ searchString }))
      .distinctUntilChanged()
      .debounceTime(250);

    const searchImages$ = searchString$
      .do(() => this.setState({ isSearching: true }))
      .switchMap(searchString => this.searchForImages(searchString))
      .catch(() => {
        this.setState({ errorMessage: 'Unable to search for images' });
        return Observable.of([] as ITencentImage[]);
      })
      .do(() => this.setState({ isSearching: false }));

    const searchImagesInRegion$ = searchImages$
      .combineLatest(region$, this.sortImagesBy$)
      .map(([searchResults, latestRegion, sortImagesBy]) => {
        const { searchString } = this.state;
        if (searchResults.length === 0 && !!/img-[0-9a-f]{8}/.exec(searchString)) {
          const fakeImage = TencentImageSelectInput.makeFakeImage(searchString, searchString, latestRegion);
          return [fakeImage].filter(x => !!x);
        }

        const images = searchResults.filter(img => !!img.imgIds[latestRegion]);
        return this.sortImages(images, sortImagesBy);
      });

    searchImagesInRegion$.takeUntil(this.destroy$).subscribe(searchResults => this.setState({ searchResults }));
    packageImagesInRegion$.takeUntil(this.destroy$).subscribe(packageImages => {
      this.setState({ packageImages });
      this.selectImage(this.findMatchingImage(packageImages, this.props.value));
    });

    // Clear out the selected image if the region changes and the image is not found in the new region
    region$
      .switchMap(selectedRegion => {
        const image = this.props.value;
        if (this.state.selectionMode === 'packageImages') {
          // in packageImages mode, wait for the packageImages to load then find the matching one, or undefined
          return packageImagesInRegion$.map(images => this.findMatchingImage(images, image));
        } else {
          // in searchImages mode, return undefined if the selected image is not found in the new region
          const hasAmiInRegion = !!(image && image.imgIds && image.imgIds[selectedRegion]);
          return Observable.of(hasAmiInRegion ? image : undefined);
        }
      })
      .takeUntil(this.destroy$)
      .subscribe(image => this.selectImage(image));
  }

  private setSortImagesBy(sortImagesBy: sortImagesByOptions) {
    this.sortImagesBy$.next(sortImagesBy);
  }

  private buildImageMenu = (params: MenuRendererProps): HandlerRendererResult => {
    const { ImageMenuHeading, ImageLabel } = this;
    const { options } = params;
    return (
      <div className="Select-menu-outer">
        <div className="Select-menu" role="listbox">
          {options.length > 0 && <ImageMenuHeading />}
          {options.map(o => (
            <ImageLabel key={o.imageName} option={o} params={params} />
          ))}
        </div>
      </div>
    );
  };

  private ImageMenuHeading = () => {
    const sortImagesBy = this.sortImagesBy$.value;
    return (
      <div
        className="sp-padding-s-xaxis sp-padding-xs-yaxis small"
        style={{
          borderBottom: '1px solid var(--color-silver)',
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--color-white)',
        }}
      >
        <b>Sort by: </b>
        <a className="clickable sp-padding-xs-xaxis" onClick={() => this.setSortImagesBy('ts')}>
          {sortImagesBy === 'ts' ? <b>timestamp (newest first)</b> : 'timestamp (newest first)'}
        </a>
        <span> | </span>
        <a className="clickable sp-padding-xs-xaxis" onClick={() => this.setSortImagesBy('name')}>
          {sortImagesBy === 'name' ? <b>name (A-Z)</b> : 'name (A-Z)'}
        </a>
      </div>
    );
  };

  private sortImages(images: ITencentImage[], sortImagesBy: sortImagesByOptions): ITencentImage[] {
    return images.slice().sort((a, b) => {
      if (sortImagesBy === 'ts') {
        if (a.attributes.createdTime && b.attributes.createdTime) {
          return b.attributes.createdTime.localeCompare(a.attributes.createdTime);
        } else if (!a.attributes.createdTime && b.attributes.createdTime) {
          return 1;
        } else if (a.attributes.createdTime && !b.attributes.createdTime) {
          return -1;
        } else {
          return 0;
        }
      }
      return a.imageName.localeCompare(b.imageName);
    });
  }

  private ImageLabel = (imageLabelProps: { option: Option<OptionValues>; params: MenuRendererProps }) => {
    const { credentials, region } = this.props;
    const { option, params } = imageLabelProps;
    const imageLabel =
      option.imgIds[region] && option.imgIds[region][0]
        ? option.imgIds[region][0]
        : ` - not found in ${credentials}/${region}`;
    return (
      <div
        key={option.imageName}
        onClick={() => params.selectValue(option)}
        onMouseOver={() => params.focusOption(option)}
        className={`Select-option ${
          params.focusedOption && params.focusedOption.imageName === option.imageName ? 'is-focused' : ''
        }`}
        role="option"
      >
        <div>{option.imageName}</div>
        <div className="small">
          {option.attributes.createdTime ? <b>Created: </b> : null}
          {option.attributes.createdTime}
          <b className="sp-padding-s-left">imageId: </b>
          {imageLabel}
        </div>
      </div>
    );
  };

  public componentDidUpdate() {
    this.props$.next(this.props);
  }

  public componentWillUnmount() {
    this.destroy$.next();
  }

  public render() {
    const { value, credentials, region, onChange } = this.props;
    const {
      isLoadingPackageImages,
      isSearching,
      selectionMode,
      packageImages,
      searchResults,
      searchString,
    } = this.state;
    const isPackageImagesLoaded = !!packageImages;

    const ImageOptionRenderer = (image: ITencentImage) => {
      const imgIds = image.imgIds || {};
      const imageIdForSelectedRegion = imgIds[region] && imgIds[region][0];
      const message = imageIdForSelectedRegion
        ? `(${imageIdForSelectedRegion})`
        : ` - not found in ${credentials}/${region}`;

      return (
        <>
          <span>{image.imageName}</span>
          <span>{message}</span>
        </>
      );
    };

    const commonReactSelectProps: ReactSelectProps<any> = {
      clearable: false,
      required: true,
      valueKey: 'imageName',
      optionRenderer: ImageOptionRenderer,
      valueRenderer: ImageOptionRenderer,
      onSelectResetsInput: false,
      onBlurResetsInput: false,
      onCloseResetsInput: false,
      value,
    };

    const error = this.state.errorMessage ? <ValidationMessage message={this.state.errorMessage} type="error" /> : null;

    const noResultsText = `No results found in ${credentials}/${region}`;

    if (selectionMode === 'searchAllImages') {
      // User can search for any image using the typeahead
      // Results are streamed from the back end as the user types
      const lessThanThreeChars = !searchString || searchString.length < 3;
      const searchNoResultsText = lessThanThreeChars
        ? 'Please enter at least 3 characters'
        : isSearching
        ? 'Searching...'
        : noResultsText;

      return (
        <div className="col-md-7">
          <TetheredSelect
            {...commonReactSelectProps}
            menuRenderer={this.buildImageMenu}
            isLoading={isSearching}
            placeholder="Search for an image..."
            filterOptions={false as any}
            noResultsText={searchNoResultsText}
            options={searchResults}
            // @ts-ignore
            onInputChange={searchInput => this.searchInput$.next(searchInput)}
            onChange={onChange}
          />
          {error}
        </div>
      );
    } else if (isPackageImagesLoaded) {
      // User can pick an image from the preloaded 'packageImages' using the typeahead
      return (
        <div className="col-md-7">
          <TetheredSelect
            {...commonReactSelectProps}
            menuRenderer={this.buildImageMenu}
            isLoading={isLoadingPackageImages}
            placeholder="Pick an image"
            noResultsText={noResultsText}
            options={packageImages}
            onChange={onChange}
          />
          {error}
          <button type="button" className="link" onClick={() => this.setState({ selectionMode: 'searchAllImages' })}>
            Search All Images
          </button>{' '}
          <HelpField id="aws.serverGroup.allImages" />
        </div>
      );
    } else {
      // Show a disabled react-select while waiting for 'packageImages' to load
      return (
        <div className="col-md-7">
          <TetheredSelect
            {...commonReactSelectProps}
            isLoading={isLoadingPackageImages}
            disabled={true}
            options={[value].filter(x => !!x)}
          />
          {error}
          <button type="button" className="link" onClick={() => this.setState({ selectionMode: 'searchAllImages' })}>
            Search All Images
          </button>{' '}
          <HelpField id="aws.serverGroup.allImages" />
        </div>
      );
    }
  }
}
