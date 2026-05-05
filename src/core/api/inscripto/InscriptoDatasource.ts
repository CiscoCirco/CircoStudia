import ItemDatasource from '../ItemDatasource';
import Inscripto from '../../entities/Inscripto';
import { Lista } from '../../utils/Constants';

const SELECT = ['Id', 'Title', 'idEstudiante/Id', 'idCarrera/Id'];
const EXPAND = ['idEstudiante', 'idCarrera'];

export default class InscriptoDatasource extends ItemDatasource {
  protected selectProperties = SELECT;
  protected expand = EXPAND;

  constructor() {
    super(Lista.INSCRIPTO);
  }

  protected mapItem(item: any): Inscripto {
    return new Inscripto(item);
  }

  public async getItems(): Promise<Inscripto[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .select(...SELECT)
      .expand(...EXPAND)();
    return items.map(i => this.mapItem(i));
  }

  public async getById(id: number): Promise<Inscripto> {
    const item = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .getById(id)
      .select(...SELECT)
      .expand(...EXPAND)();
    return this.mapItem(item);
  }

  public async getByEstudianteId(estudianteId: number): Promise<Inscripto[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .filter(`idEstudianteId eq ${estudianteId}`)
      .select(...SELECT)
      .expand(...EXPAND)();
    return items.map(i => this.mapItem(i));
  }

  public async getByCarreraId(carreraId: number): Promise<Inscripto[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .filter(`idCarreraId eq ${carreraId}`)
      .select(...SELECT)
      .expand(...EXPAND)();
    return items.map(i => this.mapItem(i));
  }
}
