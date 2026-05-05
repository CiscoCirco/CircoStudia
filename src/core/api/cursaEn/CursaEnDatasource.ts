import ItemDatasource from '../ItemDatasource';
import CursaEn from '../../entities/CursaEn';
import { Lista } from '../../utils/Constants';

const SELECT = ['Id', 'Title', 'idEstudianteId', 'idOferta/Id'];
const EXPAND = ['idOferta'];

export default class CursaEnDatasource extends ItemDatasource {
  protected selectProperties = SELECT;
  protected expand = EXPAND;

  constructor() {
    super(Lista.CURSA_EN);
  }

  protected mapItem(item: any): CursaEn {
    return new CursaEn(item);
  }

  public async getItems(): Promise<CursaEn[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .select(...SELECT)
      .expand(...EXPAND)();
    return items.map(i => this.mapItem(i));
  }

  public async getById(id: number): Promise<CursaEn> {
    const item = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .getById(id)
      .select(...SELECT)
      .expand(...EXPAND)();
    return this.mapItem(item);
  }

  public async getByEstudianteId(estudianteId: number): Promise<CursaEn[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .filter(`idEstudianteId eq ${estudianteId}`)
      .select(...SELECT)
      .expand(...EXPAND)();
    return items.map(i => this.mapItem(i));
  }

  public async getAllFlat(): Promise<CursaEn[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .select('Id', 'idEstudianteId', 'idOferta/Id')
      .expand('idOferta')
      .top(4999)();
    return items.map(i => this.mapItem(i));
  }

  public async getByOfertaId(ofertaId: number): Promise<CursaEn[]> {
    const items: any[] = await this._sp.web.lists
      .getByTitle(this.listTitle).items
      .filter(`idOfertaId eq ${ofertaId}`)
      .select(...SELECT)
      .expand(...EXPAND)();
    return items.map(i => this.mapItem(i));
  }
}
