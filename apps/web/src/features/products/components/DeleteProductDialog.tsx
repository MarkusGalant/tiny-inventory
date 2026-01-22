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

import { useDeleteProduct } from '../hooks';

interface DeleteProductDialogProps {
  productId: string | null;
  onClose: () => void;
}

export function DeleteProductDialog({ productId, onClose }: DeleteProductDialogProps) {
  const deleteProduct = useDeleteProduct();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const form = useForm<{ confirm: boolean }>({
    defaultValues: {},
  });

  const onSubmit = async () => {
    if (productId) {
      try {
        await deleteProduct.mutateAsync({ id: productId });
        enqueueSnackbar(t('products.productDeletedSuccess'), { variant: 'success' });
        onClose();
      } catch {
        enqueueSnackbar(t('products.productDeleteFailed'), { variant: 'error' });
      }
    }
  };

  const onReset = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open onClose={onReset} data-testid="delete-product-dialog">
      <DialogTitle data-testid="delete-product-dialog-title">
        {t('products.deleteProduct')}
      </DialogTitle>
      <DialogContent>
        <FormProvider {...form}>
          <form
            id="delete-product-form"
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
            <Typography>{t('products.deleteProductConfirm')}</Typography>
          </form>
        </FormProvider>
      </DialogContent>
      <DialogActions>
        <Button
          form="delete-product-form"
          type="reset"
          variant="outlined"
          color="error"
          disabled={deleteProduct.isPending}
          data-testid="delete-product-dialog-cancel-button"
        >
          {t('common.cancel')}
        </Button>
        <Button
          form="delete-product-form"
          type="submit"
          variant="contained"
          color="error"
          disabled={deleteProduct.isPending}
          data-testid="delete-product-dialog-submit-button"
        >
          {deleteProduct.isPending ? t('common.deleting') : t('common.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
