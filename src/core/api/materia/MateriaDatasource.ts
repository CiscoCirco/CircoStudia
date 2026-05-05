import ItemDatasource from '../ItemDatasource';
import Materia from '../../entities/Materia';
import { Lista } from '../../utils/Constants';

export default class MateriaDatasource extends ItemDatasource {
  protected selectProperties = ['Id', 'Title', 'codMateria', 'nombre', 'anio'];

  constructor() {
    super(Lista.MATERIA);
  }

  protected mapItem(item: any): Materia {
    return new Materia(item);
  }

  public async getItems(): Promise<Materia[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .select(...this.selectProperties)();
    return items.map(i => this.mapItem(i));
  }

  public async getById(id: number): Promise<Materia> {
    const item = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .getById(id)
      .select(...this.selectProperties)();
    return this.mapItem(item);
  }

  public async getByCodMateria(cod: string): Promise<Materia | null> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .filter(`codMateria eq '${cod}'`)
      .select(...this.selectProperties)
      .top(1)();
    return items.length > 0 ? this.mapItem(items[0]) : null;
  }
}
