import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import { FormProvider, useForm } from 'react-hook-form';

import { useTranslation } from '@/hooks/useTranslation';

import { useCreateProduct } from '../hooks';
import type { CreateProduct } from '../types';
import { createProductFormSchema } from '../validation.schemas';

import { ProductForm, type ProductFormValues } from './ProductForm';

interface CreateProductDialogProps {
  onClose: () => void;
}

export function CreateProductDialog({ onClose }: CreateProductDialogProps) {
  const createProduct = useCreateProduct();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(createProductFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      category: '',
      price: 0,
      stockQuantity: 0,
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const createData: CreateProduct = {
        name: data.name,
        category: data.category,
        price: data.price,
        stockQuantity: data.stockQuantity,
      };
      await createProduct.mutateAsync(createData);
      enqueueSnackbar(t('products.productCreatedSuccess'), { variant: 'success' });
      form.reset();
      onClose();
    } catch {
      enqueueSnackbar(t('products.productCreateFailed'), { variant: 'error' });
    }
  };

  const onReset = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open fullWidth onClose={onReset} maxWidth="sm" data-testid="create-product-dialog">
      <form onSubmit={form.handleSubmit(onSubmit)} onReset={onReset}>
        <DialogTitle data-testid="create-product-dialog-title">
          {t('products.createNewProduct')}
        </DialogTitle>
        <DialogContent>
          <FormProvider {...form}>
            <ProductForm />
          </FormProvider>
        </DialogContent>
        <DialogActions>
          <Button
            type="reset"
            loadingPosition="start"
            loading={createProduct.isPending}
            data-testid="create-product-dialog-cancel-button"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            loadingPosition="start"
            loading={createProduct.isPending}
            data-testid="create-product-dialog-submit-button"
          >
            {createProduct.isPending ? t('common.creating') : t('common.create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
