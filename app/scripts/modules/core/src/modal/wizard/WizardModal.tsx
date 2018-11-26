import * as React from 'react';
import { Formik, Form } from 'formik';
import { Modal } from 'react-bootstrap';
import { merge } from 'lodash';

import { TaskMonitor } from 'core/task';
import { IModalComponentProps } from 'core/presentation';
import { NgReact } from 'core/reactShims';
import { Spinner } from 'core/widgets';

import { ModalClose } from '../buttons/ModalClose';
import { SubmitButton } from '../buttons/SubmitButton';

import { IWizardPageProps, IWizardPageValidate } from './WizardPage';
import { WizardStepLabel } from './WizardStepLabel';

export interface IWizardPageData<T> {
  element: HTMLElement;
  label: string;
  props: IWizardPageProps<T>;
  validate: IWizardPageValidate<T>;
}

export interface IWizardModalProps<T> extends IModalComponentProps {
  formClassName?: string;
  heading: string;
  initialValues: T;
  loading?: boolean;
  submitButtonLabel: string;
  taskMonitor: TaskMonitor;
  validate: IWizardPageValidate<T>;
  closeModal?(result?: any): void; // provided by ReactModal
  dismissModal?(rejection?: any): void; // provided by ReactModal
}

export interface IWizardModalState<T> {
  currentPage: IWizardPageData<T>;
  dirtyPages: Set<string>;
  pageErrors: { [pageName: string]: { [key: string]: string } };
  formInvalid: boolean;
  pages: string[];
  waiting: Set<string>;
}

export class WizardModal<T = {}> extends React.Component<IWizardModalProps<T>, IWizardModalState<T>> {
  private pages: { [label: string]: IWizardPageData<T> } = {};
  private stepsElement: HTMLDivElement;
  private formikRef = React.createRef<Formik<any>>();

  constructor(props: IWizardModalProps<T>) {
    super(props);

    this.state = {
      currentPage: null,
      dirtyPages: new Set<string>(),
      formInvalid: false,
      pages: [],
      pageErrors: {},
      waiting: new Set(),
    };
  }

  private setCurrentPage = (pageState: IWizardPageData<T>): void => {
    if (this.stepsElement) {
      this.stepsElement.scrollTop = pageState.element.offsetTop;
    }
    this.setState({ currentPage: pageState });
  };

  private onMount = (element: any): void => {
    if (element) {
      const label = element.state.label;
      this.pages[label] = {
        element: element.element,
        label,
        validate: element.validate,
        props: element.props,
      };
      this.revalidate();
    }
  };

  private dirtyCallback = (name: string, dirty: boolean): void => {
    const dirtyPages = new Set(this.state.dirtyPages);
    if (dirty) {
      dirtyPages.add(name);
    } else {
      dirtyPages.delete(name);
    }
    this.setState({ dirtyPages });
  };

  public componentDidMount(): void {
    const pages = this.getVisiblePageNames();
    this.setState({ pages: this.getVisiblePageNames(), currentPage: this.pages[pages[0]] });
    this.revalidate();
  }

  public componentWillReceiveProps(): void {
    this.setState({ pages: this.getVisiblePageNames() });
  }

  public componentWillUnmount(): void {
    this.pages = {};
  }

  private handleStepsScroll = (event: React.UIEvent<HTMLDivElement>): void => {
    // Cannot precalculate because sections can shrink/grow.
    // Could optimize by having a callback every time the size changes... but premature
    const pageTops = this.state.pages.map(pageName => this.pages[pageName].element.offsetTop);
    const scrollTop = event.currentTarget.scrollTop;

    let reversedCurrentPage = pageTops.reverse().findIndex(pageTop => scrollTop >= pageTop);
    if (reversedCurrentPage === undefined) {
      reversedCurrentPage = pageTops.length - 1;
    }
    const currentPageIndex = pageTops.length - (reversedCurrentPage + 1);
    const currentPage = this.pages[this.state.pages[currentPageIndex]];

    if (this.state.currentPage !== currentPage) {
      this.setState({ currentPage });
    }
  };

