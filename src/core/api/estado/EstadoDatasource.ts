import ItemDatasource from '../ItemDatasource';
import Estado from '../../entities/Estado';
import { Lista, Condicion } from '../../utils/Constants';

const SELECT = ['Id', 'Title', 'idEstudianteId', 'codMateria/Id', 'codMateria/ID', 'condicion'];
const EXPAND = ['codMateria'];

export default class EstadoDatasource extends ItemDatasource {
  protected selectProperties = SELECT;
  protected expand = EXPAND;

  constructor() {
    super(Lista.ESTADO);
  }

  protected mapItem(item: any): Estado {
    return new Estado(item);
  }

  public async getItems(): Promise<Estado[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .select(...SELECT)
      .expand(...EXPAND)();
    return items.map(i => this.mapItem(i));
  }

  public async getById(id: number): Promise<Estado> {
    const item = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .getById(id)
      .select(...SELECT)
      .expand(...EXPAND)();
    return this.mapItem(item);
  }

  public async getByEstudianteId(estudianteId: number): Promise<Estado[]> {
    const condiciones = `(condicion eq '${Condicion.APROBADA}' or condicion eq '${Condicion.REGULARIZADA}' or condicion eq '${Condicion.CURSANDO}')`;
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .filter(`idEstudianteId eq ${estudianteId} and ${condiciones}`)
      .select(...SELECT)
      .expand(...EXPAND)();
    return items.map(i => this.mapItem(i));
  }

  public async getByMateriaId(materiaId: number): Promise<Estado[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .filter(`codMateriaId eq ${materiaId}`)
      .select(...SELECT)
      .expand(...EXPAND)();
    return items.map(i => this.mapItem(i));
  }
}
