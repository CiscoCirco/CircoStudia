import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { getSP } from '../../core/pnp/sp/pnpjs-presets';
import CircoStudiaWP from './components/CircoStudiaWP';
import { ICircoStudiaWPProps } from './components/ICircoStudiaWPProps';

export interface ICircoStudiaWPWebPartProps {}

export default class CircoStudiaWPWebPart extends BaseClientSideWebPart<ICircoStudiaWPWebPartProps> {

  public render(): void {
    const element: React.ReactElement<ICircoStudiaWPProps> = React.createElement(CircoStudiaWP, {});
    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    await super.onInit();
    getSP(this.context);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return { pages: [] };
  }
}
