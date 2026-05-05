import ItemDatasource from '../ItemDatasource';
import AsignadoA from '../../entities/AsignadoA';
import { Lista } from '../../utils/Constants';

const SELECT = ['Id', 'Title', 'idEstudiante/Id', 'idRol/Id', 'idRol/nombreRol'];
const EXPAND = ['idEstudiante', 'idRol'];

export default class AsignadoADatasource extends ItemDatasource {
  protected selectProperties = SELECT;
  protected expand = EXPAND;

  constructor() {
    super(Lista.ASIGNADO_A);
  }

  protected mapItem(item: any): AsignadoA {
    return new AsignadoA(item);
  }

  public async getItems(): Promise<AsignadoA[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .select(...SELECT)
      .expand(...EXPAND)();
    return items.map(i => this.mapItem(i));
  }

  public async getById(id: number): Promise<AsignadoA> {
    const item = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .getById(id)
      .select(...SELECT)
      .expand(...EXPAND)();
    return this.mapItem(item);
  }

  public async getByEstudianteId(estudianteId: number): Promise<AsignadoA[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .filter(`idEstudianteId eq ${estudianteId}`)
      .select(...SELECT)
      .expand(...EXPAND)();
    return items.map(i => this.mapItem(i));
  }
}
