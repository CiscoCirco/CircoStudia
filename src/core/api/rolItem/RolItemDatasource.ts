import ItemDatasource from '../ItemDatasource';
import RolItem from '../../entities/RolItem';
import { Lista } from '../../utils/Constants';

export default class RolItemDatasource extends ItemDatasource {
  protected selectProperties = ['Id', 'Title', 'nombreRol'];

  constructor() {
    super(Lista.ROL);
  }

  protected mapItem(item: any): RolItem {
    return new RolItem(item);
  }

  public async getItems(): Promise<RolItem[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .select(...this.selectProperties)();
    return items.map(i => this.mapItem(i));
  }

  public async getById(id: number): Promise<RolItem> {
    const item = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .getById(id)
      .select(...this.selectProperties)();
    return this.mapItem(item);
  }
}
