import { useMemo } from 'react';
import useDatasource, { DatasourceHook } from '../useDatasource';
import MateriaDatasource from './MateriaDatasource';
import Materia from '../../entities/Materia';

export default function useMateriaDatasource(): DatasourceHook<Materia> & { datasource: MateriaDatasource } {
  const datasource = useMemo(() => new MateriaDatasource(), []);
  const hook = useDatasource<Materia>(datasource as any);
  return Object.assign(hook, { datasource }) as any;
}
