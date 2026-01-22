import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useTranslation } from '@/hooks/useTranslation';

import { useUpdateProduct, useProduct } from '../hooks';
import type { UpdateProduct } from '../types';
import { updateProductFormSchema } from '../validation.schemas';

import { ProductForm, type ProductFormValues } from './ProductForm';

interface EditProductDialogProps {
  productId: string;
  onClose: () => void;
}

export function EditProductDialog({ productId, onClose }: EditProductDialogProps) {
  const { data: product } = useProduct(productId);
  const updateProduct = useUpdateProduct();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const formData = useMemo(() => {
    if (!product) return undefined;
    return {
      name: product.name,
      category: product.category,
      price: Number(product.price),
      stockQuantity: Number(product.stockQuantity),
    };
  }, [product]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(updateProductFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      category: '',
      price: 0,
      stockQuantity: 0,
    },
    values: formData,
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const updateData: UpdateProduct = {
        name: data.name,
        category: data.category,
        price: data.price,
      };
      await updateProduct.mutateAsync({ id: productId, data: updateData });
      enqueueSnackbar(t('products.productUpdatedSuccess'), { variant: 'success' });
      onClose();
    } catch {
      enqueueSnackbar(t('products.productUpdateFailed'), { variant: 'error' });
    }
  };

  const onReset = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open fullWidth maxWidth="sm" onClose={onReset} data-testid="edit-product-dialog">
      <form onSubmit={form.handleSubmit(onSubmit)} onReset={onReset}>
        <DialogTitle data-testid="edit-product-dialog-title">
          {t('products.editProduct')}
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
            loading={updateProduct.isPending}
            data-testid="edit-product-dialog-cancel-button"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            loadingPosition="start"
            loading={updateProduct.isPending}
            data-testid="edit-product-dialog-submit-button"
          >
            {updateProduct.isPending ? t('common.updating') : t('common.update')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
