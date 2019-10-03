import * as React from 'react';

import 'jquery-textcomplete';
import './spel.less';

import * as classNames from 'classnames';
import * as $ from 'jquery';
import { $q, $http, $timeout } from 'ngimport';
import { SpelAutocompleteService } from './SpelAutocompleteService';
import { ExecutionService } from '../../pipeline/service/execution.service';
import { StateService } from '@uirouter/core';
import { IPipeline } from '../../domain';
import { Observable, Subject } from 'rxjs';

export interface ISpelTextProps {
  placeholder: string;
  value?: string;
  onChange: (value: string) => void;
  pipeline: IPipeline;
  docLink: boolean;
}

export interface ISpelTextState {
  textcompleteConfig: any[];
}

export class SpelText extends React.Component<ISpelTextProps, ISpelTextState> {
  public static defaultProps: Partial<ISpelTextProps> = {
    placeholder: '',
  };

  private autocompleteService: SpelAutocompleteService;
  private readonly spelInputRef: any;
  private destroy$ = new Subject();
  private $input: JQLite;
  selection: { start: any; end: any };

  constructor(props: ISpelTextProps) {
    super(props);
    this.selection = {
      start: false,
      end: false,
    };
    this.state = { textcompleteConfig: [] };
    this.autocompleteService = new SpelAutocompleteService(
      $q,
      new ExecutionService($http, $q, {} as StateService, $timeout),
    );
    Observable.fromPromise(this.autocompleteService.addPipelineInfo(this.props.pipeline))
      .takeUntil(this.destroy$)
      .subscribe(textcompleteConfig => {
        this.setState({ textcompleteConfig: textcompleteConfig });
      });
    this.spelInputRef = React.createRef();
  }

  public componentWillUnmount(): void {
    this.$input.off('change', this.onChange);
    this.destroy$.next();
  }

  public componentDidMount(): void {
    this.$input = $(this.spelInputRef.current);
    this.renderSuggestions();
    this.$input.on('change', this.onChange);
  }

  private onChange = (e: any) => {
    const input = this.spelInputRef.current;
    this.selection = {
      start: input.selectionStart,
      end: input.selectionEnd,
    };
    this.props.onChange(e.target.value);
  };

  public componentDidUpdate(_: Readonly<ISpelTextProps>, prevState: Readonly<ISpelTextState>): void {
    const { selectionStart, selectionEnd } = this.spelInputRef.current;
    const update =
      (this.selection.start !== false && this.selection.start !== selectionStart) ||
      (this.selection.end !== false && this.selection.end !== selectionEnd);
    if (update) {
      this.spelInputRef.current.selectionStart = this.selection.start;
      this.spelInputRef.current.selectionEnd = this.selection.end;
    }
    if (prevState.textcompleteConfig !== this.state.textcompleteConfig) {
      this.renderSuggestions();
    }
  }

  private renderSuggestions() {
    this.$input.attr('contenteditable', 'true');
    this.$input.textcomplete(this.state.textcompleteConfig, {
      maxCount: 1000,
      zIndex: 9000,
      dropdownClassName: 'dropdown-menu textcomplete-dropdown spel-dropdown',
    });
  }

  public render() {
    return (
      <input
        type="text"
        placeholder={this.props.placeholder}
        className={classNames({
          'form-control': true,
          'no-doc-link': !this.props.docLink,
        })}
        value={this.props.value || ''}
        onChange={this.onChange}
        ref={this.spelInputRef}
      />
    );
  }
}
