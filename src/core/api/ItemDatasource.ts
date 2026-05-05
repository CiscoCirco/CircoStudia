import { SPFI } from "@pnp/sp";
import { getSP } from '../pnp/sp/pnpjs-presets';
import IDatasource from './IDatasource';
import { BaseEntity } from "../entities";

export default class ItemDatasource implements IDatasource<BaseEntity> {
  protected _sp: SPFI;
  public listTitle: string;
  protected selectProperties: string[] = ['Id', 'Title'];
  protected expand: string[] = [];

  constructor(listTitle: string) {
    this._sp = getSP();
    this.listTitle = listTitle;
  }

  protected mapItem(item: any): BaseEntity {
    const entity = Object.create(BaseEntity.prototype);
    entity.Id = item.Id;
    entity.Titulo = item.Title || '';
    return entity;
  }

  public async getItems(): Promise<BaseEntity[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .select(...this.selectProperties)
      .expand(...this.expand)();
    return items.map(item => this.mapItem(item));
  }

  public async getItemsFiltered(filter: string): Promise<BaseEntity[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .filter(filter)
      .select(...this.selectProperties)
      .expand(...this.expand)();
    return items.map(item => this.mapItem(item));
  }

  public async add(item: BaseEntity): Promise<BaseEntity> {
    const listItem = item.toListItem();
    const result: any = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .add(listItem);
    return this.getById(result.ID);
  }

  public async edit(item: BaseEntity): Promise<BaseEntity> {
    const listItem = item.toListItem();
    await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .getById(item.Id)
      .update(listItem);
    return this.getById(item.Id);
  }

  public async delete(itemId: number): Promise<void> {
    return this._sp.web.lists
      .getByTitle(this.listTitle).items
      .getById(itemId)
      .delete();
  }

  public async getById(itemId: number): Promise<BaseEntity> {
    const item = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .getById(itemId)
      .select(...this.selectProperties)
      .expand(...this.expand)();
    return this.mapItem(item);
  }
}
