import { Delete, Edit } from '@mui/icons-material';
import type { GridRowParams, GridActionsCellItemProps } from '@mui/x-data-grid';
import { GridActionsCellItem } from '@mui/x-data-grid';
import React, { useCallback } from 'react';

import type { useModal } from './useModal';

type ModalHook<T> = ReturnType<typeof useModal<T>>;

type ActionBuilder<T extends { id: string }> = (
  params: GridRowParams<T>,
) => React.ReactElement<GridActionsCellItemProps> | null;

interface EditActionConfig<T extends { id: string }> {
  enabled?: boolean;
  modal?: ModalHook<{ id: string }>;
  onClick?: (id: string, row: T) => void;
  label?: string;
}

interface DeleteActionConfig<T extends { id: string }> {
  enabled?: boolean;
  modal?: ModalHook<{ id: string }>;
  onClick?: (id: string, row: T) => void;
  label?: string;
}

interface UseGridActionsOptions<T extends { id: string }> {
  edit?: EditActionConfig<T>;
  delete?: DeleteActionConfig<T>;
  customActions?: ActionBuilder<T>[];
}

/**
 * Reusable hook for generating grid actions with proper memoization and type safety.
 * Supports edit/delete actions with optional customization, plus custom actions.
 *
 * @param options - Configuration object for actions
 * @returns A memoized function that generates action items for a grid row
 *
 * @example
 * ```tsx
 * const getActions = useGridActions<Product>({
 *   edit: { modal: editModal },
 *   delete: { modal: deleteModal },
 *   customActions: [
 *     (params) => (
 *       <GridActionsCellItem
 *         icon={<View />}
 *         label="View"
 *         onClick={() => navigate(`/products/${params.id}`)}
 *       />
 *     ),
 *   ],
 * });
 * ```
 */
export function useGridActions<T extends { id: string }>({
  edit,
  delete: deleteAction,
  customActions = [],
}: UseGridActionsOptions<T> = {}) {
  const handleEdit = useCallback(
    (id: string, row: T) => {
      if (edit?.onClick) {
        edit.onClick(id, row);
      } else if (edit?.modal) {
        edit.modal.open({ id });
      }
    },
    [edit],
  );

  const handleDelete = useCallback(
    (id: string, row: T) => {
      if (deleteAction?.onClick) {
        deleteAction.onClick(id, row);
      } else if (deleteAction?.modal) {
        deleteAction.modal.open({ id });
      }
    },
    [deleteAction],
  );

  return useCallback(
    (params: GridRowParams<T>): React.ReactElement<GridActionsCellItemProps>[] => {
      const id = params.id as string;
      const row = params.row;
      const actions: React.ReactElement<GridActionsCellItemProps>[] = [];

      // Add edit action if enabled
      if (edit?.enabled !== false) {
        actions.push(
          <GridActionsCellItem
            key="edit"
            icon={<Edit />}
            label={edit?.label || 'Edit'}
            onClick={() => handleEdit(id, row)}
            showInMenu={false}
          />,
        );
      }

      // Add delete action if enabled
      if (deleteAction?.enabled !== false) {
        actions.push(
          <GridActionsCellItem
            key="delete"
            icon={<Delete />}
            label={deleteAction?.label || 'Delete'}
            onClick={() => handleDelete(id, row)}
            showInMenu={false}
          />,
        );
      }

      // Add custom actions
      customActions.forEach((builder, index) => {
        const action = builder(params);
        if (action) {
          actions.push(<React.Fragment key={`custom-${index}`}>{action}</React.Fragment>);
        }
      });

      return actions;
    },
    [edit, deleteAction, customActions, handleEdit, handleDelete],
  );
}
