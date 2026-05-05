import BaseEntity from './BaseEntity';

export default class CursaEn extends BaseEntity {
  public estudianteId: number;
  public ofertaId: number;

  protected mapItem(item: any): void {
    this.estudianteId = item.idEstudianteId || 0;
    this.ofertaId = item.idOfertaId || (item.idOferta ? item.idOferta.Id : 0);
  }

  public toListItem(): any {
    return {
      ...super.toListItem(),
      idEstudianteId: this.estudianteId,
      idOfertaId: this.ofertaId
    };
  }
}
