import BaseEntity from './BaseEntity';

export default class Correlativa extends BaseEntity {
  public materiaId: number;
  public materiaRequeridaId: number;

  protected mapItem(item: any): void {
    this.materiaId = item.codMateriaId || (item.codMateria ? item.codMateria.Id : 0);
    this.materiaRequeridaId = item.codMateriaRequeridaId || (item.codMateriaRequerida ? item.codMateriaRequerida.Id : 0);
  }

  public toListItem(): any {
    return {
      ...super.toListItem(),
      codMateriaId: this.materiaId,
      codMateriaRequeridaId: this.materiaRequeridaId
    };
  }
}
