import ItemDatasource from '../ItemDatasource';
import OfertaDeMaterias from '../../entities/OfertaDeMaterias';
import { Lista } from '../../utils/Constants';

const SELECT = [
  'Id', 'Title', 'modalidad', 'Cuatrimestre', 'fechaDePublicacion',
  'codMateria/Id', 'codMateria/codMateria', 'codMateria/nombre', 'codMateria/anio',
  'codComision/Id', 'codComision/codComision', 'codComision/descripcion', 'codComision/diaSemana', 'codComision/turno'
];
const EXPAND = ['codMateria', 'codComision'];

export default class OfertaDeMateriaDatasource extends ItemDatasource {
  protected selectProperties = SELECT;
  protected expand = EXPAND;

  constructor() {
    super(Lista.OFERTA_DE_MATERIAS);
  }

  protected mapItem(item: any): OfertaDeMaterias {
    return new OfertaDeMaterias(item);
  }

  public async getItems(): Promise<OfertaDeMaterias[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .select(...SELECT)
      .expand(...EXPAND)
      .top(4999)();
    return items.map(i => this.mapItem(i));
  }

  public async getById(id: number): Promise<OfertaDeMaterias> {
    const item = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .getById(id)
      .select(...SELECT)
      .expand(...EXPAND)();
    return this.mapItem(item);
  }

  public async getByCuatrimestre(cuatrimestre: number): Promise<OfertaDeMaterias[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .filter(`Cuatrimestre eq ${cuatrimestre}`)
      .select(...SELECT)
      .expand(...EXPAND)
      .top(4999)();
    return items.map(i => this.mapItem(i));
  }

  public async getByMateriaId(materiaId: number): Promise<OfertaDeMaterias[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .filter(`codMateriaId eq ${materiaId}`)
      .select(...SELECT)
      .expand(...EXPAND)();
    return items.map(i => this.mapItem(i));
  }
}
