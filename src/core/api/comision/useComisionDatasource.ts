import { useMemo } from 'react';
import useDatasource, { DatasourceHook } from '../useDatasource';
import ComisionDatasource from './ComisionDatasource';
import Comision from '../../entities/Comision';

export default function useComisionDatasource(): DatasourceHook<Comision> & { datasource: ComisionDatasource } {
  const datasource = useMemo(() => new ComisionDatasource(), []);
  const hook = useDatasource<Comision>(datasource as any);
  return Object.assign(hook, { datasource }) as any;
}
