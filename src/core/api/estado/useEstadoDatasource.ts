import { useMemo } from 'react';
import useDatasource, { DatasourceHook } from '../useDatasource';
import EstadoDatasource from './EstadoDatasource';
import Estado from '../../entities/Estado';

export default function useEstadoDatasource(): DatasourceHook<Estado> & { datasource: EstadoDatasource } {
  const datasource = useMemo(() => new EstadoDatasource(), []);
  const hook = useDatasource<Estado>(datasource as any);
  return Object.assign(hook, { datasource }) as any;
}