  private getFilteredChildren(): React.ReactChild[] {
    return React.Children.toArray(this.props.children).filter(
      (child: any) => !(!child || !child.type || !child.type.label),
    );
  }

  private getVisiblePageNames(): string[] {
    return this.getFilteredChildren().map((child: any) => child.type.label);
  }

  private validate = (values: T): any => {
    const errors: Array<{ [key: string]: string }> = [];
    const newPageErrors: { [pageName: string]: { [key: string]: string } } = {};

    this.state.pages.filter(pageName => this.pages[pageName]).forEach(pageName => {
      const pageErrors = this.pages[pageName].validate ? this.pages[pageName].validate(values) : {};
      if (Object.keys(pageErrors).length > 0) {
        newPageErrors[pageName] = pageErrors;
      } else {
        delete newPageErrors[pageName];
      }
      errors.push(pageErrors);
    });
    errors.push(this.props.validate(values));
    const mergedErrors = errors.reduce((mergeTarget, errorObj) => merge(mergeTarget, errorObj), {});
    this.setState({ pageErrors: newPageErrors, formInvalid: Object.keys(mergedErrors).length > 0 });
    return mergedErrors;
  };

  private revalidate = () => this.formikRef.current && this.formikRef.current.getFormikBag().validateForm();

  private setWaiting = (section: string, isWaiting: boolean): void => {
    const waiting = new Set(this.state.waiting);
    isWaiting ? waiting.add(section) : waiting.delete(section);
    this.setState({ waiting });
  };

  public render() {
    const { formClassName, heading, initialValues, loading, submitButtonLabel, taskMonitor } = this.props;
    const { currentPage, dirtyPages, pageErrors, formInvalid, pages, waiting } = this.state;
    const { TaskMonitorWrapper } = NgReact;

    const pagesToShow = pages.filter(page => this.pages[page]);

    const submitting = taskMonitor && taskMonitor.submitting;

    return (
      <>
        {taskMonitor && <TaskMonitorWrapper monitor={taskMonitor} />}
        <Formik<T>
          ref={this.formikRef}
          initialValues={initialValues}
          onSubmit={this.props.closeModal}
          validate={this.validate}
          render={formik => (
            <Form className={`form-horizontal ${formClassName}`}>
              <ModalClose dismiss={this.props.dismissModal} />
              <Modal.Header>{heading && <h3>{heading}</h3>}</Modal.Header>
              <Modal.Body>
                {loading && (
                  <div className="row">
                    <Spinner size="large" />
                  </div>
                )}
                {!loading && (
                  <div className="row">
                    <div className="col-md-3 hidden-sm hidden-xs">
                      <ul className="steps-indicator wizard-navigation">
                        {pagesToShow.map(pageName => (
                          <WizardStepLabel<T>
                            key={this.pages[pageName].label}
                            current={this.pages[pageName] === currentPage}
                            dirty={dirtyPages.has(this.pages[pageName].label)}
                            errors={pageErrors[this.pages[pageName].label]}
                            pageState={this.pages[pageName]}
                            onClick={this.setCurrentPage}
                            waiting={waiting.has(pageName)}
                          />
                        ))}
                      </ul>
                    </div>
                    <div className="col-md-9 col-sm-12">
                      <div className="steps" ref={ele => (this.stepsElement = ele)} onScroll={this.handleStepsScroll}>
                        {this.getFilteredChildren().map((child: React.ReactElement<any>) => {
                          return React.cloneElement(child, {
                            formik: formik,
                            dirtyCallback: this.dirtyCallback,
                            onMount: this.onMount,
                            revalidate: this.revalidate,
                            setWaiting: this.setWaiting,
                          });
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer>
                <button
                  className="btn btn-default"
                  disabled={submitting}
                  onClick={this.props.dismissModal}
                  type="button"
                >
                  Cancel
                </button>
                <SubmitButton
                  isDisabled={formInvalid || submitting || waiting.size > 0}
                  submitting={submitting}
                  isFormSubmit={true}
                  label={submitButtonLabel}
                />
              </Modal.Footer>
            </Form>
          )}
        />
      </>
    );
  }
}
