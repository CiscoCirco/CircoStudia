import { useMemo } from 'react';
import useDatasource, { DatasourceHook } from '../useDatasource';
import MateriaCarreraDatasource from './MateriaCarreraDatasource';
import MateriaCarrera from '../../entities/MateriaCarrera';

export default function useMateriaCarreraDatasource(): DatasourceHook<MateriaCarrera> & { datasource: MateriaCarreraDatasource } {
  const datasource = useMemo(() => new MateriaCarreraDatasource(), []);
  const hook = useDatasource<MateriaCarrera>(datasource as any);
  return Object.assign(hook, { datasource }) as any;
}
