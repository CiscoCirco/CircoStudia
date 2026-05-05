import { useMemo } from 'react';
import useDatasource, { DatasourceHook } from '../useDatasource';
import RolItemDatasource from './RolItemDatasource';
import RolItem from '../../entities/RolItem';

export default function useRolItemDatasource(): DatasourceHook<RolItem> & { datasource: RolItemDatasource } {
  const datasource = useMemo(() => new RolItemDatasource(), []);
  const hook = useDatasource<RolItem>(datasource as any);
  return Object.assign(hook, { datasource }) as any;
}
