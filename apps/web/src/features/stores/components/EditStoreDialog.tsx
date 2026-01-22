import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useTranslation } from '@/hooks/useTranslation';

import { useUpdateStore, useStore } from '../hooks';
import type { UpdateStore } from '../types';
import { updateStoreFormSchema } from '../validation.schema';

import { StoreForm, type StoreFormValues } from './StoreForm';

interface EditStoreDialogProps {
  storeId: string;
  onClose: () => void;
}

export function EditStoreDialog({ storeId, onClose }: EditStoreDialogProps) {
  const { data: store } = useStore(storeId);
  const updateStore = useUpdateStore();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const formData = useMemo(() => {
    if (!store) return undefined;
    return {
      name: store.name,
      address: store.address || '',
    };
  }, [store]);

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(updateStoreFormSchema),
    defaultValues: {
      name: '',
      address: '',
    },
    values: formData,
  });

  const onSubmit = async (data: StoreFormValues) => {
    try {
      const updateData: UpdateStore = {
        name: data.name,
        address: data.address || undefined,
      };
      await updateStore.mutateAsync({ id: storeId, data: updateData });
      enqueueSnackbar(t('stores.storeUpdatedSuccess'), { variant: 'success' });
      onClose();
    } catch {
      enqueueSnackbar(t('stores.storeUpdateFailed'), { variant: 'error' });
    }
  };

  const onReset = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={true} onClose={onReset} data-testid="edit-store-dialog">
      <form onSubmit={form.handleSubmit(onSubmit)} onReset={onReset}>
        <DialogTitle data-testid="edit-store-dialog-title">{t('stores.editStore')}</DialogTitle>
        <DialogContent>
          <FormProvider {...form}>
            <StoreForm />
          </FormProvider>
        </DialogContent>
        <DialogActions>
          <Button
            type="reset"
            loadingPosition="start"
            loading={updateStore.isPending}
            data-testid="edit-store-dialog-cancel-button"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            loadingPosition="start"
            loading={updateStore.isPending}
            data-testid="edit-store-dialog-submit-button"
          >
            {updateStore.isPending ? t('common.updating') : t('common.update')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
