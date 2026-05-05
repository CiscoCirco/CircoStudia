import { useMemo } from 'react';
import useDatasource, { DatasourceHook } from '../useDatasource';
import EstudianteDatasource from './EstudianteDatasource';
import Estudiante from '../../entities/Estudiante';

export default function useEstudianteDatasource(): DatasourceHook<Estudiante> & { datasource: EstudianteDatasource } {
  const datasource = useMemo(() => new EstudianteDatasource(), []);
  const hook = useDatasource<Estudiante>(datasource as any);
  return Object.assign(hook, { datasource }) as any;
}
