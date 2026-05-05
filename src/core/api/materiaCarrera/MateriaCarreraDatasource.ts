import ItemDatasource from '../ItemDatasource';
import MateriaCarrera from '../../entities/MateriaCarrera';
import { Lista } from '../../utils/Constants';

const SELECT = ['Id', 'Title', 'CodMateria/Id', 'CodMateria/codMateria', 'CodMateria/nombre', 'codCarrera/Id'];
const EXPAND = ['CodMateria', 'codCarrera'];

export default class MateriaCarreraDatasource extends ItemDatasource {
  protected selectProperties = SELECT;
  protected expand = EXPAND;

  constructor() {
    super(Lista.MATERIA_CARRERA);
  }

  protected mapItem(item: any): MateriaCarrera {
    return new MateriaCarrera(item);
  }

  public async getItems(): Promise<MateriaCarrera[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .select(...SELECT)
      .expand(...EXPAND)
      .top(4999)();
    return items.map(i => this.mapItem(i));
  }

  public async getById(id: number): Promise<MateriaCarrera> {
    const item = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .getById(id)
      .select(...SELECT)
      .expand(...EXPAND)();
    return this.mapItem(item);
  }

  public async getByCarreraId(carreraId: number): Promise<MateriaCarrera[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .filter(`codCarreraId eq ${carreraId}`)
      .select(...SELECT)
      .expand(...EXPAND)
      .top(4999)();
    return items.map(i => this.mapItem(i));
  }

  public async getByMateriaId(materiaId: number): Promise<MateriaCarrera[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .filter(`CodMateriaId eq ${materiaId}`)
      .select(...SELECT)
      .expand(...EXPAND)();
    return items.map(i => this.mapItem(i));
  }
}
