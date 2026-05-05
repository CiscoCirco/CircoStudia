import BaseEntity from './BaseEntity';

export interface IMateriaSummary {
  Id: number;
  codMateria: string;
  nombre: string;
  anio: number;
}

export interface IComisionSummary {
  Id: number;
  codComision: string;
  descripcion: string;
  diaSemana: string;
  turno: string;
}

export default class OfertaDeMaterias extends BaseEntity {
  public modalidad: string;
  public cuatrimestre: number;
  public fechaDePublicacion: string;
  public codMateriaId: number;
  public codComisionId: number;
  public materia: IMateriaSummary;
  public comision: IComisionSummary;

  protected mapItem(item: any): void {
    this.modalidad = item.modalidad || '';
    this.cuatrimestre = item.Cuatrimestre || 0;
    this.fechaDePublicacion = item.fechaDePublicacion || '';
    this.codMateriaId = item.codMateriaId || 0;
    this.codComisionId = item.codComisionId || 0;
    this.materia = item.codMateria
      ? { Id: item.codMateria.Id, codMateria: item.codMateria.codMateria || '', nombre: item.codMateria.nombre || '', anio: item.codMateria.anio || 0 }
      : { Id: 0, codMateria: '', nombre: '', anio: 0 };
    this.comision = item.codComision
      ? { Id: item.codComision.Id, codComision: item.codComision.codComision || '', descripcion: item.codComision.descripcion || '', diaSemana: item.codComision.diaSemana || '', turno: item.codComision.turno || '' }
      : { Id: 0, codComision: '', descripcion: '', diaSemana: '', turno: '' };
  }

  public toListItem(): any {
    return {
      ...super.toListItem(),
      modalidad: this.modalidad,
      Cuatrimestre: this.cuatrimestre,
      fechaDePublicacion: this.fechaDePublicacion,
      codMateriaId: this.codMateriaId,
      codComisionId: this.codComisionId
    };
  }
}
