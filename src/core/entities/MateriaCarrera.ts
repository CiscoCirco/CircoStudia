import BaseEntity from './BaseEntity';

export interface IMateriaMC {
  Id: number;
  codMateria: string;
  nombre: string;
}

export default class MateriaCarrera extends BaseEntity {
  public materiaId: number;
  public carreraId: number;
  public materia: IMateriaMC;

  protected mapItem(item: any): void {
    this.materiaId = item.CodMateriaId || (item.CodMateria ? item.CodMateria.Id : 0);
    this.carreraId = item.codCarreraId || (item.codCarrera ? item.codCarrera.Id : 0);
    this.materia = item.CodMateria
      ? { Id: item.CodMateria.Id, codMateria: item.CodMateria.codMateria || '', nombre: item.CodMateria.nombre || '' }
      : { Id: 0, codMateria: '', nombre: '' };
  }

  public toListItem(): any {
    return {
      ...super.toListItem(),
      CodMateriaId: this.materiaId,
      codCarreraId: this.carreraId
    };
  }
}
