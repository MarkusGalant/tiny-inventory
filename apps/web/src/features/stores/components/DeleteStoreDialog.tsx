import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { FormProvider, useForm } from 'react-hook-form';

import { useTranslation } from '@/hooks/useTranslation';

import { useDeleteStore } from '../hooks';

interface DeleteStoreDialogProps {
  storeId: string;
  onClose: () => void;
}

export function DeleteStoreDialog({ storeId, onClose }: DeleteStoreDialogProps) {
  const deleteStore = useDeleteStore();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const form = useForm<{ confirm: boolean }>({
    defaultValues: {},
  });

  const onSubmit = async () => {
    if (storeId) {
      try {
        await deleteStore.mutateAsync({ id: storeId });
        enqueueSnackbar(t('stores.storeDeletedSuccess'), { variant: 'success' });
        onClose();
      } catch {
        enqueueSnackbar(t('stores.storeDeleteFailed'), { variant: 'error' });
      }
    }
  };

  const onReset = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open onClose={onReset} data-testid="delete-store-dialog">
      <DialogTitle data-testid="delete-store-dialog-title">{t('stores.deleteStore')}</DialogTitle>
      <DialogContent>
        <FormProvider {...form}>
          <form
            id="delete-store-form"
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
          >
            <Typography>{t('stores.deleteStoreConfirm')}</Typography>
          </form>
        </FormProvider>
      </DialogContent>
      <DialogActions>
        <Button
          form="delete-store-form"
          type="reset"
          variant="outlined"
          color="error"
          disabled={deleteStore.isPending}
          data-testid="delete-store-dialog-cancel-button"
        >
          {t('common.cancel')}
        </Button>
        <Button
          form="delete-store-form"
          type="submit"
          variant="contained"
          color="error"
          disabled={deleteStore.isPending}
          data-testid="delete-store-dialog-submit-button"
        >
          {deleteStore.isPending ? t('common.deleting') : t('common.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
