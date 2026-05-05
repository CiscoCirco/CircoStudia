import ItemDatasource from '../ItemDatasource';
import Estudiante from '../../entities/Estudiante';
import { Lista } from '../../utils/Constants';

const SELECT = ['Id', 'Title', 'emailPersonal', 'preset', 'usuario/Id', 'usuario/EMail', 'usuario/Title'];
const EXPAND = ['usuario'];

export default class EstudianteDatasource extends ItemDatasource {
  protected selectProperties = SELECT;
  protected expand = EXPAND;

  constructor() {
    super(Lista.ESTUDIANTE);
  }

  protected mapItem(item: any): Estudiante {
    return new Estudiante(item);
  }

  public async getItems(): Promise<Estudiante[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .select(...SELECT)
      .expand(...EXPAND)();
    return items.map(i => this.mapItem(i));
  }

  public async getById(id: number): Promise<Estudiante> {
    const item = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .getById(id)
      .select(...SELECT)
      .expand(...EXPAND)();
    return this.mapItem(item);
  }

  public async getByEmail(email: string): Promise<Estudiante | null> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .filter(`usuario/EMail eq '${email}'`)
      .select(...SELECT)
      .expand(...EXPAND)
      .top(1)();
    return items.length > 0 ? this.mapItem(items[0]) : null;
  }

  public async getByUsuarioId(usuarioId: number): Promise<Estudiante | null> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .filter(`usuario/Id eq ${usuarioId}`)
      .select(...SELECT)
      .expand(...EXPAND)
      .top(1)();
    return items.length > 0 ? this.mapItem(items[0]) : null;
  }
}
