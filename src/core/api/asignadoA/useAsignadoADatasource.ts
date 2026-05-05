import { useMemo } from 'react';
import useDatasource, { DatasourceHook } from '../useDatasource';
import AsignadoADatasource from './AsignadoADatasource';
import AsignadoA from '../../entities/AsignadoA';

export default function useAsignadoADatasource(): DatasourceHook<AsignadoA> & { datasource: AsignadoADatasource } {
  const datasource = useMemo(() => new AsignadoADatasource(), []);
  const hook = useDatasource<AsignadoA>(datasource as any);
  return Object.assign(hook, { datasource }) as any;
}
