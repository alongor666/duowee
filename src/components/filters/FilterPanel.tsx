'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useDashboard } from '@/contexts/DashboardContext';
import { getFilterOptions, createDefaultFilters } from '@/utils/dataLoader';
import type { FilterState } from '@/types';

export default function FilterPanel() {
  const { state, updateFilters, resetFilters } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFilters, setExpandedFilters] = useState<string[]>(['policy_start_year', 'week_number']);
  const [filterOptions, setFilterOptions] = useState<any>({});

  // 当数据加载完成后，计算可用的筛选选项
  useEffect(() => {
    if (state.data.length > 0) {
      const options = getFilterOptions(state.data);
      setFilterOptions(options);
    }
  }, [state.data]);

  // 筛选器配置
  const filterConfigs = [
    {
      id: 'policy_start_year',
      name: '保单起期年度',
      type: 'multiSelect' as const,
      required: true
    },
    {
      id: 'week_number',
      name: '周次',
      type: 'multiSelect' as const,
      required: true
    },
    {
      id: 'third_level_organization',
      name: '三级机构',
      type: 'multiSelect' as const
    },
    {
      id: 'insurance_type',
      name: '保险类型',
      type: 'multiSelect' as const
    },
    {
      id: 'coverage_type',
      name: '险种',
      type: 'multiSelect' as const
    },
    {
      id: 'business_type_category',
      name: '业务类型',
      type: 'multiSelect' as const
    },
    {
      id: 'customer_category_3',
      name: '客户分类',
      type: 'multiSelect' as const
    },
    {
      id: 'renewal_status',
      name: '续期状态',
      type: 'multiSelect' as const
    },
    {
      id: 'terminal_source',
      name: '终端来源',
      type: 'multiSelect' as const
    },
    {
      id: 'is_new_energy_vehicle',
      name: '新能源车',
      type: 'select' as const,
      options: [
        { label: '全部', value: null },
        { label: '是', value: true },
        { label: '否', value: false }
      ]
    },
    {
      id: 'is_transferred_vehicle',
      name: '过户车',
      type: 'select' as const,
      options: [
        { label: '全部', value: null },
        { label: '是', value: true },
        { label: '否', value: false }
      ]
    },
    {
      id: 'vehicle_insurance_grade',
      name: '车险等级',
      type: 'multiSelect' as const
    },
    {
      id: 'highway_risk_grade',
      name: '公路风险等级',
      type: 'multiSelect' as const
    }
  ];

  const toggleFilter = (filterId: string) => {
    setExpandedFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = {
      ...state.filters,
      [filterId]: value
    };
    updateFilters(newFilters);
  };

  const handleMultiSelectChange = (filterId: string, option: any) => {
    const currentValues = state.filters[filterId as keyof FilterState] as any[];
    const newValues = currentValues.includes(option)
      ? currentValues.filter(v => v !== option)
      : [...currentValues, option];

    handleFilterChange(filterId, newValues);
  };

  const getFilteredOptions = (options: any[], searchTerm: string) => {
    if (!searchTerm) return options;
    return options.filter(option =>
      option.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    Object.entries(state.filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) count++;
      if (value !== null && !Array.isArray(value) && value !== '') count++;
    });
    return count;
  };

  const hasActiveFilters = getActiveFilterCount() > 0;

  return (
    <div className="space-y-4">
      {/* 筛选器标题和控制 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">数据筛选</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            <span>重置</span>
          </button>
        )}
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索筛选选项..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 筛选器列表 */}
      <div className="space-y-2">
        {filterConfigs.map((config) => {
          const isExpanded = expandedFilters.includes(config.id);
          const currentValue = state.filters[config.id as keyof FilterState];
          const hasValue = Array.isArray(currentValue) ? currentValue.length > 0 : currentValue !== null;
          const options = filterOptions[config.id] || config.options || [];
          const filteredOptions = getFilteredOptions(options, searchTerm);

          return (
            <div key={config.id} className="border border-border rounded-lg">
              {/* 筛选器标题 */}
              <button
                onClick={() => toggleFilter(config.id)}
                className={cn(
                  'w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors',
                  isExpanded && 'border-b border-border'
                )}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">
                    {config.name}
                  </span>
                  {config.required && (
                    <span className="text-xs text-destructive">*</span>
                  )}
                  {hasValue && (
                    <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                      {Array.isArray(currentValue) ? currentValue.length : '已选择'}
                    </span>
                  )}
                </div>
                <div className={cn(
                  'transition-transform',
                  isExpanded ? 'rotate-180' : 'rotate-0'
                )}>
                  ↓
                </div>
              </button>

              {/* 筛选器选项 */}
              {isExpanded && (
                <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                  {config.type === 'select' ? (
                    <div className="space-y-1">
                      {(config.options || []).map((option: any) => (
                        <button
                          key={String(option.value)}
                          onClick={() => handleFilterChange(config.id, option.value)}
                          className={cn(
                            'w-full text-left px-3 py-2 text-sm rounded hover:bg-muted/50 transition-colors',
                            currentValue === option.value ? 'bg-primary text-primary-foreground' : ''
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredOptions.length > 0 ? (
                        filteredOptions.map((option: any) => (
                          <label
                            key={String(option)}
                            className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={(currentValue as any[])?.includes(option) || false}
                              onChange={() => handleMultiSelectChange(config.id, option)}
                              className="rounded border-border"
                            />
                            <span className="text-sm">{String(option)}</span>
                          </label>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          {searchTerm ? '未找到匹配项' : '暂无选项'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 筛选概要 */}
      {hasActiveFilters && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-sm font-medium mb-2">当前筛选条件</div>
          <div className="space-y-1 text-xs text-muted-foreground">
            {Object.entries(state.filters).map(([key, value]) => {
              const config = filterConfigs.find(c => c.id === key);
              if (!config || !value || (Array.isArray(value) && value.length === 0)) return null;

              return (
                <div key={key}>
                  <span className="font-medium">{config.name}:</span>{' '}
                  {Array.isArray(value) ? `${value.length}项已选择` : String(value)}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}