import ItemDatasource from '../ItemDatasource';
import Correlativa from '../../entities/Correlativa';
import { Lista } from '../../utils/Constants';

const SELECT = [
  'Id', 'Title',
  'codMateria/Id', 'codMateria/ID',
  'codMateriaRequerida/Id', 'codMateriaRequerida/ID'
];
const EXPAND = ['codMateria', 'codMateriaRequerida'];

export default class CorrelativaDatasource extends ItemDatasource {
  protected selectProperties = SELECT;
  protected expand = EXPAND;

  constructor() {
    super(Lista.CORRELATIVA);
  }

  protected mapItem(item: any): Correlativa {
    return new Correlativa(item);
  }

  public async getItems(): Promise<Correlativa[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .select(...SELECT)
      .expand(...EXPAND)
      .top(4999)();
    return items.map(i => this.mapItem(i));
  }

  public async getById(id: number): Promise<Correlativa> {
    const item = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .getById(id)
      .select(...SELECT)
      .expand(...EXPAND)();
    return this.mapItem(item);
  }

  public async getByMateriaId(materiaId: number): Promise<Correlativa[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .filter(`codMateriaId eq ${materiaId}`)
      .select(...SELECT)
      .expand(...EXPAND)
      .top(4999)();
    return items.map(i => this.mapItem(i));
  }
}
