import ItemDatasource from '../ItemDatasource';
import Carrera from '../../entities/Carrera';
import { Lista } from '../../utils/Constants';

export default class CarreraDatasource extends ItemDatasource {
  protected selectProperties = ['Id', 'Title', 'nombre', 'codigoCarrera'];

  constructor() {
    super(Lista.CARRERA);
  }

  protected mapItem(item: any): Carrera {
    return new Carrera(item);
  }

  public async getItems(): Promise<Carrera[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .select(...this.selectProperties)();
    return items.map(i => this.mapItem(i));
  }

  public async getById(id: number): Promise<Carrera> {
    const item = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .getById(id)
      .select(...this.selectProperties)();
    return this.mapItem(item);
  }
}
