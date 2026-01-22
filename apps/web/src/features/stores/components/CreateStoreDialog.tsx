import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import { FormProvider, useForm } from 'react-hook-form';

import { useTranslation } from '@/hooks/useTranslation';

import { useCreateStore } from '../hooks';
import type { CreateStore } from '../types';
import { createStoreFormSchema } from '../validation.schema';

import { StoreForm, type StoreFormValues } from './StoreForm';

interface CreateStoreDialogProps {
  onClose: () => void;
}

export function CreateStoreDialog({ onClose }: CreateStoreDialogProps) {
  const createStore = useCreateStore();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(createStoreFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      address: '',
    },
  });

  const onSubmit = async (data: StoreFormValues) => {
    try {
      const createData: CreateStore = {
        name: data.name,
        address: data.address || undefined,
      };
      await createStore.mutateAsync(createData);
      enqueueSnackbar(t('stores.storeCreatedSuccess'), { variant: 'success' });
      form.reset();
      onClose();
    } catch {
      enqueueSnackbar(t('stores.storeCreateFailed'), { variant: 'error' });
    }
  };

  const onReset = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open onClose={onReset} maxWidth="sm" fullWidth data-testid="create-store-dialog">
      <DialogTitle data-testid="create-store-dialog-title">
        {t('stores.createNewStore')}
      </DialogTitle>
      <DialogContent>
        <FormProvider {...form}>
          <StoreForm
            id="create-store-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit(onSubmit)();
            }}
            onReset={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onReset();
            }}
          />
        </FormProvider>
      </DialogContent>
      <DialogActions>
        <Button
          form="create-store-form"
          type="reset"
          loadingPosition="start"
          loading={createStore.isPending}
          data-testid="create-store-dialog-cancel-button"
        >
          {t('common.cancel')}
        </Button>
        <Button
          form="create-store-form"
          type="submit"
          variant="contained"
          loadingPosition="start"
          loading={createStore.isPending}
          data-testid="create-store-dialog-submit-button"
        >
          {createStore.isPending ? t('common.creating') : t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
