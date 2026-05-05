import ItemDatasource from '../ItemDatasource';
import Comision from '../../entities/Comision';
import { Lista } from '../../utils/Constants';

export default class ComisionDatasource extends ItemDatasource {
  protected selectProperties = ['Id', 'Title', 'codComision', 'descripcion', 'diaSemana', 'turno'];

  constructor() {
    super(Lista.COMISION);
  }

  protected mapItem(item: any): Comision {
    return new Comision(item);
  }

  public async getItems(): Promise<Comision[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .select(...this.selectProperties)();
    return items.map(i => this.mapItem(i));
  }

  public async getById(id: number): Promise<Comision> {
    const item = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .getById(id)
      .select(...this.selectProperties)();
    return this.mapItem(item);
  }

  public async getByCodComision(cod: string): Promise<Comision | null> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .filter(`codComision eq '${cod}'`)
      .select(...this.selectProperties)
      .top(1)();
    return items.length > 0 ? this.mapItem(items[0]) : null;
  }
}
